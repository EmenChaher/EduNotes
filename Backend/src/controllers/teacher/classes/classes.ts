import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { ITeaching, TeachingAgreggation } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import Class from '@database/models/Class';
import { NotFoundError } from '@core/ApiError';

export const getTeacherClassCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const user = req?.user;

  const paginatedClasses = await paginateClasses(options, user?.id);

  new SuccessResponse('Teacher class count retrieved successfully.', paginatedClasses.docs.length).send(res);
});

export const getTeacherClasses = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const user = req?.user;

  const paginatedClasses = await paginateClasses(options, user?.id);

  new SuccessResponse('Teacher classes retrieved successfully.', paginatedClasses).send(res);
});

const paginateClasses = async (
  options: {
    page: number;
    limit: number;
  },
  teacherID: string,
) => {
  const getClassesQuery = [
    {
      $match: {
        teacher: new ObjectId(teacherID),
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: {
          class: '$class',
          subject: '$subject',
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $group: {
        _id: '$_id.class',
        subject_count: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'class',
      },
    },
    {
      $unwind: {
        path: '$class',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'class',
        as: 'students',
      },
    },
    {
      $set: {
        'class.subject_count': '$subject_count',
      },
    },
    {
      $set: {
        'class.student_count': {
          $size: {
            $filter: {
              input: '$students',
              as: 'student',
              cond: {
                $or: [{ $eq: ['$$student.deletedAt', null] }, { $not: ['$$student.deletedAt'] }],
              },
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: '$class',
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'level',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $unwind: '$level',
    },
    {
      $lookup: {
        from: 'study_fields',
        localField: 'level.studyField',
        foreignField: '_id',
        as: 'level.studyField',
      },
    },
    {
      $unwind: '$level.studyField',
    },
    {
      $lookup: {
        from: 'diplomas',
        localField: 'level.studyField.diploma',
        foreignField: '_id',
        as: 'level.studyField.diploma',
      },
    },
    {
      $unwind: '$level.studyField.diploma',
    },
    {
      $sort: {
        'level.studyField.createdAt': 1 as const,
        'level.label': 1 as const,
        label: 1 as const,
      },
    },
  ];

  const aggregation = TeachingAgreggation.aggregate(getClassesQuery);
  return await TeachingAgreggation.aggregatePaginate<ITeaching>(aggregation, options);
};

export const getClassNameFromId = async (classID: string) => {
  const classExists = await Class.exists({ _id: classID, deletedAt: null });
  if (!classExists) throw new NotFoundError('Invalid class ID.');

  const getClassNameQuery = [
    {
      $match: {
        _id: new ObjectId(classID),
        deletedAt: null,
      },
    },
    {
      $project: {
        level: 1,
        label: 1,
        _id: 0,
      },
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'level',
        foreignField: '_id',
        as: 'level',
      },
    },
    {
      $unwind: '$level',
    },
    {
      $lookup: {
        from: 'study_fields',
        localField: 'level.studyField',
        foreignField: '_id',
        as: 'level.studyField',
      },
    },
    {
      $unwind: '$level.studyField',
    },
    {
      $lookup: {
        from: 'diplomas',
        localField: 'level.studyField.diploma',
        foreignField: '_id',
        as: 'level.studyField.diploma',
      },
    },
    {
      $unwind: '$level.studyField.diploma',
    },
    {
      $addFields: {
        className: {
          $concat: [
            {
              $toString: '$level.label',
            },
            ' ',
            {
              $toString: '$level.studyField.acronym',
            },
            ' ',
            {
              $toString: '$label',
            },
          ],
        },
      },
    },
    {
      $project: {
        className: 1,
        _id: 0,
      },
    },
  ];

  const classNameResult = await Class.aggregate(getClassNameQuery);
  return classNameResult[0].className;
};
