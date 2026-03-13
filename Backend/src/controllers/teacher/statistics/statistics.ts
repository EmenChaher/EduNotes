import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import Teaching from '@database/models/Teaching';
import GradeReport from '@database/models/GradeReport';

export const getTeacherStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  const teacherId = user?.id;

  // Agrégation pour obtenir les statistiques globales de l'enseignant
  const teacherStats = await Teaching.aggregate([
    {
      $match: {
        teacher: new ObjectId(teacherId),
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
        from: 'users',
        let: { classId: '$classInfo._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$class', '$$classId'] },
                  { $eq: ['$type', 'Student'] },
                  { $or: [{ $eq: ['$deletedAt', null] }, { $not: ['$deletedAt'] }] },
                ],
              },
            },
          },
        ],
        as: 'students',
      },
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
        totalClasses: { $addToSet: '$class' },
        totalSubjects: { $addToSet: '$subject' },
        totalStudents: { $addToSet: '$students' },
        teachings: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        totalClasses: { $size: '$totalClasses' },
        totalSubjects: { $size: '$totalSubjects' },
        totalStudents: {
          $size: {
            $reduce: {
              input: '$totalStudents',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] },
            },
          },
        },
        teachings: 1,
      },
    },
  ]);

  new SuccessResponse(
    'Teacher statistics retrieved successfully.',
    teacherStats[0] || {
      totalClasses: 0,
      totalSubjects: 0,
      totalStudents: 0,
    },
  ).send(res);
});

export const getTeacherClassStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  const teacherId = user?.id;

  // Statistiques détaillées par classe
  const classStats = await Teaching.aggregate([
    {
      $match: {
        teacher: new ObjectId(teacherId),
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
        from: 'users',
        let: { classId: '$classInfo._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$class', '$$classId'] },
                  { $eq: ['$type', 'Student'] },
                  { $or: [{ $eq: ['$deletedAt', null] }, { $not: ['$deletedAt'] }] },
                ],
              },
            },
          },
        ],
        as: 'students',
      },
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
        _id: '$class',
        className: {
          $first: {
            $concat: [{ $toString: '$levelInfo.label' }, ' ', '$studyFieldInfo.acronym', ' ', { $toString: '$classInfo.label' }],
          },
        },
        studentCount: { $first: { $size: '$students' } },
        subjects: {
          $push: {
            subjectId: '$subject',
            subjectName: '$subjectInfo.label',
            subjectType: '$type',
          },
        },
      },
    },
    {
      $sort: { className: 1 },
    },
  ]);

  new SuccessResponse('Teacher class statistics retrieved successfully.', classStats).send(res);
});

export const getTeacherGradeStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req?.user;
  const teacherId = user?.id;

  // Statistiques des notes par matière et classe
  const gradeStats = await GradeReport.aggregate([
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
        'teachingInfo.teacher': new ObjectId(teacherId),
        'teachingInfo.deletedAt': null,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        let: { reportId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$report', '$$reportId'] }, { $or: [{ $eq: ['$deletedAt', null] }, { $not: ['$deletedAt'] }] }] } } },
        ],
        as: 'grades',
      },
    },
    {
      $lookup: {
        from: 'classes',
        localField: 'teachingInfo.class',
        foreignField: '_id',
        as: 'classInfo',
      },
    },
    {
      $unwind: '$classInfo',
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
      $addFields: {
        className: {
          $concat: [{ $toString: '$levelInfo.label' }, ' ', '$studyFieldInfo.acronym', ' ', { $toString: '$classInfo.label' }],
        },
        numericGrades: {
          $filter: {
            input: '$grades',
            as: 'grade',
            cond: {
              $and: [{ $isNumber: '$$grade.value' }, { $or: [{ $eq: ['$$grade.deletedAt', null] }, { $not: ['$$grade.deletedAt'] }] }],
            },
          },
        },
      },
    },
    {
      $group: {
        _id: {
          class: '$teachingInfo.class',
          subject: '$teachingInfo.subject',
        },
        className: { $first: '$className' },
        subjectName: { $first: '$subjectInfo.label' },
        // Only count numeric, non-deleted grades
        totalGrades: { $sum: { $size: '$numericGrades' } },
        allNumericGrades: {
          $push: {
            $map: {
              input: '$numericGrades',
              as: 'grade',
              in: '$$grade.value',
            },
          },
        },
      },
    },
    {
      $addFields: {
        flattenedGrades: {
          $reduce: {
            input: '$allNumericGrades',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] },
          },
        },
      },
    },
    {
      $addFields: {
        averageGrade: { $avg: '$flattenedGrades' },
        maxGrade: { $max: '$flattenedGrades' },
        minGrade: { $min: '$flattenedGrades' },
      },
    },
    {
      $project: {
        _id: 1,
        className: 1,
        subjectName: 1,
        totalGrades: 1,
        averageGrade: 1,
        maxGrade: 1,
        minGrade: 1,
      },
    },
    {
      $sort: { className: 1, subjectName: 1 },
    },
  ]);

  new SuccessResponse('Teacher grade statistics retrieved successfully.', gradeStats).send(res);
});
