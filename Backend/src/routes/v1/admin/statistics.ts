import express from 'express';
import { getAdminGlobalStatistics, getAdminClassStatistics, getAdminSubjectStatistics } from '@controllers/admin/statistics/statistics';

const router = express.Router();

router.get('/global', getAdminGlobalStatistics);
router.get('/classes', getAdminClassStatistics);
router.get('/subjects', getAdminSubjectStatistics);

export default router;
