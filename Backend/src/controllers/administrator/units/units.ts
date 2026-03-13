import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Unit, { IUnit } from '@database/models/Unit';
import expressAsyncHandler from 'express-async-handler';
import Level from '@database/models/Level';

export const createUnit = expressAsyncHandler(async (req: Request, res: Response) => {
  const { label, level } = req.body;

  const levelExists = await Level.findOne({ _id: level });
  if (!levelExists) throw new ForbiddenError('Invalid level ID.');

  const newUnit: IUnit = new Unit({ label, level });

  await newUnit.save();

  await newUnit.populate({
    path: 'level',
    populate: { path: 'studyField', populate: { path: 'diploma' } },
  });

  new SuccessResponse('Unit has been successfully created.', { unit: newUnit }).send(res);
});

export const updateUnit = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label } = req.body;

  const updatedUnit = await Unit.findByIdAndUpdate(id, { label }, { new: true });

  if (!updatedUnit) {
    throw new NotFoundError('No unit found with that ID.');
  }

  await updatedUnit.populate({
    path: 'level',
    populate: { path: 'studyField', populate: { path: 'diploma' } },
  });

  new SuccessResponse('Unit has been successfully updated.', { unit: updatedUnit }).send(res);
});

export const deleteUnit = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const unitToDelete = await Unit.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!unitToDelete) throw new NotFoundError('No unit found with that ID.');

  new SuccessResponse('Unit has been successfully deleted.').send(res);
});

export const getLevelUnits = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const levelExists = await Level.findOne({ _id: id });
  if (!levelExists) throw new ForbiddenError('Invalid level ID.');

  const levelUnits = await Unit.find({ level: id, deletedAt: null })
    .sort({ level: 1, label: 1 })
    .populate({
      path: 'level',
      populate: { path: 'studyField', populate: { path: 'diploma' } },
    });

  new SuccessResponse('Units retrieved successfully.', levelUnits).send(res);
});

export const getAllUnits = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = Unit.find({ deletedAt: null })
    .sort({ level: 1, label: 1 })
    .populate({
      path: 'level',
      populate: { path: 'studyField', populate: { path: 'diploma' } },
    });
  const paginatedUnits = await Unit.paginate(findAllQuery, options);

  new SuccessResponse('Units retrieved successfully.', paginatedUnits).send(res);
});
