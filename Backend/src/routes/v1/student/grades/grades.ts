import { Router } from 'express';
import Joi from 'joi';
import { JoiObjectId, validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { flagGrade, getGrades } from '@controllers/student/grades/grades';

const router: Router = Router();

const getGradesSchema = Joi.object({
  subjectId: JoiObjectId().required(),
});

const flagGradeSchema = Joi.object({
  gradeId: JoiObjectId().required(),
});

router.get('/subject/:subjectId/grades', validateSchema(getGradesSchema, ValidationSource.PARAM), getGrades);

router.post('/grade/flag/:gradeId', validateSchema(flagGradeSchema, ValidationSource.PARAM), flagGrade);

export default router;
