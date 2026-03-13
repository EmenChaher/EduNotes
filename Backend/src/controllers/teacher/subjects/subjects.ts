import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import Teaching, { ITeaching, TeachingAgreggation } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import Class from '@database/models/Class';
import { NotFoundError } from '@core/ApiError';
import { getClassNameFromId } from '../classes/classes';

export const getTeacherClassSubjectCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const { classId } = req?.params;
  const user = req?.user;

  const paginatedSubjects = await paginateSubjects(options, classId as string, user?.id);

  const className = await getClassNameFromId(classId as string);

  new SuccessResponse('Teacher class subject count retrieved successfully.', { className, total: paginatedSubjects.docs.length }).send(res);
});

export const getTeacherClassSubjects = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const { classId } = req?.params;
  const user = req?.user;

  const paginatedSubjects = await paginateSubjects(options, classId as string, user?.id);

  const className = await getClassNameFromId(classId as string);

  new SuccessResponse('Teacher class subjects retrieved successfully.', { className, subjects: paginatedSubjects }).send(res);
});

const paginateSubjects = async (
  options: {
    page: number;
    limit: number;
  },
  classID: string,
  teacherID: string,
) => {
  const classExists = await Class.exists({ _id: classID, deletedAt: null });
  if (!classExists) throw new NotFoundError('Invalid class ID.');

  const classTeacherExists = await Teaching.exists({ teacher: teacherID, class: classID, deletedAt: null });
  if (!classTeacherExists) throw new NotFoundError('You are not teaching this class.');

  const getSubjectsQuery = [
    {
      $match: {
        teacher: new ObjectId(teacherID),
        class: new ObjectId(classID),
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: '$subject',
        types: {
          $push: '$type',
        },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject',
      },
    },
    {
      $unwind: {
        path: '$subject',
      },
    },
    {
      $addFields: {
        'subject.types': '$types',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$subject',
      },
    },
  ];

  const aggregation = TeachingAgreggation.aggregate(getSubjectsQuery);
  return await TeachingAgreggation.aggregatePaginate<ITeaching>(aggregation, options);
};
