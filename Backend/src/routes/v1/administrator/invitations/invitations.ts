import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { UserTypes } from '@database/models/User';
import { sendInvitation } from '@controllers/administrator/invitations/invitations';

const router: Router = Router();

const sendInvitationSchema = Joi.object({
  emails: Joi.array()
    .items(
      Joi.string()
        .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid email address format.',
        }),
    )
    .required()
    .messages({
      'array.base': 'Emails field must be an array.',
    }),
  type: Joi.string()
    .valid(...Object.values(UserTypes))
    .required()
    .messages({
      'any.only': 'Invalid user type.',
    }),
  clss: Joi.when('type', {
    is: UserTypes.Student,
    then: Joi.string().required().messages({
      'any.required': 'Class is required when type is Student.',
    }),
  }),
});

router.post('/invite', validateSchema(sendInvitationSchema, ValidationSource.BODY), sendInvitation);
export default router;
