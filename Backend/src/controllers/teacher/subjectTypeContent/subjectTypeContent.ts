import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import Teaching, { TeachingType } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Subject, { ISubject } from '@database/models/Subject';
import { getClassNameFromId } from '../classes/classes';
import { ISubjectGrading } from '@database/models/SubjectGrading';

async function getTeacherSubjectTypeInfo(classId: string, subjectId: string, subjectType: string, user: any) {
  const className = await getClassNameFromId(classId);

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const teachingExists = await Teaching.findOne({ class: classId, subject: subjectId, type: subjectType, deletedAt: null }).populate({
    path: 'subject',
    populate: { path: 'grading' },
  });
  if (!teachingExists) throw new NotFoundError('No teaching exists with provided params.');

  if (teachingExists && teachingExists.teacher.toString() !== user?.id) throw new ForbiddenError('You are not teaching this subject.');

  const gradingComponents = {} as any;
  const subjectGrading = (teachingExists.subject as ISubject).grading as ISubjectGrading;

  if (subjectType === TeachingType.Lecture) {
    if (subjectGrading.supervisedAssessment1 !== undefined) {
      gradingComponents.supervisedAssessment1 = subjectGrading.supervisedAssessment1;
    }
    if (subjectGrading.supervisedAssessment2 !== undefined) {
      gradingComponents.supervisedAssessment2 = subjectGrading.supervisedAssessment2;
    }
    if (subjectGrading.exam !== undefined) {
      gradingComponents.exam = subjectGrading.exam;
    }
  } else if (subjectType === TeachingType.GuidedSession) {
    if (subjectGrading.other !== undefined) {
      gradingComponents.other = subjectGrading.other;
    }
  } else if (subjectType === TeachingType.PracticalSession) {
    if (subjectGrading.practical !== undefined) {
      gradingComponents.practical = subjectGrading.practical;
    }
  }

  return {
    className,
    subjectType: subjectType,
    subjectName: subjectExists.label,
    contents: gradingComponents,
  };
}

export const getTeacherSubjectTypeContentCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, subjectType } = req?.params;
  const user = req?.user;

  const {
    className,
    subjectType: type,
    subjectName,
    contents,
  } = await getTeacherSubjectTypeInfo(classId as string, subjectId as string, subjectType as string, user);

  const total = Object.keys(contents).length;

  new SuccessResponse('Teacher class subject type content count retrieved successfully.', {
    className,
    subjectType: type,
    subjectName,
    total,
  }).send(res);
});

export const getTeacherSubjectTypeContent = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, subjectType } = req?.params;
  const user = req?.user;

  const {
    className,
    subjectType: type,
    subjectName,
    contents,
  } = await getTeacherSubjectTypeInfo(classId as string, subjectId as string, subjectType as string, user);

  new SuccessResponse('Teacher class subject type contents retrieved successfully.', {
    className,
    subjectType: type,
    subjectName,
    contents,
  }).send(res);
});
