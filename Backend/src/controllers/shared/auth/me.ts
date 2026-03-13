import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { AuthRequest } from '@auth/authentication';
import expressAsyncHandler from 'express-async-handler';
import { AuthFailureError } from '@core/ApiError';

export const getMe = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) throw new AuthFailureError('Failed to fetch user data.');

  new SuccessResponse('User data fetched successfully.', { user }).send(res);
});
