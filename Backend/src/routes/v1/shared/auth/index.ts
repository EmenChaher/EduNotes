import express from 'express';
import registerRouter from './register/register';
import loginRouter from './login/login';
import getMeRouter from './me/me';
import passwordRouter from './password/password';

const router = express.Router();
router.use(registerRouter);
router.use(loginRouter);
router.use(getMeRouter);
router.use(passwordRouter);

export default router;
