// import { DataRequest, ProtectedRequest } from 'app-request';
// import { Response, NextFunction } from 'express';
// import InfoRepo from '@database/repository/InfoRepo';
// import { Types } from 'mongoose';
// import { NotFoundError } from '@core/ApiError';

// const validateInfo = async (req: DataRequest, res: Response, next: NextFunction) => {
//   const info = await InfoRepo.getInfo(new Types.ObjectId(req.params.id));
//   if (!info) next(new NotFoundError('Info not found or deleted!'));
//   req.data = info;
//   next();
// };

// export default validateInfo;
