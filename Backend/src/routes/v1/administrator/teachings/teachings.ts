import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { TeachingType } from '@database/models/Teaching';
import { createTeaching, deleteTeaching, getAllTeachings, updateTeaching } from '@controllers/administrator/teachings/teachings';

const router: Router = Router();

const createTeachingSchema = Joi.object({
  teacher: JoiObjectId(),
  class: JoiObjectId(),
  subject: JoiObjectId(),
  type: Joi.string()
    .valid(...Object.values(TeachingType))
    .required(),
});

const deleteTeachingSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateTeachingSchema = Joi.object({
  teacher: JoiObjectId(),
  class: JoiObjectId(),
  subject: JoiObjectId(),
  type: Joi.string().valid(...Object.values(TeachingType)),
});

const updateTeachingIdSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllTeachingsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

router.post('/teaching', validateSchema(createTeachingSchema, ValidationSource.BODY), createTeaching);

router.patch(
  '/teaching/:id?',
  validateSchema(updateTeachingIdSchema, ValidationSource.PARAM),
  validateSchema(updateTeachingSchema, ValidationSource.BODY),
  updateTeaching,
);

router.delete('/teaching/:id?', validateSchema(deleteTeachingSchema, ValidationSource.PARAM), deleteTeaching);

router.get('/teachings', validateSchema(getAllTeachingsSchema, ValidationSource.QUERY), getAllTeachings);

export default router;
