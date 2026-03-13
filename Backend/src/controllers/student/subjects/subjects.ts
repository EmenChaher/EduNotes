import { Response } from 'express';
import { InternalErrorResponse, SuccessResponse } from '@core/ApiResponse';
import { NotFoundError } from '@core/ApiError';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import { ClassAggregation, IClass } from '@database/models/Class';

export const getStudentSubjectsCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const user = req?.user;
  if (!user?.class) {
    throw new NotFoundError('Student is not assigned to any class.');
  }

  // Handle both populated and non-populated class
  let classID: string;
  if (typeof user.class === 'string') {
    classID = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classID = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  const paginatedSubjects = await paginateSubjects(options, classID);

  new SuccessResponse('Student subject count retrieved successfully.', paginatedSubjects.docs.length).send(res);
});

export const getStudentSubjects = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const user = req?.user;
  if (!user?.class) {
    throw new NotFoundError('Student is not assigned to any class.');
  }

  // Handle both populated and non-populated class
  let classID: string;
  if (typeof user.class === 'string') {
    classID = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classID = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  const subjects = await paginateSubjects(options, classID);

  new SuccessResponse('Student subjects retrieved successfully.', subjects).send(res);
});

const paginateSubjects = async (
  options: {
    page: number;
    limit: number;
  },
  classID: string,
) => {
  const getSubjectsQuery = [
    {
      $match: {
        _id: new ObjectId(classID),
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'level',
        foreignField: 'level',
        as: 'subjects',
      },
    },
    {
      $unwind: '$subjects',
    },
    {
      $replaceRoot: {
        newRoot: '$subjects',
      },
    },
    {
      $match: {
        deletedAt: null,
      },
    },
  ];

  const aggregation = ClassAggregation.aggregate(getSubjectsQuery);
  return await ClassAggregation.aggregatePaginate<IClass>(aggregation, options);
};
