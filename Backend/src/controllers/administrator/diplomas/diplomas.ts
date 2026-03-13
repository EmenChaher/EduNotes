import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Diploma, { IDiploma } from '@database/models/Diploma';
import expressAsyncHandler from 'express-async-handler';
import StudyField from '@database/models/StudyField';
import { ObjectId } from 'mongodb';

export const createDiploma = expressAsyncHandler(async (req: Request, res: Response) => {
  const { label, type } = req.body;

  const existingDiploma = await Diploma.findOne({ label, deletedAt: null });
  if (existingDiploma) throw new ForbiddenError('A diploma with the same name already exists.');

  const newDiploma: IDiploma = new Diploma({ label, type });

  await newDiploma.save();

  new SuccessResponse('Diploma has been successfully created.', { diploma: newDiploma }).send(res);
});

export const updateDiploma = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, type } = req.body;

  const updateFields: Record<string, string> = {};

  if (label !== undefined) {
    updateFields.label = label;
  }
  if (type !== undefined) {
    updateFields.type = type;
  }

  const updatedDiploma = await Diploma.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedDiploma) {
    throw new NotFoundError('No diploma found with that ID.');
  }

  new SuccessResponse('Diploma has been successfully updated.', { diploma: updatedDiploma }).send(res);
});

export const deleteDiploma = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const diploma = await Diploma.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!diploma) throw new NotFoundError('No diploma found with that ID.');

  new SuccessResponse('Diploma has been successfully deleted.').send(res);
});

export const getAllDiplomas = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  let findAllQuery = Diploma.find({ deletedAt: null });

  const paginatedDiplomas = await Diploma.paginate(findAllQuery, options);

  new SuccessResponse('Diplomas retrieved successfully.', paginatedDiplomas).send(res);
});

export const getDiplomaRelatedData = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const relatedData = await StudyField.aggregate([
    {
      $match: {
        diploma: new ObjectId(id),
        deletedAt: {
          $eq: null,
        },
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: '_id',
        foreignField: 'studyField',
        as: 'levels',
      },
    },
    {
      $unwind: '$levels',
    },
    {
      $match: {
        'levels.deletedAt': {
          $eq: null,
        },
      },
    },
    {
      $lookup: {
        from: 'classes',
        let: {
          levelId: '$levels._id',
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
          levelId: '$levels._id',
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
    {
      $group: {
        _id: '$_id',
        diploma: {
          $first: '$diploma',
        },
        label: {
          $first: '$label',
        },
        levels: {
          $push: {
            _id: '$levels._id',
            label: '$levels.label',
            classes: '$classes',
            units: '$units',
          },
        },
      },
    },
  ]);

  new SuccessResponse('Diplomas related data retrieved successfully.', { studyFields: relatedData }).send(res);
});
