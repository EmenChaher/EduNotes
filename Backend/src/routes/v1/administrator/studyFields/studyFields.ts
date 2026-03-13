import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import {
  createStudyField,
  deleteStudyField,
  getAllStudyFields,
  getStudyFieldRelatedData,
  updateStudyField,
} from '@controllers/administrator/studyFields/studyFields';

const router: Router = Router();

const createStudyFieldSchema = Joi.object({
  label: Joi.string().min(3).max(100).required(),
  acronym: Joi.string().min(1).max(10).required(),
  diploma: JoiObjectId().required(),
});

const updateStudyFieldIdSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateStudyFieldLabelSchema = Joi.object({
  label: Joi.string().min(3).max(100),
  acronym: Joi.string().min(1).max(10).required(),
  diploma: JoiObjectId(),
}).min(1);

const deleteStudyFieldSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllStudyFieldsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const getStudyFieldRelatedDataSchema = Joi.object({
  id: JoiObjectId().required(),
});

router.post('/studyField', validateSchema(createStudyFieldSchema, ValidationSource.BODY), createStudyField);

router.patch(
  '/studyField/:id?',
  validateSchema(updateStudyFieldIdSchema, ValidationSource.PARAM),
  validateSchema(updateStudyFieldLabelSchema, ValidationSource.BODY),
  updateStudyField,
);

router.delete('/studyField/:id?', validateSchema(deleteStudyFieldSchema, ValidationSource.PARAM), deleteStudyField);

router.get('/studyFields', validateSchema(getAllStudyFieldsSchema, ValidationSource.QUERY), getAllStudyFields);
router.get('/studyFieldRelatedData/:id?', validateSchema(getStudyFieldRelatedDataSchema, ValidationSource.PARAM), getStudyFieldRelatedData);

export default router;
