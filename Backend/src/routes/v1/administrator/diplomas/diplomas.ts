import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { createDiploma, deleteDiploma, getAllDiplomas, getDiplomaRelatedData, updateDiploma } from '@controllers/administrator/diplomas/diplomas';
import { IDiplomaTypes } from '@database/models/Diploma';

const router: Router = Router();

const createDiplomaSchema = Joi.object({
  label: Joi.string().min(3).max(30).required(),
  type: Joi.string()
    .valid(...Object.values(IDiplomaTypes))
    .required(),
});

const updateDiplomaIdSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateDiplomaLabelSchema = Joi.object({
  label: Joi.string().min(3).max(30),
  type: Joi.string().valid(...Object.values(IDiplomaTypes)),
}).min(1);

const deleteDiplomaSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllDiplomasSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const getDiplomaRelatedDataSchema = Joi.object({
  id: JoiObjectId().required(),
});

router.post('/diploma', validateSchema(createDiplomaSchema, ValidationSource.BODY), createDiploma);

router.patch(
  '/diploma/:id?',
  validateSchema(updateDiplomaIdSchema, ValidationSource.PARAM),
  validateSchema(updateDiplomaLabelSchema, ValidationSource.BODY),
  updateDiploma,
);

router.delete('/diploma/:id?', validateSchema(deleteDiplomaSchema, ValidationSource.PARAM), deleteDiploma);

router.get('/diplomas', validateSchema(getAllDiplomasSchema, ValidationSource.QUERY), getAllDiplomas);
router.get('/diplomaRelatedData/:id?', validateSchema(getDiplomaRelatedDataSchema, ValidationSource.PARAM), getDiplomaRelatedData);

export default router;
