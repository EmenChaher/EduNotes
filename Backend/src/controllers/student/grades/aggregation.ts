import Subject from '@database/models/Subject';
import { ObjectId } from 'mongodb';

const aggregateStudentGrades = async ({ subjectId, classId, userCin }: { subjectId: string; classId: string; userCin: string }) => {
  try {
    // Validate ObjectIds
    if (!ObjectId.isValid(subjectId)) {
      throw new Error(`Invalid subjectId: ${subjectId}`);
    }
    if (!ObjectId.isValid(classId)) {
      throw new Error(`Invalid classId: ${classId}`);
    }
    if (!userCin) {
      throw new Error('User CIN is required');
    }

    return await Subject.aggregate([
      {
        $match: {
          _id: new ObjectId(subjectId),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'subject_grading',
          localField: 'grading',
          foreignField: '_id',
          as: 'grading',
        },
      },
      {
        $unwind: {
          path: '$grading',
        },
      },
      {
        $addFields: {
          content: {
            $map: {
              input: {
                $filter: {
                  input: {
                    $objectToArray: '$$ROOT',
                  },
                  as: 'item',
                  cond: {
                    $and: [
                      {
                        $eq: [
                          {
                            $type: '$$item.v',
                          },
                          'bool',
                        ],
                      },
                      '$$item.v',
                    ],
                  },
                },
              },
              as: 'item',
              in: '$$item.k',
            },
          },
        },
      },
      {
        $unwind: {
          path: '$content',
        },
      },
      {
        $addFields: {
          grading: {
            $cond: {
              if: {
                $eq: ['$content', 'lecture'],
              },
              then: {
                $filter: {
                  input: {
                    $objectToArray: '$grading',
                  },
                  as: 'item',
                  cond: {
                    $and: [
                      {
                        $in: ['$$item.k', ['supervisedAssessment1', 'supervisedAssessment2', 'exam']],
                      },
                      {
                        $ne: ['$$item.v', null],
                      },
                    ],
                  },
                },
              },
              else: {
                $cond: {
                  if: {
                    $eq: ['$content', 'guidedSession'],
                  },
                  then: {
                    $filter: {
                      input: {
                        $objectToArray: '$grading',
                      },
                      as: 'item',
                      cond: {
                        $and: [
                          {
                            $in: ['$$item.k', ['other']],
                          },
                          {
                            $ne: ['$$item.v', null],
                          },
                        ],
                      },
                    },
                  },
                  else: {
                    $cond: {
                      if: {
                        $eq: ['$content', 'practicalSession'],
                      },
                      then: {
                        $filter: {
                          input: {
                            $objectToArray: '$grading',
                          },
                          as: 'item',
                          cond: {
                            $and: [
                              {
                                $in: ['$$item.k', ['practical']],
                              },
                              {
                                $ne: ['$$item.v', null],
                              },
                            ],
                          },
                        },
                      },
                      else: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $set: {
          grading: {
            $map: {
              input: '$grading',
              as: 'item',
              in: {
                type: '$$item.k',
                pourcentage: '$$item.v',
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$grading',
        },
      },
      {
        $project: {
          _id: 1,
          label: 1,
          coefficient: 1,
          grading: 1,
          content: 1,
          unit: 1,
        },
      },
      {
        $lookup: {
          from: 'teaching',
          let: {
            subjectId: '$_id',
            contentType: '$content',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$class', new ObjectId(classId)],
                    },
                    {
                      $eq: ['$subject', '$$subjectId'],
                    },
                    {
                      $eq: ['$deletedAt', null],
                    },
                    {
                      $eq: ['$type', '$$contentType'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'teaching',
        },
      },
      {
        $unwind: {
          path: '$teaching',
        },
      },
      {
        $set: {
          teaching: '$teaching._id',
          teacher: '$teaching.teacher',
          subject: '$_id',
        },
      },
      {
        $lookup: {
          from: 'grade_reports',
          let: {
            teachingId: '$teaching',
            reportType: '$grading.type',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$teaching', '$$teachingId'],
                    },
                    {
                      $eq: ['$deletedAt', null],
                    },
                    {
                      $eq: ['$type', '$$reportType'],
                    },
                  ],
                },
              },
            },
          ],
          as: 'report',
        },
      },
      {
        $set: {
          report: '$report._id',
        },
      },
      {
        $unwind: {
          path: '$report',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'grades',
          let: {
            reportId: '$report',
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
          ],
          as: 'grades',
        },
      },
      {
        $addFields: {
          grade_count: {
            $size: '$grades',
          },
        },
      },
      {
        $set: {
          grades: {
            $map: {
              input: '$grades',
              as: 'grade',
              in: {
                student: '$$grade.student',
                value: '$$grade.value',
                createdAt: '$$grade.createdAt',
                updatedAt: '$$grade.updatedAt',
                _id: '$$grade._id',
                isNumeric: {
                  $cond: {
                    if: {
                      $isNumber: '$$grade.value',
                    },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        },
      },
      {
        $set: {
          grades: {
            $sortArray: {
              input: '$grades',
              sortBy: {
                isNumeric: -1,
                value: -1,
                createdAt: 1,
              },
            },
          },
        },
      },
      {
        $addFields: {
          grades: {
            $map: {
              input: {
                $range: [
                  0,
                  {
                    $size: '$grades',
                  },
                ],
              },
              as: 'index',
              in: {
                $mergeObjects: [
                  {
                    $arrayElemAt: ['$grades', '$$index'],
                  },
                  {
                    index: {
                      $add: ['$$index', 1],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          grade: {
            $filter: {
              input: '$grades',
              as: 'grade',
              cond: {
                $and: [
                  {
                    $eq: ['$$grade.student', userCin],
                  },
                  {
                    $ne: ['$$grade.value', null],
                  },
                  {
                    $ne: ['$$grade.index', null],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$grade',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          rank: '$grade.index',
          createdAt: '$grade.createdAt',
          updatedAt: '$grade.updatedAt',
          grade: '$grade.value',
          _id: '$grade._id',
        },
      },
      {
        $addFields: {
          grades: {
            $filter: {
              input: '$grades',
              as: 'grade',
              cond: {
                $and: [
                  {
                    $ne: ['$$grade.value', null],
                  },
                  {
                    $gte: ['$$grade.value', 0],
                  },
                  {
                    $lte: ['$$grade.value', 20],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          max_grade: {
            $max: '$grades.value',
          },
          min_grade: {
            $min: '$grades.value',
          },
          class_average: {
            $avg: '$grades.value',
          },
        },
      },
      {
        $unset: ['grades'],
      },
      {
        $lookup: {
          from: 'units',
          localField: 'unit',
          foreignField: '_id',
          as: 'unit',
        },
      },
      {
        $set: {
          unit: '$unit.label',
        },
      },
      {
        $unwind: {
          path: '$unit',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: {
          path: '$teacher',
        },
      },
      {
        $set: {
          teacher: {
            $concat: ['$teacher.name', ' ', '$teacher.surname'],
          },
        },
      },
      {
        $group: {
          _id: {
            subject: '$subject',
            coefficient: '$coefficient',
            label: '$label',
            unit: '$unit',
          },
          grades: {
            $push: {
              _id: '$_id',
              grading: '$grading',
              content: '$content',
              teacher: '$teacher',
              grade_count: '$grade_count',
              max_grade: '$max_grade',
              min_grade: '$min_grade',
              class_average: '$class_average',
              grade: '$grade',
              rank: '$rank',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
          },
        },
      },
      {
        $project: {
          coefficient: '$_id.coefficient',
          label: '$_id.label',
          unit: '$_id.unit',
          grades: {
            $map: {
              input: '$grades',
              as: 'grade',
              in: {
                _id: '$$grade._id',
                grading: '$$grade.grading',
                unit: '$$grade.unit',
                content: '$$grade.content',
                teacher: '$$grade.teacher',
                grade_count: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $ne: ['$$grade.grade_count', null],
                        },
                        {
                          $ne: ['$$grade.grade_count', 0],
                        },
                      ],
                    },
                    then: '$$grade.grade_count',
                    else: '$$REMOVE',
                  },
                },
                max_grade: {
                  $cond: {
                    if: {
                      $ne: ['$$grade.max_grade', null],
                    },
                    then: '$$grade.max_grade',
                    else: '$$REMOVE',
                  },
                },
                min_grade: {
                  $cond: {
                    if: {
                      $ne: ['$$grade.min_grade', null],
                    },
                    then: '$$grade.min_grade',
                    else: '$$REMOVE',
                  },
                },
                class_average: {
                  $cond: {
                    if: {
                      $ne: ['$$grade.class_average', null],
                    },
                    then: '$$grade.class_average',
                    else: '$$REMOVE',
                  },
                },
                grade: {
                  $cond: {
                    if: {
                      $ne: ['$$grade.grade', null],
                    },
                    then: '$$grade.grade',
                    else: '$$REMOVE',
                  },
                },
                rank: {
                  $cond: {
                    if: {
                      $ne: ['$$grade.rank', null],
                    },
                    then: '$$grade.rank',
                    else: '$$REMOVE',
                  },
                },
                createdAt: '$$grade.createdAt',
                updatedAt: '$$grade.updatedAt',
              },
            },
          },
          _id: 0,
        },
      },
    ]);
  } catch (error) {
    console.error('Error in aggregateStudentGrades:', error);
    throw error;
  }
};

export default aggregateStudentGrades;
