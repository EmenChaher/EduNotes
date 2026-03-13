import { AuthFailureError, TokenExpiredError } from '@core/ApiError';
import { tokenInfo } from '@config/envVar';
import { IUser } from '@database/models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const decodeAccessToken = (token: string): JwtPayload | string | undefined => {
  try {
    return jwt.verify(token, tokenInfo.tokenSecret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthFailureError('Expired access token.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthFailureError('Invalid access token signature.');
    } else {
      console.log('An error occurred:', error);
    }
  }
};

export const getAccessToken = (authorization?: string) => {
  if (!authorization) throw new AuthFailureError('Authentication is required.');
  if (!authorization.startsWith('Bearer ')) throw new AuthFailureError('Invalid authentication.');
  return authorization.split(' ')[1];
};

export const validateAccessTokenData = (payload: JwtPayload): boolean => {
  if (!payload || !payload.id || !payload.iat || !payload.exp) throw new AuthFailureError('Invalid Access Token. Missing data.');
  return true;
};

export const createAccessToken = async (user: IUser, expiration: string): Promise<string> => {
  return jwt.sign({ id: user._id }, tokenInfo.tokenSecret, { expiresIn: expiration });
};
