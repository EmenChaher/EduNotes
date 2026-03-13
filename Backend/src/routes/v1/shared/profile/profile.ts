import { Router } from 'express';
import Joi from 'joi';
import { validateSchema } from '@helpers/validator';
import { ValidationSource } from '@helpers/validator';
import Regions from '@constants/Regions';
import StudentStatus from '@constants/StudentStatus';
import TeacherRank from '@constants/TeacherRank';
import TeacherSpecialization from '@constants/TeacherSpecialization';
import AdministratorStatus from '@constants/AdministratorStatus';
import Genders from '@constants/Genders';
import authenticateUser from '@auth/authentication';
import { updateUserProfile } from '@controllers/shared/profile/profile';

const router: Router = Router();

const currentDate = new Date();
const profileSchema = Joi.object({
  cin: Joi.string()
    .regex(/^\d{8}$/)
    .messages({
      'string.pattern.base': 'Invalid CIN format. Must be 8 digits.',
    }),
  name: Joi.string()
    .regex(/^[a-zA-Z\s]*$/)
    .max(30)
    .messages({
      'string.pattern.base': 'Invalid name format. Only letters and spaces allowed.',
      'string.max': 'Name must not exceed 30 characters.',
    }),
  surname: Joi.string()
    .regex(/^[a-zA-Z\s]*$/)
    .max(30)
    .messages({
      'string.pattern.base': 'Invalid surname format. Only letters and spaces allowed.',
      'string.max': 'Surname must not exceed 30 characters.',
    }),
  email: Joi.string()
    .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .messages({
      'string.pattern.base': 'Invalid email format. Please enter a valid email address.',
    }),
  phone: Joi.string()
    .regex(/^\d{8}$/)
    .messages({
      'string.pattern.base': 'Invalid phone number format. Must be 8 digits.',
      'string.empty': 'Phone number is required.',
    }),
  gender: Joi.string()
    .valid(...Genders)
    .messages({
      'string.pattern.base': 'Invalid gender.',
    }),
  birthdate: Joi.date()
    .min(new Date(currentDate.getFullYear() - 80, currentDate.getMonth(), currentDate.getDate()))
    .max(new Date(currentDate.getFullYear() - 16, currentDate.getMonth(), currentDate.getDate()))
    .messages({
      'date.base': 'Invalid birthdate format.',
      'date.min': 'Minimum age requirement is 16 years old.',
      'date.max': 'Maximum age requirement is 80 years old.',
    }),
  region: Joi.string().valid(...Regions),
  enrollmentYear: Joi.number()
    .integer()
    .min(currentDate.getFullYear() - 6)
    .max(currentDate.getFullYear())
    .messages({
      'number.base': 'Invalid enrollment year format.',
      'number.min': 'Enrollment year cannot be more than 6 years in the future.',
      'number.max': 'Enrollment year cannot be more than the current year.',
    }),
  studyStatus: Joi.string().valid(...StudentStatus),
  rank: Joi.string().valid(...TeacherRank),
  specialization: Joi.string().valid(...TeacherSpecialization),
  recruitmentYear: Joi.number()
    .integer()
    .min(currentDate.getFullYear() - 60)
    .max(currentDate.getFullYear())
    .messages({
      'number.base': 'Invalid recruitment year format.',
      'number.min': 'Recruitment year cannot be more than 60 years in the past.',
      'number.max': 'Recruitment year cannot be more than the current year.',
    }),
  jobStatus: Joi.string().valid(...AdministratorStatus),
  mission: Joi.string(),
}).min(1);

router.patch('/profile', authenticateUser, validateSchema(profileSchema, ValidationSource.BODY), updateUserProfile);
export default router;
