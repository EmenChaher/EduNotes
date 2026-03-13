import { ILevel } from "./level"
import { TeachingType } from "./teaching"
import { IUnit } from "./unit"

interface SubjectTypeDictionary {
  [key: string]: string
}

interface TransformedDictionary {
  [key: string]: string
}

export const subjectTypeDictionary: SubjectTypeDictionary = {
  [TeachingType.Lecture]: "Cours",
  [TeachingType.GuidedSession]: "Traveaux dirigés",
  [TeachingType.PracticalSession]: "Travaux pratiques",
}

export const transformedSubjectTypeDictionary: TransformedDictionary = {}
for (const key in subjectTypeDictionary) {
  if (subjectTypeDictionary.hasOwnProperty(key)) {
    const transformedKey = subjectTypeDictionary[key].toLowerCase().replace(/\s+/g, "-")
    transformedSubjectTypeDictionary[transformedKey] = key
  }
}

export enum SubjectContent {
  supervisedAssessment1 = "supervisedAssessment1",
  supervisedAssessment2 = "supervisedAssessment2",
  practical = "practical",
  exam = "exam",
  other = "other",
}

export const subjectContentDictionary: SubjectTypeDictionary = {
  [SubjectContent.supervisedAssessment1]: "DS1",
  [SubjectContent.supervisedAssessment2]: "DS2",
  [SubjectContent.practical]: "Examen TP",
  [SubjectContent.exam]: "Examen",
  [SubjectContent.other]: "Autre note",
}

export const transformedSubjectTypeContentDictionary: TransformedDictionary = {}
for (const key in subjectContentDictionary) {
  if (subjectContentDictionary.hasOwnProperty(key)) {
    const transformedKey = subjectContentDictionary[key].toLowerCase().replace(/\s+/g, "-")
    transformedSubjectTypeContentDictionary[transformedKey] = key
  }
}

export interface ISubjectGrading {
  _id: string
  supervisedAssessment1: number
  supervisedAssessment2: number
  practical: number
  exam: number
  other: number
}

export interface ISubject {
  _id: string
  label: string
  coefficient: number
  lecture: boolean
  guidedSession: boolean
  practicalSession: boolean
  grading: ISubjectGrading | string
  level: ILevel | string
  unit: IUnit | string
}

export interface ISubjectWithTypes extends ISubject {
  types: TeachingType[]
}
