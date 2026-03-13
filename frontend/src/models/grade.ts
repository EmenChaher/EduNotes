import { IUser } from "./user"

export interface IGrade {
  _id: string
  value: number | "ABS" | "DISP"
  student: IUser | string
  report: string
  deletedAt: Date | null
}
