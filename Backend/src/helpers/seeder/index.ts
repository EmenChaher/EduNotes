import { seedUser } from './user';
import { seeder } from '@config/envVar';
import { environment } from '@config/envVar';
import { seedDelete } from './drop';
import '@database/index';
import minimist from 'minimist';

export let seed = async (clearDatabaseFromFunction = false) => {
  const args = minimist(process.argv.slice(2));
  const clearDatabase = args.c || args.clearDatabase || clearDatabaseFromFunction;

  if (clearDatabase) await seedDelete();
  await seedUser(seeder.superAdminEmail);

  process.exit();
};

seed(environment === 'test');
