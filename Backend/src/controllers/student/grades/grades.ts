import { Response } from 'express';
import { InternalErrorResponse, SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import Teaching, { ITeaching, TeachingType } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { NotFoundError } from '@core/ApiError';
import Subject from '@database/models/Subject';
import { IClass } from '@database/models/Class';
import { SubjectContent, subjectContentDictionary } from '@database/models/SubjectGrading';
import aggregateStudentGrades from './aggregation';
import Grade from '@database/models/Grade';
import { IGradeReport } from '@database/models/GradeReport';
import { IUser } from '@database/models/User';
import { getClassNameFromId } from '../../teacher/classes/classes';
import Notification from '@database/models/Notification';
import socketServer from '@socket/index';
import { ObjectId } from 'mongodb';

const SubjectTypeGradingContent = {
  [TeachingType.Lecture]: [SubjectContent.supervisedAssessment1, SubjectContent.supervisedAssessment2, SubjectContent.exam],
  [TeachingType.GuidedSession]: [SubjectContent.other],
  [TeachingType.PracticalSession]: [SubjectContent.practical],
};

export const getGrades = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { subjectId } = req?.params;

  const user = req?.user;
  if (!user?.class) {
    throw new NotFoundError('Student is not assigned to any class.');
  }

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null }).populate('grading');
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const teachingExists = await Teaching.exists({ subject: subjectId, deletedAt: null });
  if (!teachingExists) {
    throw new NotFoundError('No teaching found for this subject.');
  }

  // Handle both populated and non-populated class
  let classId: string;
  if (typeof user.class === 'string') {
    classId = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classId = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  const grades = await aggregateStudentGrades({ subjectId, classId, userCin: user?.cin });

  new SuccessResponse('Student subject grades retrieved successfully.', {
    subjectName: subjectExists.label,
    grades,
  }).send(res);
});

export const flagGrade = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { gradeId } = req?.params;

  const user = req?.user;
  if (!user?.class) {
    throw new NotFoundError('Student is not assigned to any class.');
  }

  const grade = await Grade.findOne({ _id: gradeId, deletedAt: null }).populate({
    path: 'report',
    populate: { path: 'teaching', populate: { path: 'teacher' } },
  });

  if (!grade) throw new NotFoundError('No grade found with that ID.');

  // Handle both populated and non-populated class
  let classId: string;
  if (typeof user.class === 'string') {
    classId = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classId = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  const teacherId = (((grade?.report as IGradeReport)?.teaching as ITeaching)?.teacher as IUser)?._id;

  if (teacherId) {
    const className = await getClassNameFromId(classId as string);
    const newNotification = new Notification({
      source: user?.id,
      target: teacherId,
      message: `${user?.surname} ${user?.name} a réclamé une erreur dans sa note de ${
        subjectContentDictionary[(grade.report as IGradeReport).type as SubjectContent]
      }. Veuillez la vérifier pour la classe ${className}.`,
    });

    await newNotification.save();

    await newNotification.populate('source', 'name surname');

    socketServer.to(`user_${teacherId}`).emit('notification', newNotification);
  }

  new SuccessResponse('Grade has been successfully flagged.').send(res);
});
