import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { getInvitation } from '@controllers/shared/invitation/invitation';
import anonymousUser from '@auth/anonymous';

const router: Router = Router();

export const invitationCodeSchema = Joi.string()
  .regex(/^[A-Za-z0-9]{64}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid invitation format.',
  });

const getInvitationSchema = Joi.object({
  token: invitationCodeSchema,
});

router.get('/invite/:token?', anonymousUser, validateSchema(getInvitationSchema, ValidationSource.PARAM), getInvitation);
export default router;
