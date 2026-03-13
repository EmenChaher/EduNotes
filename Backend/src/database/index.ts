import mongoose from 'mongoose';
import Logger from '@core/Logger';
import { db, environment } from '@config/envVar';
import { EMOJIS } from '@constants/emojis';

const dbURI = `${db.connectionString}${db.name}`;
mongoose.set('strictQuery', false);

export async function connect() {
  await mongoose
    .connect(dbURI)
    .then(() => {
      Logger.info('Mongoose connection done');
    })
    .catch((e) => {
      Logger.info('Mongoose connection error');
      Logger.error(e);
    });
}

environment !== 'test' && connect();

mongoose.connection.on('connected', () => {
  Logger.info('Mongoose default connection open to ' + db.name + EMOJIS.SUCCESS);
});

mongoose.connection.on('error', (err) => {
  Logger.error('Mongoose default connection error: ' + err + EMOJIS.NO_ENTRY);
});

mongoose.connection.on('disconnected', () => {
  Logger.info('Mongoose default connection disconnected ' + EMOJIS.RAISED_HAND_WITH_FINGERS_SPLAYED);
});

process.once('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    Logger.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  } catch (error) {
    Logger.error('Error while closing Mongoose connection:', error);
    process.exit(1);
  }
});
