import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { TeachingType } from '@database/models/Teaching';
import { SubjectContent } from '@database/models/SubjectGrading';
import { getGrades, createGrades, deleteGrade, updateGrade, createGrade, deleteGradeReport } from '@controllers/teacher/grades/grades';
import { extractGrades } from '@controllers/teacher/grades/extractGrades';

const router: Router = Router();

const getGradesSchema = Joi.object({
  classId: JoiObjectId().required(),
  subjectId: JoiObjectId().required(),
  subjectType: Joi.string()
    .valid(...Object.values(TeachingType))
    .required(),
  subjectContent: Joi.string()
    .valid(...Object.values(SubjectContent))
    .required(),
});

const postGradesParamSchema = Joi.object({
  classId: JoiObjectId().required(),
  subjectId: JoiObjectId().required(),
  subjectType: Joi.string()
    .valid(...Object.values(TeachingType))
    .required(),
  subjectContent: Joi.string()
    .valid(...Object.values(SubjectContent))
    .required(),
});

const postGradesBodySchema = Joi.object({
  grades: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().length(8).required(),
        grade: Joi.alternatives()
          .try(Joi.number().min(0).max(20).multiple(0.25), Joi.string().regex(/^\d+$/), Joi.string().valid('ABS', 'DISP'))
          .required(),
      }),
    )
    .required(),
});

const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;

const extractGradesSchema = Joi.object({
  imageUrl: Joi.string().required().regex(base64Regex, { name: 'base64Image' }).message('Invalid base64 image URL format'),
});

const deleteGradeSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateGradeParamsSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateGradeBodySchema = Joi.object({
  value: Joi.alternatives().try(Joi.number().min(0).max(20).multiple(0.25), Joi.string().valid('ABS', 'DISP')).required(),
});

const createGradeParamsSchema = Joi.object({
  reportId: JoiObjectId().required(),
});

const createGradeBodySchema = Joi.object({
  cin: Joi.string()
    .regex(/^\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid CIN format. Must be 8 digits.',
    }),
  value: Joi.alternatives().try(Joi.number().min(0).max(20).multiple(0.25), Joi.string().valid('ABS', 'DISP')).required(),
});

const deleteGradeReportSchema = Joi.object({
  id: JoiObjectId().required(),
});

router.post(
  '/class/:classId/subject/:subjectId/:subjectType/:subjectContent/grades',
  validateSchema(postGradesParamSchema, ValidationSource.PARAM),
  validateSchema(postGradesBodySchema, ValidationSource.BODY),
  createGrades,
);

router.get(
  '/class/:classId/subject/:subjectId/:subjectType/:subjectContent/grades',
  validateSchema(getGradesSchema, ValidationSource.PARAM),
  getGrades,
);

router.post(
  '/grade/:reportId?',
  validateSchema(createGradeParamsSchema, ValidationSource.PARAM),
  validateSchema(createGradeBodySchema, ValidationSource.BODY),
  createGrade,
);

router.patch(
  '/grade/:id?',
  validateSchema(updateGradeParamsSchema, ValidationSource.PARAM),
  validateSchema(updateGradeBodySchema, ValidationSource.BODY),
  updateGrade,
);

router.delete('/grade/:id?', validateSchema(deleteGradeSchema, ValidationSource.PARAM), deleteGrade);

router.delete('/gradeReport/:id?', validateSchema(deleteGradeReportSchema, ValidationSource.PARAM), deleteGradeReport);

router.post('/extractGrades', validateSchema(extractGradesSchema, ValidationSource.BODY), extractGrades);

export default router;
