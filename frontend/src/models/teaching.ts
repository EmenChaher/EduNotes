import { IClass } from "./class"
import { ISubject } from "./subject"
import { IUser } from "./user"

export enum TeachingType {
  Lecture = "lecture",
  GuidedSession = "guidedSession",
  PracticalSession = "practicalSession",
}
export const teachingTypeDictionary = {
  [TeachingType.Lecture]: "cours",
  [TeachingType.GuidedSession]: "Travaux dirigés",
  [TeachingType.PracticalSession]: "Travaux pratiques",
}

export interface ITeaching extends Document {
  _id: string
  teacher: IUser
  class: IClass
  subject: ISubject
  type: TeachingType
}
