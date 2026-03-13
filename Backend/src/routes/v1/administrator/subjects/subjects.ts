import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { createSubject, updateSubject, deleteSubject, getAllSubjects, getClassSubjects } from '@controllers/administrator/subjects/subjects';

const router: Router = Router();

const createSubjectSchema = Joi.object({
  label: Joi.string().min(3).max(100).required(),
  coefficient: Joi.number().min(0).max(10).required(),
  lecture: Joi.boolean().required(),
  guidedSession: Joi.boolean().required(),
  practicalSession: Joi.boolean().required(),
  supervisedAssessment1: Joi.number().min(1).max(100),
  supervisedAssessment2: Joi.number().min(1).max(100),
  practical: Joi.number().min(1).max(100),
  exam: Joi.number().min(1).max(100),
  other: Joi.number().min(1).max(100),
  level: JoiObjectId(),
  unit: JoiObjectId(),
})
  .or('supervisedAssessment1', 'supervisedAssessment2', 'practical', 'exam', 'other')
  .custom((value, helpers) => {
    const total =
      (value.supervisedAssessment1 || 0) + (value.supervisedAssessment2 || 0) + (value.exam || 0) + (value.other || 0) + (value.practical || 0);
    if (total !== 100) {
      return helpers.message({ custom: `"supervisedAssessment1", "supervisedAssessment2", "practical", "exam", and "other" should sum up to 100` });
    }
    return value;
  })
  .xor('level', 'unit');

const updateSubjectIdSchema = Joi.object({
  id: JoiObjectId().required(),
});

const updateSubjectLabelSchema = Joi.object({
  label: Joi.string().min(3).max(30),
  coefficient: Joi.number().min(0).max(10),
  lecture: Joi.boolean(),
  guidedSession: Joi.boolean(),
  practicalSession: Joi.boolean(),
  supervisedAssessment1: Joi.number().min(1).max(100),
  supervisedAssessment2: Joi.number().min(1).max(100),
  practical: Joi.number().min(1).max(100),
  exam: Joi.number().min(1).max(100),
  other: Joi.number().min(1).max(100),
}).min(1);

const deleteSubjectSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getClassSubjectsSchema = Joi.object({
  id: JoiObjectId().required(),
});

const getAllSubjectsSchema = Joi.object({
  limit: Joi.number().messages({
    'number.base': 'Limit must be a number',
  }),
  page: Joi.number().messages({
    'number.base': 'Page must be a number',
  }),
});

router.post('/subject', validateSchema(createSubjectSchema, ValidationSource.BODY), createSubject);

router.patch(
  '/subject/:id?',
  validateSchema(updateSubjectIdSchema, ValidationSource.PARAM),
  validateSchema(updateSubjectLabelSchema, ValidationSource.BODY),
  updateSubject,
);

router.delete('/subject/:id?', validateSchema(deleteSubjectSchema, ValidationSource.PARAM), deleteSubject);

router.get('/classSubjects/:id?', validateSchema(getClassSubjectsSchema, ValidationSource.PARAM), getClassSubjects);

router.get('/subjects', validateSchema(getAllSubjectsSchema, ValidationSource.QUERY), getAllSubjects);

export default router;
