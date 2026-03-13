import { IClass } from "./class"

export enum UserTypes {
  Student = "Student",
  Teacher = "Teacher",
  Admin = "Admin",
  SuperAdmin = "Super Admin",
}

export const userTypeDictionary = {
  [UserTypes.Student]: "Étudiant",
  [UserTypes.Teacher]: "Enseignant",
  [UserTypes.Admin]: "Administrateur",
  [UserTypes.SuperAdmin]: "Super Administrateur",
}

export interface IUser {
  _id: string
  cin: string
  name: string
  surname: string
  email: string
  type: UserTypes
  gender: string
  phone: string
  password: string
  repeatPassword: string
  birthdate: string
  region: string
  rank?: string
  specialization?: string
  class?: IClass
  studyStatus?: string
  enrollmentYear?: string
  jobStatus?: string
  recruitmentYear?: string
  mission?: string
}
