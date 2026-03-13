import { AuthFailureError } from '@core/ApiError';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from './authentication';
import { UserTypes } from '@database/models/User';

const authorizeUser = (types: UserTypes[]) =>
  expressAsyncHandler(async (req: AuthRequest, res, next) => {
    if (!req.user || !req.user.type) throw new AuthFailureError('User data not found. Permission denied.');
    if (types.includes(req.user.type)) return next();
    throw new AuthFailureError('Permission denied.');
  });

export default authorizeUser;
