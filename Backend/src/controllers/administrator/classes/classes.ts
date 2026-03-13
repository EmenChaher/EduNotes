import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Class, { IClass, findHighestLabel } from '@database/models/Class';
import expressAsyncHandler from 'express-async-handler';
import Level from '@database/models/Level';

export const createClass = expressAsyncHandler(async (req: Request, res: Response) => {
  const { level } = req.body;

  const levelExists = await Level.findOne({ _id: level });
  if (!levelExists) throw new ForbiddenError('Invalid level ID.');

  const newClass: IClass = new Class({ level });

  await newClass.save();

  await newClass.populate({
    path: 'level',
    populate: { path: 'studyField', populate: { path: 'diploma' } },
  });

  new SuccessResponse('Class has been successfully created.', { class: newClass }).send(res);
});

export const deleteClass = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const classToDelete = await Class.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!classToDelete) throw new NotFoundError('No class found with that ID.');

  new SuccessResponse('Class has been successfully deleted.').send(res);
});

export const getAllClasses = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = Class.find({ deletedAt: null })
    .sort({ level: 1, label: 1 })
    .populate({
      path: 'level',
      populate: { path: 'studyField', populate: { path: 'diploma' } },
    });
  const paginatedClasses = await Class.paginate(findAllQuery, options);

  new SuccessResponse('Classes retrieved successfully.', paginatedClasses).send(res);
});

export const getNextClass = expressAsyncHandler(async (req: Request, res: Response) => {
  const { level } = req.params;
  const levelExists = await Level.findOne({ _id: level });
  if (!levelExists) throw new ForbiddenError('Invalid level ID.');

  const nextClass = (await findHighestLabel(level)) + 1;

  new SuccessResponse('Next class successfully.', { nextClass }).send(res);
});
