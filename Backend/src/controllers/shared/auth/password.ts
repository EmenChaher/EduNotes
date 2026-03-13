import { Request, Response } from 'express';
import User from '@database/models/User';
import { SuccessResponse } from '@core/ApiResponse';
import { AuthRequest } from '@auth/authentication';
import PasswordReset, { IPasswordReset, PasswordResetStatus } from '@database/models/PasswordReset';
import { generateRandomToken } from '@helpers/utils/token';
import { clientBaseUrl } from '@config/envVar';
import { sendEmail } from '@helpers/emails';
import expressAsyncHandler from 'express-async-handler';
import { AuthFailureError, BadRequestError, InternalError, NotFoundError } from '@core/ApiError';

export const changePassword = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = req.user;
  const passwordMatch = await user!.comparePassword(currentPassword);
  if (!passwordMatch) throw new BadRequestError('Invalid current password.');

  if (currentPassword === newPassword) throw new BadRequestError('Old password and new password must be different.');

  const updatedUser = await User.findById(req.user!.id);
  if (updatedUser) {
    updatedUser.password = newPassword;
    await updatedUser.save();
    new SuccessResponse('Password updated successfully.').send(res);
  }
});

export const forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const lowercasedEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowercasedEmail, deletedAt: null });
  if (!user) throw new AuthFailureError('No account found for this email.');

  const existingPasswordResetRequest = await PasswordReset.findOne({
    email: lowercasedEmail,
    status: PasswordResetStatus.Pending,
    expiresAt: { $gt: new Date() },
  });

  if (existingPasswordResetRequest)
    throw new BadRequestError('Password recovery request already exists. Please check your email or try again later.');

  const token = generateRandomToken();

  const passwordResetLink = `${clientBaseUrl}/passwordReset/${token}`;

  const passwordResetEmail = await sendEmail(
    {
      email: email,
      subject: 'Réinitialisation du mot de passe',
      template: 'passwordReset',
      variables: { name: user?.name, link: passwordResetLink },
    },
    'brevo',
  );

  if (!passwordResetEmail) throw new InternalError('Error occurred while sending the password reset email.');

  const newPasswordResetRequest: IPasswordReset = new PasswordReset({
    email: lowercasedEmail,
    token,
  });

  await newPasswordResetRequest.save();

  new SuccessResponse('Password reset instructions have been successfully sent.', newPasswordResetRequest).send(res);
});

export const resetPassword = expressAsyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const resetRequest: IPasswordReset | null = await PasswordReset.findOne({ token });

  if (!resetRequest) throw new NotFoundError('Password reset request not found.');

  if (await resetRequest.isRequestExpired()) throw new BadRequestError('The password reset request has expired.');

  const user = await User.findOne({ email: resetRequest.email, deletedAt: null });

  if (!user) throw new InternalError('Unable to find user.');

  user.password = password;
  await user.save();

  resetRequest.status = PasswordResetStatus.Completed;
  await resetRequest.save();

  new SuccessResponse('Password updated successfully.').send(res);
});

export const getPasswordResetRequest = expressAsyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const PasswordResetRequest = await PasswordReset.findOne({ token });
  if (!PasswordResetRequest) throw new NotFoundError('Reset password request not found.');
  const expired = await PasswordResetRequest.isRequestExpired();
  new SuccessResponse('Reset password request found.', PasswordResetRequest).send(res);
});
