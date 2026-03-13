import { IStudyFieldRelatedData } from "./studyField"

export enum IDiplomaTypes {
  LMD = "LMD",
  Engineering = "Ingénierie",
}

export interface IDiploma {
  _id: string
  label: string
  type: IDiplomaTypes
}

export interface IDiplomaRelatedData {
  studyFields: IStudyFieldRelatedData[]
}
