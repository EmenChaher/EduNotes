import mongoose from 'mongoose';
import { EMOJIS } from '@constants/emojis';
import Logger from '@core/Logger';

export let seedDelete = async () => {
  const collections = mongoose.modelNames();
  const deletedCollections = collections.map((collection) => mongoose.models[collection].deleteMany({}));
  await Promise.all(deletedCollections);
  Logger.info(`${EMOJIS.SUCCESS} Collections empty successfuly ${EMOJIS.SUCCESS}`);
};
