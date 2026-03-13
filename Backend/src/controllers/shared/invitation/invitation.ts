import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { NotFoundError } from '@core/ApiError';
import Invitation from '@database/models/Invitation';
//import { UserTypes } from '@database/models/User';
import expressAsyncHandler from 'express-async-handler';

export const getInvitation = expressAsyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const invitation = await Invitation.findOne({ token });
  if (!invitation) throw new NotFoundError('Invitation not found.');

  new SuccessResponse('Invitation found.', invitation).send(res);
});
