import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import User, { IUser, UserTypes } from '@database/models/User';
import APIFeatures from '@helpers/apiFeatures';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import { AuthRequest } from '@auth/authentication';
import { handleQueryParams } from '@helpers/utils/query';
import Invitation, { InvitationStatus } from '@database/models/Invitation';

export const getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, gender, cin, name, surname, email, telephone, birthdate, region, type } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const queryParams = {
    ...(gender && { gender: handleQueryParams(gender as string) }),
    ...(cin && { cin: handleQueryParams(cin as string) }),
    ...(name && { name: handleQueryParams(name as string) }),
    ...(surname && { surname: handleQueryParams(surname as string) }),
    ...(email && { email: handleQueryParams(email as string) }),
    ...(telephone && { telephone: handleQueryParams(telephone as string) }),
    ...(birthdate && { birthdate: handleQueryParams(birthdate as string) }),
    ...(region && { region: handleQueryParams(region as string) }),
    ...(type && { type: handleQueryParams(type as string) }),
  };

  const findAllQuery = User.find({ deletedAt: null })
    .sort({ createdAt: 1 })
    .populate({ path: 'class', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } });

  const features = new APIFeatures(findAllQuery, queryParams).filter().limitFields();

  const paginatedUsers = await User.paginate(features?.query, options);

  new SuccessResponse('Users retrieved successfully.', paginatedUsers).send(res);
});

export const updateUser = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const {
    cin,
    name,
    surname,
    email,
    gender,
    phone,
    birthdate,
    region,
    class: clss,
    enrollmentYear,
    studyStatus,
    rank,
    specialization,
    recruitmentYear,
    jobStatus,
    mission,
  } = req.body;

  const userToUpdate = await User.findOne({ _id: id, deletedAt: null });

  if (!userToUpdate) throw new NotFoundError('No user found with that ID.');

  if (userToUpdate.type === UserTypes.SuperAdmin && user?.type !== UserTypes.SuperAdmin) {
    throw new ForbiddenError('Only Super Admins are allowed to modify their profiles.');
  }

  if (userToUpdate.type === UserTypes.Admin && userToUpdate._id !== user?._id && user?.type !== UserTypes.SuperAdmin) {
    throw new ForbiddenError('Only Super Admins are allowed to modify other admin profiles.');
  }

  const updateFields: Record<string, string> = {};

  if (cin !== undefined) {
    updateFields.cin = cin;
  }
  if (name !== undefined) {
    updateFields.name = name;
  }
  if (surname !== undefined) {
    updateFields.surname = surname;
  }
  if (surname !== undefined) {
    updateFields.surname = surname;
  }
  if (email !== undefined) {
    updateFields.email = email.toLowerCase();
  }
  if (gender !== undefined) {
    updateFields.gender = gender;
  }
  if (phone !== undefined) {
    updateFields.phone = phone;
  }
  if (birthdate !== undefined) {
    updateFields.birthdate = birthdate;
  }
  if (region !== undefined) {
    updateFields.region = region;
  }
  if (clss !== undefined || enrollmentYear !== undefined || studyStatus !== undefined) {
    if (userToUpdate.type !== UserTypes.Student) {
      if (clss !== undefined) {
        throw new ForbiddenError(`Class field can only be modified when user type is ${UserTypes.Student}`);
      }
      if (enrollmentYear !== undefined) {
        throw new ForbiddenError(`Enrollment Year field can only be modified when user type is ${UserTypes.Student}`);
      }
      if (studyStatus !== undefined) {
        throw new ForbiddenError(`Study Status field can only be modified when user type is ${UserTypes.Student}`);
      }
    } else {
      if (clss !== undefined) {
        updateFields.class = clss;
      }
      if (enrollmentYear !== undefined) {
        updateFields.enrollmentYear = enrollmentYear;
      }
      if (studyStatus !== undefined) {
        updateFields.studyStatus = studyStatus;
      }
    }
  }

  if (rank !== undefined || specialization !== undefined) {
    if (userToUpdate.type !== UserTypes.Teacher) {
      if (rank !== undefined) {
        throw new ForbiddenError(`Rank field can only be modified when user type is ${UserTypes.Teacher}`);
      }
      if (specialization !== undefined) {
        throw new ForbiddenError(`Specialization Year field can only be modified when user type is ${UserTypes.Teacher}`);
      }
    } else {
      if (rank !== undefined) {
        updateFields.rank = rank;
      }
      if (specialization !== undefined) {
        updateFields.specialization = specialization;
      }
    }
  }

  if (recruitmentYear !== undefined || jobStatus !== undefined) {
    if (userToUpdate.type !== UserTypes.Admin && userToUpdate.type !== UserTypes.SuperAdmin) {
      if (recruitmentYear !== undefined) {
        throw new ForbiddenError(`RecruitmentYear field can only be modified when user type is ${UserTypes.Admin} or ${UserTypes.SuperAdmin}`);
      }
      if (jobStatus !== undefined) {
        throw new ForbiddenError(`JobStatus Year field can only be modified when user type is ${UserTypes.Admin} or ${UserTypes.SuperAdmin}`);
      }
    } else {
      if (recruitmentYear !== undefined) {
        updateFields.recruitmentYear = recruitmentYear;
      }
      if (jobStatus !== undefined) {
        updateFields.jobStatus = jobStatus;
      }
    }
  }

  if (mission !== undefined) {
    if (userToUpdate.type !== UserTypes.SuperAdmin) {
      if (mission !== undefined) {
        throw new ForbiddenError(`Mission field can only be modified when user type is ${UserTypes.SuperAdmin}`);
      }
    }
    updateFields.mission = mission;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true }).populate({
    path: 'class',
    populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
  });

  new SuccessResponse('User has been successfully updated.', { user: updatedUser }).send(res);
});

export const promoteUser = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const currentUser = req.user as IUser;

  // Only SuperAdmin can promote users
  if (!currentUser || currentUser.type !== UserTypes.SuperAdmin) {
    throw new ForbiddenError('Only Super Admins can promote users.');
  }

  const userToPromote = await User.findOne({ _id: id, deletedAt: null });

  if (!userToPromote) throw new NotFoundError('No user found with that ID.');

  if (userToPromote.type !== UserTypes.Admin) {
    throw new ForbiddenError('You can only promote admins to super admin.');
  }

  // Check if user is trying to promote themselves
  if (String(currentUser._id) === id) {
    throw new ForbiddenError('You cannot promote yourself.');
  }

  // Demote current SuperAdmin to Admin (there can only be one SuperAdmin)
  await User.findOneAndUpdate({ _id: currentUser._id, deletedAt: null }, { type: UserTypes.Admin }, { new: true });

  // Promote the target user to SuperAdmin
  const promotedUser = await User.findOneAndUpdate({ _id: id, deletedAt: null }, { type: UserTypes.SuperAdmin }, { new: true }).populate({
    path: 'class',
    populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
  });

  new SuccessResponse('User has been successfully promoted.', {
    promotedUser,
    previousSuperAdminId: currentUser._id,
  }).send(res);
});

export const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const userToDelete = await User.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!userToDelete) throw new NotFoundError('No user found with that ID.');

  // Mark any existing invitations as expired to allow re-invitation while preserving history
  await Invitation.updateMany({ email: userToDelete.email, status: { $ne: InvitationStatus.Expired } }, { status: InvitationStatus.Expired });

  new SuccessResponse('User has been successfully deleted.').send(res);
});
