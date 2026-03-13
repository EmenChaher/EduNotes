export enum PasswordResetStatus {
  Pending = "Pending",
  Completed = "Completed",
}

export interface IPasswordReset {
  _id: string
  email: string
  token: string
  status: PasswordResetStatus
  expiresAt: Date
  isRequestExpired(): Promise<boolean>
}
