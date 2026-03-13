import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import ejs from 'ejs';
import { email } from '@config/envVar';
import Logger from '@core/Logger';
import { TemplateVariablesMap } from './templates';
import { EMOJIS } from '@constants/emojis';

type EmailService = 'gmail' | 'mailgun' | 'sendgrid' | 'mailjet' | 'brevo' | 'sendinblue' | 'zoho' | 'yandex' | 'qq' | 'hotmail' | 'icloud';

interface EmailOptions<T extends keyof TemplateVariablesMap> {
  email: string;
  subject: string;
  message?: string;
  from?: string;
  template?: T;
  variables?: TemplateVariablesMap[T];
}

export const sendEmail = async <T extends keyof TemplateVariablesMap>(
  options: EmailOptions<T>,
  smtpService: EmailService = 'gmail',
  html: boolean = false,
): Promise<boolean> => {
  let transporter: Transporter<unknown>;

  const mailOptions = {
    from: options.from || email.fromEmail || email.smtpUser,
    to: options.email.toLowerCase(),
    subject: options.subject,
    text: options.message ? options.message : '',
    html: html ? '' : undefined,
  };

  try {
    if (smtpService === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email.smtpUser,
          pass: email.smtpPass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: email.smtpHost,
        port: Number(email.smtpPort),
        auth: {
          user: email.smtpUser,
          pass: email.smtpPass,
        },
      });
    }

    if (options.template) {
      const variables = { ...options.variables, date: new Date() };
      const htmlContent = await ejs.renderFile(`${__dirname}/templates/${options.template}.ejs`, variables);
      if (!htmlContent) {
        Logger.error('Error occurred while rendering email template.');
        return false;
      }
      mailOptions.html = htmlContent;
    }
    await transporter.sendMail(mailOptions);
    Logger.info(`Email successfully sent to ${options.email.toLowerCase()} ${EMOJIS.SUCCESS}`);
    return true;
  } catch (error) {
    Logger.error('Error sending email:', error);
    return false;
  }
};
