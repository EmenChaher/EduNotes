import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import Teaching, { ITeaching } from '@database/models/Teaching';
import { AuthRequest } from '@auth/authentication';
import { BadRequestError, ForbiddenError, NotFoundError } from '@core/ApiError';
import Subject from '@database/models/Subject';
import { getClassNameFromId } from '../classes/classes';
import GradeReport, { IGradeReport } from '@database/models/GradeReport';
import Grade from '@database/models/Grade';
import User, { UserTypes } from '@database/models/User';
import { ObjectId } from 'mongodb';
import Notification from '@database/models/Notification';
import { SubjectContent, subjectContentDictionary } from '@database/models/SubjectGrading';
import socketServer from '@socket/index';

export const getGrades = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, subjectType, subjectContent } = req?.params;
  const user = req?.user;

  const className = await getClassNameFromId(classId);

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const teachingExists = await Teaching.findOne({ class: classId, subject: subjectId, type: subjectType, deletedAt: null }).populate({
    path: 'subject',
    populate: { path: 'grading' },
  });
  if (!teachingExists) throw new NotFoundError('No teaching exists with provided params.');

  if (teachingExists && teachingExists.teacher.toString() !== user?.id) throw new ForbiddenError('You are not teaching this subject.');

  const data = await GradeReport.aggregate([
    {
      $match: {
        teaching: new ObjectId(teachingExists._id as unknown as string),
        type: subjectContent,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        let: {
          reportId: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$report', '$$reportId'],
                  },
                  {
                    $eq: ['$deletedAt', null],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'student',
              foreignField: 'cin',
              as: 'studentData',
            },
          },
          {
            $set: {
              student: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: '$studentData',
                      },
                      0,
                    ],
                  },
                  then: {
                    $arrayElemAt: ['$studentData', 0],
                  },
                  else: '$student',
                },
              },
            },
          },
          {
            $project: {
              studentData: 0,
            },
          },
        ],
        as: 'grades',
      },
    },
  ]);

  new SuccessResponse('Teacher class subject type contents grades retrieved successfully.', {
    className,
    subjectName: subjectExists.label,
    ...(data && data.length > 0 && data[0]._id && { report: data[0]._id }),
    grades: data && data.length > 0 && data[0].grades ? data[0].grades : [],
  }).send(res);
});

interface IGrade {
  id: string;
  grade: number | string;
}

export const createGrades = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, subjectId, subjectType, subjectContent } = req?.params;
  const { grades }: { grades: IGrade[] } = req?.body;
  const user = req?.user;

  grades.forEach((grade) => {
    // Normalize CIN for each grade
    if (grade.id !== undefined && grade.id !== null) {
      grade.id = grade.id.toString().trim();
    }
    if (typeof grade.grade === 'string' && !isNaN(Number(grade.grade))) {
      let numericGrade = Number(grade.grade);

      if (numericGrade < 0 || numericGrade > 20 || numericGrade % 0.25 !== 0) {
        throw new BadRequestError(`Grade '${grade.grade}' is invalid. Must be between 0 and 20 and a multiple of 0.25.`);
      }

      grade.grade = numericGrade;
    }
  });

  const subjectExists = await Subject.findOne({ _id: subjectId, deletedAt: null });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const teachingExists = await Teaching.findOne({ class: classId, subject: subjectId, type: subjectType, deletedAt: null }).populate({
    path: 'subject',
    populate: { path: 'grading' },
  });
  if (!teachingExists) throw new NotFoundError('No teaching exists with provided params.');

  if (teachingExists && teachingExists.teacher.toString() !== user?.id) throw new ForbiddenError('You are not teaching this subject.');

  const existingReport = await GradeReport.findOne({ teaching: teachingExists._id, type: subjectContent, deletedAt: null });
  if (existingReport) throw new BadRequestError('Cannot insert duplicate GradeReport for the same teaching.');

  await Promise.all(
    grades.map(async (grade) => {
      const student = await User.findOne({ cin: grade.id, deletedAt: null });
      if (student) {
        if (student?.type !== UserTypes.Student) {
          throw new BadRequestError(`User with CIN '${grade.id}' is not a student.`);
        }
        if (student?.class && student?.class.toString() !== classId) {
          throw new BadRequestError(`User with CIN '${grade.id}' is part of another class.`);
        }
      }
    }),
  );

  const newGradeReport = new GradeReport({ teaching: teachingExists._id, type: subjectContent });
  await newGradeReport.save();
  await newGradeReport.populate({ path: 'teaching' });

  const parsedGrades = grades.map((grade) => {
    return {
      report: newGradeReport._id,
      student: grade.id,
      value: grade.grade,
    };
  });

  await Grade.insertMany(parsedGrades);

  await Promise.all(
    grades.map(async (grade) => {
      const student = await User.findOne({ cin: grade.id });
      if (student) {
        const className = await getClassNameFromId((newGradeReport.teaching as ITeaching).class as string);
        const studentId = student?._id;
        const newNotification = new Notification({
          source: user?.id,
          target: studentId,
          message: `${user?.surname} ${user?.name} a publié les résultats de ${
            subjectContentDictionary[newGradeReport.type as SubjectContent]
          } pour la classe ${className}.`,
        });

        await newNotification.save();

        await newNotification.populate('source', 'name surname');

        socketServer.to(`user_${studentId}`).emit('notification', newNotification);
      }
    }),
  );

  new SuccessResponse('Grades created successfuly successfully.').send(res);
});

export const createGrade = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;
  const { cin, value } = req.body;
  const user = req?.user;

  const gradeReport = await GradeReport.findOne({ _id: reportId, deletedAt: null }).populate({ path: 'teaching' });

  if (!gradeReport) throw new NotFoundError('No grade report found with that ID.');

  // Normalize CIN before using it
  let normalizedCin = cin !== undefined && cin !== null ? cin.toString().trim() : cin;

  const gradeExists = await Grade.exists({ report: reportId, student: normalizedCin, deletedAt: null });
  if (gradeExists) throw new ForbiddenError('This student already has a grade.');

  if (gradeReport && (gradeReport as IGradeReport).teaching && ((gradeReport as IGradeReport).teaching as ITeaching).teacher.toString() !== user?.id)
    throw new ForbiddenError('You cannot create a grade for a class that you do not teach.');

  const studentUser = await User.findOne({ cin: normalizedCin, deletedAt: null });

  if (studentUser && studentUser.type !== UserTypes.Student) throw new BadRequestError(`User with CIN '${normalizedCin}' is not a student.`);

  const newGrade = new Grade({ report: reportId, student: normalizedCin, value });
  await newGrade.save();

  await newGrade.populate({
    path: 'report',
    populate: { path: 'teaching' },
  });

  const gradeWithPopulatedStudent = newGrade.toObject();
  if (studentUser) {
    // Overwrite student field with full student object for consistency with bulk add
    (gradeWithPopulatedStudent as any).student = {
      cin: studentUser.cin,
      name: studentUser.name,
      surname: studentUser.surname,
      email: studentUser.email,
      gender: studentUser.gender,
      phone: studentUser.phone,
      birthdate: studentUser.birthdate,
      region: studentUser.region,
      class: studentUser.class,
      // add other fields as needed
    };
    const className = await getClassNameFromId(((newGrade.report as IGradeReport).teaching as ITeaching).class as string);
    const studentId = studentUser?._id;
    const newNotification = new Notification({
      source: user?.id,
      target: studentId,
      message: `${user?.surname} ${user?.name} a ajouté votre note de ${
        subjectContentDictionary[(newGrade.report as IGradeReport).type as SubjectContent]
      } pour la classe ${className}.`,
    });

    await newNotification.save();

    await newNotification.populate('source', 'name surname');

    socketServer.to(`user_${studentId}`).emit('notification', newNotification);
  }

  new SuccessResponse('Grade has been successfully created.', gradeWithPopulatedStudent).send(res);
});

export const updateGrade = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { value } = req.body;
  const user = req?.user;

  const grade = await Grade.findOne({ _id: id, deletedAt: null }).populate({
    path: 'report',
    populate: { path: 'teaching' },
  });

  if (!grade) throw new NotFoundError('No grade found with that ID.');

  if (
    grade &&
    grade.report &&
    (grade.report as IGradeReport).teaching &&
    ((grade.report as IGradeReport).teaching as ITeaching).teacher.toString() !== user?.id
  )
    throw new ForbiddenError('You cannot change a grade of a class that you do not teach.');

  const updatedGrade = await Grade.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { value } }, { new: true });

  const gradeStudent = await User.findOne({ cin: updatedGrade?.student, deletedAt: null });
  if (gradeStudent) {
    const className = await getClassNameFromId(((grade.report as IGradeReport).teaching as ITeaching).class as string);
    const studentId = gradeStudent?._id;
    const newNotification = new Notification({
      source: user?.id,
      target: studentId,
      message: `${user?.surname} ${user?.name} a modifié votre note de ${
        subjectContentDictionary[(grade.report as IGradeReport).type as SubjectContent]
      } pour la classe ${className}.`,
    });

    await newNotification.save();

    await newNotification.populate('source', 'name surname');

    socketServer.to(`user_${studentId}`).emit('notification', newNotification);
  }

  new SuccessResponse('Grade has been successfully updated.').send(res);
});

export const deleteGrade = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req?.user;

  const grade = await Grade.findOne({ _id: id, deletedAt: null }).populate({
    path: 'report',
    populate: { path: 'teaching' },
  });

  if (!grade) throw new NotFoundError('No grade found with that ID.');

  if (
    grade &&
    grade.report &&
    (grade.report as IGradeReport).teaching &&
    ((grade.report as IGradeReport).teaching as ITeaching).teacher.toString() !== user?.id
  )
    throw new ForbiddenError('You cannot change a grade of a class that you do not teach.');

  await Grade.updateOne({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

  new SuccessResponse('Grade has been successfully deleted.').send(res);
});

export const deleteGradeReport = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req?.user;

  const gradeReport = await GradeReport.findOne({ _id: id, deletedAt: null }).populate({ path: 'teaching' });

  if (!gradeReport) throw new NotFoundError('No grade report found with that ID.');

  if (gradeReport && (gradeReport as IGradeReport).teaching && ((gradeReport as IGradeReport).teaching as ITeaching).teacher.toString() !== user?.id)
    throw new ForbiddenError('You cannot delete a grade report for a class that you do not teach.');

  await GradeReport.updateOne({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

  new SuccessResponse('Grade report has been successfully deleted.').send(res);
});
