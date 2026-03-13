import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { createLevel, deleteLevel, getAllLevels, getLevelRelatedData, getNextLevel } from '@controllers/administrator/levels/levels';

const router: Router = Router();

const createLevelSchema = Joi.object({
  studyField: JoiObjectId().required(),
});

const deleteLevelSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllLevelsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

const getNextLevelSchema = Joi.object({
  studyField: JoiObjectId().required(),
});

const getLevelRelatedDataSchema = Joi.object({
  id: JoiObjectId().required(),
});

router.post('/level', validateSchema(createLevelSchema, ValidationSource.BODY), createLevel);

router.delete('/level/:id?', validateSchema(deleteLevelSchema, ValidationSource.PARAM), deleteLevel);

router.get('/levels', validateSchema(getAllLevelsSchema, ValidationSource.QUERY), getAllLevels);

router.get('/nextLevel/:studyField', validateSchema(getNextLevelSchema, ValidationSource.PARAM), getNextLevel);

router.get('/levelRelatedData/:id?', validateSchema(getLevelRelatedDataSchema, ValidationSource.PARAM), getLevelRelatedData);

export default router;
