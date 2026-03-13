import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { corsUrl, environment } from './config/envVar';
import Logger from './core/Logger';
import './database';
import { NotFoundError, ApiError, InternalError } from './core/ApiError';
import routesV1 from './routes/v1';
import { app as socketApp } from '@socket/server';

process.on('uncaughtException', (e) => {
  Logger.error(e);
});

const app = express();
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200, credentials: true }));

app.use('/api/v1', routesV1);
app.use('/public', express.static('public'));

socketApp;

app.use((req, res, next) => next(new NotFoundError()));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (environment === 'development') {
      Logger.error(err.message);
      return res.status(500).send({ status: 'fail', message: err.message });
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
