import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Level, { ILevel, findHighestLabel } from '@database/models/Level';
import expressAsyncHandler from 'express-async-handler';
import StudyField from '@database/models/StudyField';
import Class from '@database/models/Class';
import { ObjectId } from 'mongodb';
import Unit from '@database/models/Unit';

export const createLevel = expressAsyncHandler(async (req: Request, res: Response) => {
  const { studyField } = req.body;

  const studyFieldExists = await StudyField.findOne({ _id: studyField });
  if (!studyFieldExists) throw new ForbiddenError('Invalid study field ID.');

  const newLevel: ILevel = new Level({ studyField });

  await newLevel.save();

  await newLevel.populate({
    path: 'studyField',
    populate: { path: 'diploma' },
  });

  new SuccessResponse('Level has been successfully created.', { level: newLevel }).send(res);
});

export const deleteLevel = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const studyField = await Level.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!studyField) throw new NotFoundError('No level found with that ID.');

  new SuccessResponse('Level has been successfully deleted.').send(res);
});

export const getAllLevels = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = Level.find({ deletedAt: null })
    .sort({ studyField: 1, label: 1 })
    .populate({
      path: 'studyField',
      populate: { path: 'diploma' },
    });
  const paginatedLevels = await Level.paginate(findAllQuery, options);

  new SuccessResponse('Levels retrieved successfully.', paginatedLevels).send(res);
});

export const getNextLevel = expressAsyncHandler(async (req: Request, res: Response) => {
  const { studyField } = req.params;
  const studyFieldExists = await StudyField.findOne({ _id: studyField });
  if (!studyFieldExists) throw new ForbiddenError('Invalid study field ID.');

  const nextLevel = (await findHighestLabel(studyField)) + 1;

  new SuccessResponse('Next level successfully.', { nextLevel }).send(res);
});

export const getLevelRelatedData = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const classes = await Class.find({ level: id, deletedAt: null });
  const units = await Unit.find({ level: id, deletedAt: null });

  new SuccessResponse('Level related data retrieved successfully.', { classes, units }).send(res);
});
