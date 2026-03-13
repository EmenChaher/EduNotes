import { IDiploma } from "./diploma"
import { ILevelRelatedData } from "./level"

export interface IStudyField {
  _id: string
  label: string
  acronym: string
  diploma: IDiploma
}

export interface IStudyFieldRelatedData extends IStudyField {
  levels: ILevelRelatedData[]
}
