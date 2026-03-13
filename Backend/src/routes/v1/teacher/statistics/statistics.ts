import { Router } from 'express';
import { getTeacherStatistics, getTeacherClassStatistics, getTeacherGradeStatistics } from '@controllers/teacher/statistics/statistics';

const router: Router = Router();

router.get('/statistics', getTeacherStatistics);
router.get('/statistics/classes', getTeacherClassStatistics);
router.get('/statistics/grades', getTeacherGradeStatistics);

export default router;
