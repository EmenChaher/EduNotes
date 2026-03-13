import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import StudyField, { IStudyField } from '@database/models/StudyField';
import expressAsyncHandler from 'express-async-handler';
import Level from '@database/models/Level';
import { ObjectId } from 'mongodb';

export const createStudyField = expressAsyncHandler(async (req: Request, res: Response) => {
  const { label, acronym, diploma } = req.body;

  const existingStudyField = await StudyField.findOne({ label, deletedAt: null });
  if (existingStudyField) throw new ForbiddenError('A study field with the same name already exists.');

  const newStudyField: IStudyField = new StudyField({ label, acronym, diploma });

  await newStudyField.save();

  await newStudyField.populate('diploma');

  new SuccessResponse('Study field has been successfully created.', { studyField: newStudyField }).send(res);
});

export const updateStudyField = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, acronym, diploma } = req.body;

  const updateFields: Record<string, string> = {};

  if (label !== undefined) {
    updateFields.label = label;
  }
  if (acronym !== undefined) {
    updateFields.acronym = acronym;
  }
  if (diploma !== undefined) {
    updateFields.diploma = diploma;
  }

  const updatedStudyField = await StudyField.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedStudyField) {
    throw new NotFoundError('No study field found with that ID.');
  }

  await updatedStudyField.populate('diploma');

  new SuccessResponse('Study field has been successfully updated.', { studyField: updatedStudyField }).send(res);
});

export const deleteStudyField = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const studyField = await StudyField.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!studyField) throw new NotFoundError('No study field found with that ID.');

  new SuccessResponse('Study field has been successfully deleted.').send(res);
});

export const getAllStudyFields = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = StudyField.find({ deletedAt: null }).populate('diploma');

  const paginatedStudyFields = await StudyField.paginate(findAllQuery, options);

  new SuccessResponse('Study fields retrieved successfully.', paginatedStudyFields).send(res);
});

export const getStudyFieldRelatedData = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const studyFieldRelatedData = await Level.aggregate([
    {
      $match: {
        studyField: new ObjectId(id),
        deletedAt: {
          $eq: null,
        },
      },
    },
    {
      $lookup: {
        from: 'classes',
        let: {
          levelId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$level', '$$levelId'],
                  },
                  {
                    $eq: ['$deletedAt', null],
                  },
                ],
              },
            },
          },
        ],
        as: 'classes',
      },
    },
    {
      $lookup: {
        from: 'units',
        let: {
          levelId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$level', '$$levelId'],
                  },
                  {
                    $eq: ['$deletedAt', null],
                  },
                ],
              },
            },
          },
        ],
        as: 'units',
      },
    },
  ]);

  new SuccessResponse('Study field related data retrieved successfully.', { levels: studyFieldRelatedData }).send(res);
});
