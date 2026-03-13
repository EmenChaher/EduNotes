import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { getSubjectTypesCount, getTeacherSubjectTypes } from '@controllers/teacher/subjectTypes/subjectTypes';

const router: Router = Router();

const getTeacherDataPaginationSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const geSubjectTypesSchema = Joi.object({
  classId: JoiObjectId().required(),
  subjectId: JoiObjectId().required(),
});

router.get(
  '/class/:classId/subject/:subjectId',
  validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY),
  validateSchema(geSubjectTypesSchema, ValidationSource.PARAM),
  getTeacherSubjectTypes,
);
router.get(
  '/class/:classId/subject/:subjectId/count',
  validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY),
  validateSchema(geSubjectTypesSchema, ValidationSource.PARAM),
  getSubjectTypesCount,
);

export default router;
