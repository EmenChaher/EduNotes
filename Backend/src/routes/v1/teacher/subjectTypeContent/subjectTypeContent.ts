import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { TeachingType } from '@database/models/Teaching';
import { getTeacherSubjectTypeContent, getTeacherSubjectTypeContentCount } from '@controllers/teacher/subjectTypeContent/subjectTypeContent';

const router: Router = Router();

const getSubjectTypeContentSchema = Joi.object({
  classId: JoiObjectId().required(),
  subjectId: JoiObjectId().required(),
  subjectType: Joi.string()
    .valid(...Object.values(TeachingType))
    .required(),
});

router.get(
  '/class/:classId/subject/:subjectId/:subjectType',
  validateSchema(getSubjectTypeContentSchema, ValidationSource.PARAM),
  getTeacherSubjectTypeContent,
);
router.get(
  '/class/:classId/subject/:subjectId/:subjectType/count',
  validateSchema(getSubjectTypeContentSchema, ValidationSource.PARAM),
  getTeacherSubjectTypeContentCount,
);

export default router;
