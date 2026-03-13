import { Request } from 'express';
import expressAsyncHandler from 'express-async-handler';

const anonymousUser = expressAsyncHandler(async (req: Request, res, next) => {
  return next();
});

export default anonymousUser;
