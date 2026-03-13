import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import authenticateUser from '@auth/authentication';
import { changePassword, forgotPassword, getPasswordResetRequest, resetPassword } from '@controllers/shared/auth/password';
import anonymousUser from '@auth/anonymous';

const router: Router = Router();

const PasswordResetTokenSchema = Joi.string()
  .regex(/^[A-Za-z0-9]{64}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid reset password token format.',
  });

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).required().messages({
    'string.min': 'Old password must be at least 8 characters long.',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters long.',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email format. Please enter a valid email address.',
    }),
});

const PasswordResetSchema = Joi.object({
  token: PasswordResetTokenSchema,
  password: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters long.',
  }),
});

const getPasswordResetRequestSchema = Joi.object({
  token: PasswordResetTokenSchema,
});

router.post('/changePassword', authenticateUser, validateSchema(changePasswordSchema, ValidationSource.BODY), changePassword);
router.post('/forgotPassword', anonymousUser, validateSchema(forgotPasswordSchema, ValidationSource.BODY), forgotPassword);
router.post('/resetPassword', anonymousUser, validateSchema(PasswordResetSchema, ValidationSource.BODY), resetPassword);
router.get('/resetPassword/:token?', anonymousUser, validateSchema(getPasswordResetRequestSchema, ValidationSource.PARAM), getPasswordResetRequest);
export default router;
