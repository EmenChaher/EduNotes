import express from 'express';
import ClassesRouter from './classes/classes';
import GradesRouter from './grades/grades';
import SubjectsRouter from './subjects/subjects';
import SubjectTypesRouter from './subjectTypes/subjectTypes';
import SubjectTypeContentsRouter from './subjectTypeContent/subjectTypeContent';
import StatisticsRouter from './statistics/statistics';

const router = express.Router();
router.use(ClassesRouter);
router.use(GradesRouter);
router.use(SubjectsRouter);
router.use(SubjectTypesRouter);
router.use(SubjectTypeContentsRouter);
router.use(StatisticsRouter);

export default router;
