import { Router } from 'express';
import { getStudentStatistics, getStudentSubjectStatistics, getStudentRankings } from '@controllers/student/statistics/statistics';

const router: Router = Router();

router.get('/statistics', getStudentStatistics);
router.get('/statistics/subjects', getStudentSubjectStatistics);
router.get('/statistics/rankings', getStudentRankings);

export default router;
