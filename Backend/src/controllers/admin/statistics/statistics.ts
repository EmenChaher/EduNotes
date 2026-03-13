import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import { ObjectId } from 'mongodb';
import Teaching from '@database/models/Teaching';
import GradeReport from '@database/models/GradeReport';
import User from '@database/models/User';
import Class from '@database/models/Class';

/**
 * Contrôleur pour les statistiques administratives
 * Fournit des données agrégées sur l'établissement
 */

export const getAdminGlobalStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  // Statistiques globales de l'établissement
  const globalStats = await Promise.all([
    // Nombre total d'étudiants
    User.countDocuments({ type: 'Student', deletedAt: null }),

    // Nombre total d'enseignants
    User.countDocuments({ type: 'Teacher', deletedAt: null }),

    // Nombre total de classes
    Class.countDocuments({ deletedAt: null }),

    // Nombre total de matières enseignées (unique subjects)
    Teaching.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$subject' } }, { $count: 'totalSubjects' }]),

    // Nombre total de notes numériques (using same logic as subject statistics)
    GradeReport.aggregate([
      {
        $match: { deletedAt: null },
      },
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
          'teachingInfo.deletedAt': null,
        },
      },
      {
        $lookup: {
          from: 'grades',
          let: { reportId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$report', '$$reportId'] }, { $or: [{ $eq: ['$deletedAt', null] }, { $not: ['$deletedAt'] }] }],
                },
              },
            },
          ],
          as: 'grades',
        },
      },
      {
        $addFields: {
          numericGrades: {
            $filter: {
              input: '$grades',
              cond: { $isNumber: '$$this.value' },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGrades: {
            $sum: { $size: '$numericGrades' },
          },
        },
      },
    ]),
  ]);

  const result = {
    totalStudents: globalStats[0],
    totalTeachers: globalStats[1],
    totalClasses: globalStats[2],
    totalSubjects: globalStats[3][0]?.totalSubjects || 0,
    totalGrades: globalStats[4][0]?.totalGrades || 0,
  };

  new SuccessResponse('Admin global statistics retrieved successfully.', result).send(res);
});

export const getAdminClassStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  // Statistiques détaillées par classe - Méthode simple et fiable
  const classes = await Class.find({ deletedAt: null })
    .populate('level')
    .populate({
      path: 'level',
      populate: {
        path: 'studyField',
      },
    });

  const classStats = [];

  for (const classItem of classes) {
    // Compter les étudiants dans cette classe
    const studentCount = await User.countDocuments({
      type: 'Student',
      class: classItem._id,
      deletedAt: null,
    });

    // Compter les matières uniques enseignées dans cette classe
    const uniqueSubjects = await Teaching.aggregate([
      {
        $match: {
          class: classItem._id,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$subject',
        },
      },
      {
        $count: 'uniqueSubjects',
      },
    ]);

    const subjectCount = uniqueSubjects[0]?.uniqueSubjects || 0;

    const levelInfo = classItem.level as any;
    const studyFieldInfo = levelInfo.studyField as any;

    classStats.push({
      _id: classItem._id,
      className: `${levelInfo.label} ${studyFieldInfo.acronym} ${classItem.label}`,
      studentCount: studentCount,
      subjectCount: subjectCount,
      levelLabel: levelInfo.label,
      studyFieldName: studyFieldInfo.label,
    });
  }

  // Trier par nom de classe
  classStats.sort((a, b) => a.className.localeCompare(b.className));

  new SuccessResponse('Admin class statistics retrieved successfully.', classStats).send(res);
});

export const getAdminSubjectStatistics = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  // Statistiques par matière pour tout l'établissement
  const subjectStats = await GradeReport.aggregate([
    {
      $match: { deletedAt: null },
    },
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
        'teachingInfo.deletedAt': null,
      },
    },
    {
      $lookup: {
        from: 'grades',
        let: { reportId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$report', '$$reportId'] }, { $or: [{ $eq: ['$deletedAt', null] }, { $not: ['$deletedAt'] }] }],
              },
            },
          },
        ],
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
            cond: { $isNumber: '$$this.value' },
          },
        },
      },
    },
    {
      $group: {
        _id: '$teachingInfo.subject',
        subjectName: { $first: '$subjectInfo.label' },
        coefficient: { $first: '$subjectInfo.coefficient' },
        allGrades: {
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
            input: '$allGrades',
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
        totalGrades: { $size: '$flattenedGrades' },
      },
    },
    {
      $project: {
        _id: 1,
        subjectName: 1,
        coefficient: 1,
        averageGrade: 1,
        maxGrade: 1,
        minGrade: 1,
        totalGrades: 1,
      },
    },
    {
      $sort: { subjectName: 1 },
    },
  ]);

  new SuccessResponse('Admin subject statistics retrieved successfully.', subjectStats).send(res);
});
