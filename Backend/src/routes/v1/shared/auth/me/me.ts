import authenticateUser from '@auth/authentication';
import { getMe } from '@controllers/shared/auth/me';
import { Router } from 'express';

const router: Router = Router();

router.get('/me', authenticateUser, getMe);

export default router