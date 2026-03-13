import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import Teaching from '@database/models/Teaching';
import GradeReport from '@database/models/GradeReport';
import { NotFoundError } from '@core/ApiError';

export const getStudentStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const studentCin = user.cin;

  // Handle both populated and non-populated class
  let classId: string;
  if (typeof user.class === 'string') {
    classId = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classId = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  // Statistiques globales de l'étudiant avec nom de classe
  const studentStats = await Teaching.aggregate([
    {
      $match: {
        class: new ObjectId(classId),
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'classInfo',
      },
    },
    {
      $unwind: '$classInfo',
    },
    {
      $lookup: {
        from: 'levels',
        localField: 'classInfo.level',
        foreignField: '_id',
        as: 'levelInfo',
      },
    },
    {
      $unwind: '$levelInfo',
    },
    {
      $lookup: {
        from: 'study_fields',
        localField: 'levelInfo.studyField',
        foreignField: '_id',
        as: 'studyFieldInfo',
      },
    },
    {
      $unwind: '$studyFieldInfo',
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subject',
        foreignField: '_id',
        as: 'subjectInfo',
      },
    },
    {
      $unwind: '$subjectInfo',
    },
    {
      $group: {
        _id: null,
        totalSubjects: { $addToSet: '$subject' },
        subjects: { $push: '$subjectInfo' },
        className: {
          $first: {
            $concat: [{ $toString: '$levelInfo.label' }, ' ', '$studyFieldInfo.acronym', ' ', { $toString: '$classInfo.label' }],
          },
        },
      },
    },
    {
      $project: {
        totalSubjects: { $size: '$totalSubjects' },
        subjects: 1,
        className: 1,
      },
    },
  ]);

  // Compter les notes numériques de l'étudiant (using same logic as subject stats)
  const gradeCountResult = await GradeReport.aggregate([
    {
      $lookup: {
        from: 'teaching',
        localField: 'teaching',
        foreignField: '_id',
        as: 'teachingInfo',
      },
    },
    {
      $unwind: '$teachingInfo',
    },
    {
      $match: {
        'teachingInfo.class': new ObjectId(classId),
        'teachingInfo.deletedAt': null,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        localField: '_id',
        foreignField: 'report',
        as: 'allGrades',
      },
    },
    {
      $addFields: {
        studentGrades: {
          $filter: {
            input: '$allGrades',
            cond: {
              $and: [
                { $eq: ['$$this.student', studentCin] },
                { $isNumber: '$$this.value' },
                { $or: [{ $eq: ['$$this.deletedAt', null] }, { $not: ['$$this.deletedAt'] }] },
              ],
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalGrades: { $sum: { $size: '$studentGrades' } },
      },
    },
  ]);

  const result = {
    totalSubjects: studentStats[0]?.totalSubjects || 0,
    totalGrades: gradeCountResult[0]?.totalGrades || 0,
    className: studentStats[0]?.className || '',
  };

  new SuccessResponse('Student statistics retrieved successfully.', result).send(res);
});

export const getStudentSubjectStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const studentCin = user.cin;

  // Handle both populated and non-populated class
  let classId: string;
  if (typeof user.class === 'string') {
    classId = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classId = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  // Statistiques par matière pour l'étudiant
  const subjectStats = await GradeReport.aggregate([
    {
      $lookup: {
        from: 'teaching',
        localField: 'teaching',
        foreignField: '_id',
        as: 'teachingInfo',
      },
    },
    {
      $unwind: '$teachingInfo',
    },
    {
      $match: {
        'teachingInfo.class': new ObjectId(classId),
        'teachingInfo.deletedAt': null,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        localField: '_id',
        foreignField: 'report',
        as: 'allGrades',
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'teachingInfo.subject',
        foreignField: '_id',
        as: 'subjectInfo',
      },
    },
    {
      $unwind: '$subjectInfo',
    },
    {
      $addFields: {
        studentGrades: {
          $filter: {
            input: '$allGrades',
            cond: {
              $and: [
                { $eq: ['$$this.student', studentCin] },
                { $isNumber: '$$this.value' },
                { $or: [{ $eq: ['$$this.deletedAt', null] }, { $not: ['$$this.deletedAt'] }] },
              ],
            },
          },
        },
        classNumericGrades: {
          $filter: {
            input: '$allGrades',
            cond: {
              $and: [{ $isNumber: '$$this.value' }, { $or: [{ $eq: ['$$this.deletedAt', null] }, { $not: ['$$this.deletedAt'] }] }],
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$teachingInfo.subject',
        subjectName: { $first: '$subjectInfo.label' },
        coefficient: { $first: '$subjectInfo.coefficient' },
        studentGrades: { $push: '$studentGrades' },
        classGrades: { $push: '$classNumericGrades' },
      },
    },
    {
      $addFields: {
        flattenedStudentGrades: {
          $reduce: {
            input: '$studentGrades',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] },
          },
        },
        flattenedClassGrades: {
          $reduce: {
            input: '$classGrades',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] },
          },
        },
      },
    },
    {
      $addFields: {
        studentAverage: {
          $avg: {
            $map: {
              input: '$flattenedStudentGrades',
              as: 'grade',
              in: '$$grade.value',
            },
          },
        },
        classAverage: {
          $avg: {
            $map: {
              input: '$flattenedClassGrades',
              as: 'grade',
              in: '$$grade.value',
            },
          },
        },
        gradeCount: { $size: '$flattenedStudentGrades' },
      },
    },
    {
      $project: {
        _id: 1,
        subjectName: 1,
        coefficient: 1,
        studentAverage: 1,
        classAverage: 1,
        gradeCount: 1,
      },
    },
    {
      $sort: { subjectName: 1 },
    },
  ]);

  new SuccessResponse('Student subject statistics retrieved successfully.', subjectStats).send(res);
});

export const getStudentRankings = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const studentCin = user.cin;

  // Handle both populated and non-populated class
  let classId: string;
  if (typeof user.class === 'string') {
    classId = user.class;
  } else if (user.class && typeof user.class === 'object' && '_id' in user.class) {
    classId = (user.class as any)._id.toString();
  } else {
    throw new NotFoundError('Invalid class data for student.');
  }

  // Calcul du classement de l'étudiant par matière
  const rankings = await GradeReport.aggregate([
    {
      $lookup: {
        from: 'teaching',
        localField: 'teaching',
        foreignField: '_id',
        as: 'teachingInfo',
      },
    },
    {
      $unwind: '$teachingInfo',
    },
    {
      $match: {
        'teachingInfo.class': new ObjectId(classId),
        'teachingInfo.deletedAt': null,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        localField: '_id',
        foreignField: 'report',
        as: 'grades',
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'teachingInfo.subject',
        foreignField: '_id',
        as: 'subjectInfo',
      },
    },
    {
      $unwind: '$subjectInfo',
    },
    {
      $addFields: {
        numericGrades: {
          $filter: {
            input: '$grades',
            cond: {
              $and: [{ $isNumber: '$$this.value' }, { $or: [{ $eq: ['$$this.deletedAt', null] }, { $not: ['$$this.deletedAt'] }] }],
            },
          },
        },
      },
    },
    {
      $unwind: '$numericGrades',
    },
    {
      $group: {
        _id: {
          subject: '$teachingInfo.subject',
          student: '$numericGrades.student',
        },
        subjectName: { $first: '$subjectInfo.label' },
        studentAverage: { $avg: '$numericGrades.value' },
      },
    },
    {
      $group: {
        _id: '$_id.subject',
        subjectName: { $first: '$subjectName' },
        studentAverages: {
          $push: {
            student: '$_id.student',
            average: '$studentAverage',
          },
        },
      },
    },
    {
      $addFields: {
        sortedStudents: {
          $sortArray: {
            input: '$studentAverages',
            sortBy: { average: -1 },
          },
        },
      },
    },
    {
      $addFields: {
        studentRank: {
          $indexOfArray: [
            {
              $map: {
                input: '$sortedStudents',
                as: 'student',
                in: '$$student.student',
              },
            },
            studentCin,
          ],
        },
        studentAverage: {
          $let: {
            vars: {
              studentData: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$studentAverages',
                      cond: { $eq: ['$$this.student', studentCin] },
                    },
                  },
                  0,
                ],
              },
            },
            in: '$$studentData.average',
          },
        },
        totalStudents: { $size: '$studentAverages' },
      },
    },
    {
      $addFields: {
        rank: { $add: ['$studentRank', 1] },
      },
    },
    {
      $match: {
        studentRank: { $gte: 0 },
      },
    },
    {
      $project: {
        _id: 1,
        subjectName: 1,
        rank: 1,
        totalStudents: 1,
        studentAverage: 1,
      },
    },
    {
      $sort: { subjectName: 1 },
    },
  ]);

  new SuccessResponse('Student rankings retrieved successfully.', rankings).send(res);
});
