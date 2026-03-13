import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import authenticateUser from '@auth/authentication';
import {
  createNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@controllers/shared/notification/notification';
import authorizeUser from '@auth/authorization';
import { UserTypes } from '@database/models/User';

const router: Router = Router();

const getMyNotificationsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const markNotificationAsReadSchema = Joi.object({
  id: JoiObjectId().required(),
});

const createNotificationSchema = Joi.object({
  target: JoiObjectId().required(),
  message: Joi.string().required(),
  path: Joi.string(),
});

router.post(
  '/notification',
  authenticateUser,
  authorizeUser([UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.Teacher]),
  validateSchema(createNotificationSchema, ValidationSource.BODY),
  createNotification,
);

router.get('/me/notifications', authenticateUser, validateSchema(getMyNotificationsSchema, ValidationSource.QUERY), getNotifications);
router.patch(
  '/me/notifications/:id/mark-read',
  authenticateUser,
  validateSchema(markNotificationAsReadSchema, ValidationSource.PARAM),
  markNotificationAsRead,
);

router.patch('/me/notifications/mark-all-read', authenticateUser, markAllNotificationsAsRead);

export default router;
