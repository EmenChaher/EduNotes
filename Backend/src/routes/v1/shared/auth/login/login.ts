import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { loginUser } from '@controllers/shared/auth/login';
import anonymousUser from '@auth/anonymous';

const router: Router = Router();

const loginSchema = Joi.object({
  email: Joi.string()
    .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email address format.',
    }),
  password: Joi.string().required().messages({}),
  remember: Joi.boolean().required().messages({}),
});

router.post('/login', anonymousUser, validateSchema(loginSchema, ValidationSource.BODY), loginUser);
export default router;
