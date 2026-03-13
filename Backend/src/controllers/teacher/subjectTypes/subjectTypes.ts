import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import Teaching, { ITeaching, TeachingAgreggation } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@core/ApiError';
import Subject from '@database/models/Subject';
import { getClassNameFromId } from '../classes/classes';

export const getSubjectTypesCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const { classId, subjectId } = req?.params;
  const user = req?.user;

  const className = await getClassNameFromId(classId as string);

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const paginatedSubjectTypes = await paginateSubjectTypes(options, classId as string, subjectId as string, user?.id);

  new SuccessResponse('Teacher class subject types count retrieved successfully.', {
    className,
    subjectName: subjectExists.label,
    total: paginatedSubjectTypes.docs.length,
  }).send(res);
});

export const getTeacherSubjectTypes = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const { classId, subjectId } = req?.params;
  const user = req?.user;

  const className = await getClassNameFromId(classId as string);

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const paginatedSubjectTypes = await paginateSubjectTypes(options, classId as string, subjectId as string, user?.id);

  new SuccessResponse('Teacher class subject types retrieved successfully.', {
    className,
    subjectName: subjectExists.label,
    types: paginatedSubjectTypes,
  }).send(res);
});

const paginateSubjectTypes = async (
  options: {
    page: number;
    limit: number;
  },
  classID: string,
  subjectID: string,
  teacherID: string,
) => {
  const classSubjectTeacherExists = await Teaching.exists({ subject: subjectID, teacher: teacherID, class: classID, deletedAt: null });
  if (!classSubjectTeacherExists) throw new NotFoundError('You are not teaching this subject.');

  const getSubjectTypesQuery = [
    {
      $match: {
        teacher: new ObjectId(teacherID),
        class: new ObjectId(classID),
        subject: new ObjectId(subjectID),
        deletedAt: null,
      },
    },
    {
      $project: {
        type: 1,
        _id: 0,
      },
    },
  ];

  const aggregation = TeachingAgreggation.aggregate(getSubjectTypesQuery);
  return await TeachingAgreggation.aggregatePaginate<ITeaching>(aggregation, options);
};
