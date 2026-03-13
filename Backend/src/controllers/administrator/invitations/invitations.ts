import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, InternalError, NotFoundError } from '@core/ApiError';
import Invitation, { IInvitation, InvitationStatus } from '@database/models/Invitation';
import User, { UserTypes } from '@database/models/User';
import { sendEmail } from '@helpers/emails';
import { clientBaseUrl } from '@config/envVar';
import { generateRandomToken } from '@helpers/utils/token';
import expressAsyncHandler from 'express-async-handler';

const userTypeDictionary = {
  [UserTypes.Student]: 'Etudiant',
  [UserTypes.Teacher]: 'Enseignant',
  [UserTypes.Admin]: 'Administrateur',
  [UserTypes.SuperAdmin]: 'Super Administrateur',
};

export const sendInvitation = expressAsyncHandler(async (req: Request, res: Response) => {
  const { emails, type, clss } = req.body;

  if (type === UserTypes.SuperAdmin) {
    const existingSuperadminInvite = await Invitation.findOne({ type: UserTypes.SuperAdmin });
    if (existingSuperadminInvite) throw new ForbiddenError('Super admin has already been invited.');

    const existingSuperAdmin = await User.findOne({ type: UserTypes.SuperAdmin, deletedAt: null });
    if (existingSuperAdmin) throw new ForbiddenError('Super admin account already exists.');
  }

  await Promise.all(
    emails.map(async (email: string) => {
      const lowercasedEmail = email.toLowerCase();

      // Check for existing active user (not deleted)
      const user = await User.findOne({ email: lowercasedEmail, deletedAt: null });
      if (user) throw new ForbiddenError(`User with the email ${email} is already registered.`);

      // Check if user was deleted - if so, we can re-invite (ignore existing invitations)
      const deletedUser = await User.findOne({ email: lowercasedEmail, deletedAt: { $ne: null } });

      if (!deletedUser) {
        // User was never deleted, check for existing invitations normally
        const invitation = await Invitation.findOne({
          email: lowercasedEmail,
          $or: [
            { status: { $exists: false } }, // Old invitations without status field
            { status: { $ne: InvitationStatus.Expired } }, // New invitations that are not expired
          ],
        });
        if (invitation) throw new ForbiddenError(`Email ${email} is already invited.`);
      }
      // If user was deleted, we allow re-invitation (skip invitation check)
    }),
  );

  await Promise.all(
    emails.map(async (email: string) => {
      const lowercasedEmail = email.toLowerCase();
      const token = generateRandomToken();

      const invitationLink = `${clientBaseUrl}/register/${token}`;
      const invitationEmail = await sendEmail(
        {
          email: email,
          subject: 'Votre invitation vous attend!',
          template: 'invitation',
          variables: { type: userTypeDictionary[type as UserTypes], link: invitationLink },
        },
        'brevo',
      );

      if (!invitationEmail) throw new InternalError(`Error occurred while sending the invitation email to ${email}.`);

      const newInvitation: IInvitation = new Invitation({
        email: lowercasedEmail,
        token,
        type,
        class: clss,
      });

      await newInvitation.save();
    }),
  );

  new SuccessResponse('Invitations have been successfully sent.').send(res);
});
