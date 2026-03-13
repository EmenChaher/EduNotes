import { Request, Response } from 'express';
import User from '@database/models/User';
import { SuccessResponse } from '@core/ApiResponse';
import { AuthFailureError } from '@core/ApiError';
import { tokenInfo } from '@config/envVar';
import { createAccessToken } from '@auth/authUtils';
import expressAsyncHandler from 'express-async-handler';

export const loginUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email, password: reqPassword, remember } = req.body;
  const lowercasedEmail = email.toLowerCase();

  const user = await User.findOne({ deletedAt: null, email: lowercasedEmail })
    .select('+password')
    .populate({ path: 'class', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } });
  if (!user) throw new AuthFailureError('Invalid credentials.');

  const passwordMatch = await user.comparePassword(reqPassword);
  if (!passwordMatch) throw new AuthFailureError('Invalid credentials.');

  const tokenExpiration = remember ? tokenInfo.longTokenExpiration : tokenInfo.shortTokenExpiration;
  const access_token = await createAccessToken(user, tokenExpiration);
  const { password, ...userWithoutPassword } = user.toObject();

  new SuccessResponse('User logged in successfully.', { access_token, user: userWithoutPassword }).send(res);
});
