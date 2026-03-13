import { IUser } from "./user"

export interface INotification {
  _id: string
  source: IUser
  target: string
  message: string
  read: boolean
  path?: string
  createdAt: Date
}
