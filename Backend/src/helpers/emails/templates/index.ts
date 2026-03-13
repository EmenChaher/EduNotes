interface invitationVariables {
  type: string;
  link: string;
}

interface PasswordResetVariables {
  name: string;
  link: string;
}

interface EmailConfirmedLinkVariables {
  name: string;
  confirmationLink: string;
}

export interface TemplateVariablesMap {
  invitation: invitationVariables;
  passwordReset: PasswordResetVariables;
  emailConfirmationLink: EmailConfirmedLinkVariables;
}
