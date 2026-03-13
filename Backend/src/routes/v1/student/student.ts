import express from 'express';
import SubjectsRouter from './subjects/subjects';
import GradesRouter from './grades/grades';
import StatisticsRouter from './statistics/statistics';

const router = express.Router();
router.use(SubjectsRouter);
router.use(GradesRouter);
router.use(StatisticsRouter);

export default router;
