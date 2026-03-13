export const environment = process.env.NODE_ENV || '';
export const expressPort = process.env.EXPRESS_PORT || 5099;
export const webSocketPort = process.env.WEBSOCKET_PORT || '';
export const baseUrl = process.env.BASE_URL || '';
export const apiPrefix = process.env.API_PREFIX || '';
export const clientBaseUrl = process.env.CLIENT_BASE_URL || '';
export const passwordResetExpiration = process.env.PASSWORD_RESET_EXPIRATION || '';
export const openAiApiKey = process.env.OPENAI_API_KEY || '';

export const db = {
  name: process.env.DB_NAME || '',
  connectionString: process.env.DB_CONNECTION_STRING || '',
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  shortTokenExpiration: process.env.TOKEN_EXPIRATION_SHORT || '0',
  longTokenExpiration: process.env.TOKEN_EXPIRATION_LONG || '0',
  tokenSecret: process.env.TOKEN_SECRET || '',
};

export const logDirectory = process.env.LOG_DIR || '';

export const seeder = {
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || '',
};

export const email = {
  fromEmail: process.env.SYSTEM_FROM_EMAIL || '',
  smtpService: process.env.SMTP_SERVICE || '',
  smtpHost: process.env.EMAIL_HOST || '',
  smtpPort: process.env.EMAIL_PORT || '',
  smtpUser: process.env.EMAIL_USERNAME || '',
  smtpPass: process.env.EMAIL_PASSWORD || '',
};
