import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { createUnit, updateUnit, deleteUnit, getAllUnits, getLevelUnits } from '@controllers/administrator/units/units';

const router: Router = Router();

const createUnitSchema = Joi.object({
  label: Joi.string().min(3).max(100).required(),
  level: JoiObjectId().required(),
});

const updateUnitIdSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateUnitLabelSchema = Joi.object({
  label: Joi.string().min(3).max(30).required(),
});

const deleteUnitSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getLevelUnitsSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllUnitsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

router.post('/unit', validateSchema(createUnitSchema, ValidationSource.BODY), createUnit);

router.patch(
  '/unit/:id?',
  validateSchema(updateUnitIdSchema, ValidationSource.PARAM),
  validateSchema(updateUnitLabelSchema, ValidationSource.BODY),
  updateUnit,
);

router.delete('/unit/:id?', validateSchema(deleteUnitSchema, ValidationSource.PARAM), deleteUnit);

router.get('/levelUnits/:id?', validateSchema(getLevelUnitsSchema, ValidationSource.PARAM), getLevelUnits);

router.get('/units', validateSchema(getAllUnitsSchema, ValidationSource.QUERY), getAllUnits);

export default router;
