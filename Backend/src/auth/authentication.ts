import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AuthFailureError, AccessTokenError, TokenExpiredError, BadRequestError } from '@core/ApiError';
import expressAsyncHandler from 'express-async-handler';
import User, { IUser } from '@database/models/User';
import { decodeAccessToken, getAccessToken, validateAccessTokenData } from './authUtils';

export interface AuthRequest extends Request {
  user?: IUser;
  accessToken?: string;
}

const authenticateUser = expressAsyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = getAccessToken(req.headers.authorization);
    const payload = decodeAccessToken(accessToken);
    if (typeof payload !== 'object' || payload === null) {
      throw new AuthFailureError('Unable to decode access token.');
    }

    const validData = validateAccessTokenData(payload as JwtPayload);
    if (!validData) {
      throw new AuthFailureError('Invalid access token data.');
    }

    const user = await User.findOne({ _id: payload.id, deletedAt: null })
      .select('+password')
      .populate({ path: 'class', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } });
    if (!user) {
      throw new AuthFailureError('User not registered.');
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AccessTokenError(error.message);
    }
    next(error);
  }
});

export default authenticateUser;
