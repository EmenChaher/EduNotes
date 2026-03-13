import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';

import { getTeacherClassCount, getTeacherClasses } from '@controllers/teacher/classes/classes';

const router: Router = Router();

const getTeacherDataPaginationSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

router.get('/classes/count', validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY), getTeacherClassCount);
router.get('/classes', validateSchema(getTeacherDataPaginationSchema, ValidationSource.QUERY), getTeacherClasses);

export default router;
