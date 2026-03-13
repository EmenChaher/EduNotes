import { Request, Response } from 'express';
import User, { IUser, UserTypes } from '@database/models/User';
import { SuccessResponse } from '@core/ApiResponse';
import { BadRequestError, ForbiddenError, NotFoundError } from '@core/ApiError';
import Invitation, { InvitationStatus } from '@database/models/Invitation';
import expressAsyncHandler from 'express-async-handler';

export const registerUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { invitation, cin, name, surname, email, gender, phone, password, birthdate, region, type } = req.body;
  const lowercasedEmail = email.toLowerCase();

  const existingInvitation = await Invitation.findOne({ token: invitation });
  if (!existingInvitation) throw new NotFoundError('Invitation not found.');

  if (existingInvitation.status === InvitationStatus.Expired) throw new ForbiddenError('This invitation has expired.');

  if (existingInvitation.status === InvitationStatus.Accepted) throw new ForbiddenError('This invitation has already been used.');

  if (existingInvitation.email !== lowercasedEmail)
    throw new BadRequestError('The email in the invitation does not match the email used for registration.');

  const existingUser = await User.findOne({
    $or: [{ cin }, { email: lowercasedEmail }],
    deletedAt: null, // Only check active users, not deleted ones
  });
  if (existingUser) {
    if (existingUser.email === lowercasedEmail) throw new BadRequestError('An account with this e-mail address already exists.');
    else if (existingUser.cin === cin) throw new BadRequestError('An account with this CIN already exists.');
  }

  if (type === UserTypes.SuperAdmin) {
    const existingSuperAdmin = await User.findOne({ type: UserTypes.SuperAdmin, deletedAt: null });
    if (existingSuperAdmin) throw new ForbiddenError('Super admin account already exists.');
  }

  let dynamicFields: Partial<IUser> = {};
  switch (type) {
    case UserTypes.Student:
      dynamicFields = { class: existingInvitation.class, enrollmentYear: req.body.enrollmentYear, studyStatus: req.body.studyStatus };
      break;
    case UserTypes.Teacher:
      dynamicFields = { rank: req.body.rank, specialization: req.body.specialization };
      break;
    case UserTypes.Admin:
      dynamicFields = { jobStatus: req.body.jobStatus, recruitmentYear: req.body.recruitmentYear };
      break;
    case UserTypes.SuperAdmin:
      dynamicFields = { jobStatus: req.body.jobStatus, recruitmentYear: req.body.recruitmentYear, mission: req.body.mission };
      break;
    default:
      break;
  }

  const newUser: IUser = new User({
    cin,
    name: capitalizeFirstLetter(name),
    surname: capitalizeFirstLetter(surname),
    email: lowercasedEmail,
    gender,
    phone,
    password,
    birthdate,
    region,
    type,
    ...dynamicFields,
  });

  await newUser.save();
  await Invitation.findOneAndUpdate({ token: invitation }, { $set: { status: InvitationStatus.Accepted } });
  const user = await User.findById(newUser?.id);
  new SuccessResponse('User registered successfully.', user).send(res);
});

const capitalizeFirstLetter = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
