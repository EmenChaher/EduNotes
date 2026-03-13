import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { createClass, deleteClass, getAllClasses, getNextClass } from '@controllers/administrator/classes/classes';

const router: Router = Router();

const createClassSchema = Joi.object({
  level: JoiObjectId().required(),
});

const deleteClassSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllClassesSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const getNextClassSchema = Joi.object({
  level: JoiObjectId().required(),
});

router.post('/class', validateSchema(createClassSchema, ValidationSource.BODY), createClass);

router.delete('/class/:id?', validateSchema(deleteClassSchema, ValidationSource.PARAM), deleteClass);

router.get('/classes', validateSchema(getAllClassesSchema, ValidationSource.QUERY), getAllClasses);

router.get('/nextClass/:level', validateSchema(getNextClassSchema, ValidationSource.PARAM), getNextClass);

export default router;
