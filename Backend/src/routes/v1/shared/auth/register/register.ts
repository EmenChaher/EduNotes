import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import { registerUser } from '@controllers/shared/auth/register';
import { UserTypes } from '@database/models/User';
import anonymousUser from '@auth/anonymous';
import Regions from '@constants/Regions';
import StudentStatus from '@constants/StudentStatus';
import TeacherRank from '@constants/TeacherRank';
import TeacherSpecialization from '@constants/TeacherSpecialization';
import AdministratorStatus from '@constants/AdministratorStatus';
import Genders from '@constants/Genders';
import { invitationCodeSchema } from '../../invitation/invitation';

const router: Router = Router();

const currentDate = new Date();
const registerSchema = Joi.object({
  invitation: invitationCodeSchema,
  cin: Joi.string()
    .regex(/^\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid CIN format. Must be 8 digits.',
    }),
  name: Joi.string()
    .regex(/^[a-zA-Z\s]*$/)
    .max(30)
    .required()
    .messages({
      'string.pattern.base': 'Invalid name format. Only letters and spaces allowed.',
      'string.max': 'Name must not exceed 30 characters.',
    }),
  surname: Joi.string()
    .regex(/^[a-zA-Z\s]*$/)
    .max(30)
    .required()
    .messages({
      'string.pattern.base': 'Invalid surname format. Only letters and spaces allowed.',
      'string.max': 'Surname must not exceed 30 characters.',
    }),
  email: Joi.string()
    .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid email format. Please enter a valid email address.',
    }),
  gender: Joi.string()
    .valid(...Genders)
    .required()
    .messages({
      'string.pattern.base': 'Invalid gender.',
    }),
  phone: Joi.string()
    .regex(/^\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format. Must be 8 digits.',
      'string.empty': 'Phone number is required.',
    }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
  }),
  birthdate: Joi.date()
    .min(new Date(currentDate.getFullYear() - 80, currentDate.getMonth(), currentDate.getDate()))
    .max(new Date(currentDate.getFullYear() - 16, currentDate.getMonth(), currentDate.getDate()))
    .required()
    .messages({
      'date.base': 'Invalid birthdate format.',
      'date.min': 'Minimum age requirement is 16 years old.',
      'date.max': 'Maximum age requirement is 80 years old.',
    }),
  region: Joi.string()
    .valid(...Regions)
    .required(),
  type: Joi.string()
    .valid(...Object.values(UserTypes))
    .required()
    .messages({
      'any.only': 'Invalid user type.',
    }),
  enrollmentYear: Joi.when('type', {
    is: UserTypes.Student,
    then: Joi.number()
      .integer()
      .min(currentDate.getFullYear() - 6)
      .max(currentDate.getFullYear())
      .required()
      .messages({
        'number.base': 'Invalid enrollment year format.',
        'number.min': 'Enrollment year cannot be more than 6 years in the future.',
        'number.max': 'Enrollment year cannot be more than the current year.',
      }),
  }),
  studyStatus: Joi.when('type', {
    is: UserTypes.Student,
    then: Joi.string()
      .valid(...StudentStatus)
      .required(),
  }),
  rank: Joi.when('type', {
    is: UserTypes.Teacher,
    then: Joi.string()
      .valid(...TeacherRank)
      .required(),
  }),
  specialization: Joi.when('type', {
    is: UserTypes.Teacher,
    then: Joi.string()
      .valid(...TeacherSpecialization)
      .required(),
  }),
  recruitmentYear: Joi.when('type', {
    is: [UserTypes.Admin, UserTypes.SuperAdmin],
    then: Joi.number()
      .integer()
      .min(currentDate.getFullYear() - 60)
      .max(currentDate.getFullYear())
      .required()
      .messages({
        'number.base': 'Invalid recruitment year format.',
        'number.min': 'Recruitment year cannot be more than 60 years in the past.',
        'number.max': 'Recruitment year cannot be more than the current year.',
      }),
  }),
  jobStatus: Joi.when('type', {
    is: [UserTypes.Admin, UserTypes.SuperAdmin],
    then: Joi.string()
      .valid(...AdministratorStatus)
      .required(),
  }),
  mission: Joi.when('type', {
    is: UserTypes.SuperAdmin,
    then: Joi.string().required(),
  }),
});

router.post('/register', anonymousUser, validateSchema(registerSchema, ValidationSource.BODY), registerUser);
export default router;
