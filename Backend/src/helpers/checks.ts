import 'dotenv/config';
import {
  environment,
  expressPort,
  webSocketPort,
  baseUrl,
  db,
  corsUrl,
  tokenInfo,
  openAiApiKey,
  logDirectory,
  seeder,
  apiPrefix,
  clientBaseUrl,
  email,
} from '@config/envVar';
import { EMOJIS } from '@constants/emojis';

export const checkAllEnsAreNotEmpty = () => {
  const envs = [
    environment,
    expressPort,
    webSocketPort,
    baseUrl,
    openAiApiKey,
    apiPrefix,
    clientBaseUrl,
    db.name,
    db.connectionString,
    corsUrl,
    tokenInfo.shortTokenExpiration,
    tokenInfo.longTokenExpiration,
    tokenInfo.tokenSecret,
    logDirectory,
    seeder.superAdminEmail,
    email.fromEmail,
    email.smtpService,
    email.smtpHost,
    email.smtpPort,
    email.smtpUser,
    email.smtpPass,
  ];
  envs.forEach((env) => {
    if (!env) {
      console.error(`\n${EMOJIS.PROHIBITED}\tOne of the environment variables is not set! \n`);
      process.exit(0);
    }
  });
  console.info(`\n${EMOJIS.SUCCESS}\tAll environment variables are set! \n`);
};

checkAllEnsAreNotEmpty();
