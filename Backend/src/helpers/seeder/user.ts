import { EMOJIS } from '@constants/emojis';
import User, { UserTypes } from '@database/models/User';
import Invitation, { IInvitation } from '@database/models/Invitation';
import { clientBaseUrl } from '@config/envVar';
import Logger from '@core/Logger';
import { sendEmail } from '../emails';
import { generateRandomToken } from '../utils/token';

export const seedUser = async (email: string) => {
  const existingSuperAdmin = await User.findOne({ type: UserTypes.SuperAdmin });
  if (existingSuperAdmin) return Logger.error(`${EMOJIS.NO_ENTRY} Super admin account already exists ${EMOJIS.NO_ENTRY}`);

  const existingSuperAdminInvitation = await Invitation.findOne({ type: UserTypes.SuperAdmin });
  if (existingSuperAdminInvitation) return Logger.error(`${EMOJIS.NO_ENTRY} Super admin invitation has been already sent ${EMOJIS.NO_ENTRY}`);

  const token = generateRandomToken();

  const invitationLink = `${clientBaseUrl}/register/${token}`;
  const invitationEmail = await sendEmail(
    {
      email: email,
      subject: 'Votre invitation vous attend!',
      template: 'invitation',
      variables: { type: UserTypes.SuperAdmin, link: invitationLink },
    },
    'brevo',
  );

  if (!invitationEmail)
    return Logger.error(`${EMOJIS.NO_ENTRY} Error occurred while sending the super administrator invitation email. ${EMOJIS.NO_ENTRY}`);

  const newInvitation: IInvitation = new Invitation({
    email: email,
    token,
    type: UserTypes.SuperAdmin,
  });

  await newInvitation.save();
  Logger.info(`${EMOJIS.SUCCESS} Super admin invitation has been successfuly sent ${EMOJIS.SUCCESS}`);
};
