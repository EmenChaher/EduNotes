import { socketServer } from './server';
import { Socket } from 'socket.io';
import { decodeAccessToken, validateAccessTokenData } from '@auth/authUtils';
import { JwtPayload } from 'jsonwebtoken';
import User from '@database/models/User';
import { AuthFailureError } from '@core/ApiError';

socketServer.use(async (socket: Socket, next) => {
  try {
    const token = socket.handshake.query.token as string;
    if (!token) {
      return next(new Error('Authentication is required.'));
    }

    const payload = decodeAccessToken(token);
    if (typeof payload !== 'object' || payload === null) {
      return next(new Error('Unable to decode access token.'));
    }

    const validData = validateAccessTokenData(payload as JwtPayload);
    if (!validData) {
      return next(new Error('Invalid access token data.'));
    }

    const user = await User.findById(payload.id)
      .select('+password')
      .populate({
        path: 'class',
        populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
      });

    if (!user) {
      return next(new AuthFailureError('User not registered.'));
    }

    (socket as any).user = user;
    next();
  } catch (err: any) {
    next(err);
  }
});

socketServer.on('connection', (socket: Socket) => {
  const user = (socket as any).user;
  if (!user || !user._id) {
    socket.disconnect(true);
    return;
  }

  const roomId = `user_${user._id}`;
  socket.join(roomId);
});

export default socketServer;
