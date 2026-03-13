import express from 'express';
import AuthRouter from './shared/auth';
import NotificationRouter from './shared/notification/notification';
import InvitationRouter from './shared/invitation/invitation';
import ProfileRouter from './shared/profile/profile';
import StudentRouter from './student/student';
import TeacherRouter from './teacher/teacher';
import AdminRouter from './administrator';
import authenticateUser from '@auth/authentication';
import authorizeUser from '@auth/authorization';
import { UserTypes } from '@database/models/User';

const router = express.Router();
router.use(AuthRouter);
router.use(NotificationRouter);
router.use(InvitationRouter);
router.use(ProfileRouter);
router.use('/administrator', authenticateUser, authorizeUser([UserTypes.Admin, UserTypes.SuperAdmin]), AdminRouter);
router.use('/teacher', authenticateUser, authorizeUser([UserTypes.Teacher]), TeacherRouter);
router.use('/student', authenticateUser, authorizeUser([UserTypes.Student]), StudentRouter);

export default router;
