import { IClass } from "./class"
import { IStudyField } from "./studyField"
import { IUnit } from "./unit"

export interface ILevel {
  _id: string
  label: string
  studyField: IStudyField
}

export interface ILevelRelatedData extends ILevel {
  classes: IClass[]
  units: IUnit[]
}
