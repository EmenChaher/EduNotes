import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import Notification from '@database/models/Notification';
import { NotFoundError } from '@core/ApiError';
import User from '@database/models/User';
import socketServer from '@socket/index';

export const getNotifications = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const user = req?.user;
  const findNotificationsQuery = Notification.find({ target: user?.id }).populate('source', 'name surname').sort({ createdAt: -1 });
  const paginatedNotifications = await Notification.paginate(findNotificationsQuery, options);
  const totalUnreadNotifications = await Notification.countDocuments({ target: user?.id, read: false });

  new SuccessResponse('Notifications have been retrieved successfully.', {
    unread_count: totalUnreadNotifications,
    notifications: paginatedNotifications,
  }).send(res);
});

export const markNotificationAsRead = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req?.user;
  const notification = await Notification.findOne({ _id: id, target: user?.id });
  if (!notification) {
    throw new NotFoundError('Notification not found.');
  }
  notification.read = true;
  await notification.save();
  new SuccessResponse('Notification marked as read successfully.', notification).send(res);
});

export const markAllNotificationsAsRead = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;

  await Notification.updateMany({ target: user?.id }, { $set: { read: true } });

  new SuccessResponse('All notifications marked as read successfully.').send(res);
});

export const createNotification = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { target, message, path } = req.body;
  const user = req?.user;

  const targetExists = User.exists({ _id: target });
  if (!targetExists) throw new NotFoundError('Invalid target user ID.');

  const newNotification = new Notification({ source: user?.id, target, message, path });

  await newNotification.save();

  await newNotification.populate('source', 'name surname');

  socketServer.to(`user_${target}`).emit('notification', newNotification);

  new SuccessResponse('Notification created successfuly.').send(res);
});
