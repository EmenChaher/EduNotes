import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import Logger from '@core/Logger';
import { BadRequestError } from '@core/ApiError';
import { Types } from 'mongoose';

export enum ValidationSource {
  BODY = 'body',
  HEADER = 'headers',
  QUERY = 'query',
  PARAM = 'params',
}

export const JoiObjectId = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }, 'Object Id Validation');

export const validateSchema =
  (schema: Schema, source: ValidationSource = ValidationSource.BODY) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req[source]);

      if (!error) return next();

      const { details } = error;
      const message = details.map((i) => i.message.replace(/['"]+/g, '')).join(',');
      Logger.error(message);

      return next(new BadRequestError(message));
    } catch (error) {
      return next(error);
    }
  };
