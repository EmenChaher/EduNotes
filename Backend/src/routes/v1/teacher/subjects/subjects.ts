import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { getTeacherClassSubjectCount, getTeacherClassSubjects } from '@controllers/teacher/subjects/subjects';

const router: Router = Router();

const getTeacherDataPaginationSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const getClassSubjectsSchema = Joi.object({
  classId: JoiObjectId().required(),
});

router.get(
  '/class/:classId',
  validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY),
  validateSchema(getClassSubjectsSchema, ValidationSource.PARAM),
  getTeacherClassSubjects,
);
router.get(
  '/class/:classId?/count',
  validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY),
  validateSchema(getClassSubjectsSchema, ValidationSource.PARAM),
  getTeacherClassSubjectCount,
);

export default router;
