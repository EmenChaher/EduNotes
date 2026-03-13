import { Response } from 'express';
import User, { UserTypes } from '@database/models/User';
import { SuccessResponse } from '@core/ApiResponse';
import { BadRequestError, ForbiddenError } from '@core/ApiError';
import { IUser } from '@database/models/User';
import { AuthRequest } from '@auth/authentication';
import expressAsyncHandler from 'express-async-handler';

const editableFields: Partial<{ [K in keyof IUser]: boolean }> = {
  cin: false,
  name: false,
  surname: false,
  email: true,
  phone: true,
  gender: true,
  birthdate: false,
  region: false,
  enrollmentYear: false,
  studyStatus: false,
  rank: false,
  specialization: false,
  recruitmentYear: false,
  jobStatus: false,
  mission: false,
};

export const updateUserProfile = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const isPreviliged = (req.user && (req.user.type === UserTypes.Admin || req.user.type === UserTypes.SuperAdmin)) || false;

  const profileUpdates: Partial<IUser> = {};

  for (const field in editableFields) {
    if (req.body[field] !== undefined) {
      const fieldName = field as keyof IUser;
      if (!(editableFields[fieldName] || isPreviliged)) {
        throw new ForbiddenError(`Modifying ${fieldName} is forbidden`);
      }
      if (fieldName === 'email') req.body[field] = req.body[field].toLowerCase();
      profileUpdates[fieldName] = req.body[field];
    }
  }

  if (Object.keys(profileUpdates).length === 0) {
    throw new BadRequestError('No fields updated.');
  }

  await User.findByIdAndUpdate(req.user!.id, profileUpdates);

  new SuccessResponse('Profile updated successfully.').send(res);
});
