import { UserTypes } from "./user"

export enum InvitationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Expired = "Expired",
}

export interface IInvitation {
  _id: string
  email: string
  token: string
  type: UserTypes
  status: InvitationStatus
}
