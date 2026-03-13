import express from 'express';
import DiplomaRouter from './diplomas/diplomas';
import InvitationRouter from './invitations/invitations';
import StudyFieldRouter from './studyFields/studyFields';
import LevelRouter from './levels/levels';
import ClassRouter from './classes/classes';
import UnitRouter from './units/units';
import SubjectRouter from './subjects/subjects';
import TeachingRouter from './teachings/teachings';
import UsersRouter from './users/users';
import StatisticsRouter from '../admin/statistics';

const router = express.Router();
router.use(DiplomaRouter);
router.use(InvitationRouter);
router.use(StudyFieldRouter);
router.use(LevelRouter);
router.use(ClassRouter);
router.use(UnitRouter);
router.use(SubjectRouter);
router.use(TeachingRouter);
router.use(UsersRouter);
router.use('/statistics', StatisticsRouter);

export default router;
