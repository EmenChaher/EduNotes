import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { getStudentSubjects, getStudentSubjectsCount } from '@controllers/student/subjects/subjects';

const router: Router = Router();

const getStudentSubjectsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

router.get('/subjects', validateSchema(getStudentSubjectsSchema, ValidationSource.QUERY), getStudentSubjects);
router.get('/subjects/count', validateSchema(getStudentSubjectsSchema, ValidationSource.QUERY), getStudentSubjectsCount);

export default router;
