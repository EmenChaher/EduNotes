import { combineReducers } from "redux"
import classReducer from "./classes/slice"
import subjectReducer from "./subjects/slice"
import subjectTypesReducer from "./subjectTypes/slice"
import subjectTypeContentReducer from "./subjectTypeContent/slice"
import gradesReducer from "./grades/slice"
import statisticsReducer from "./statistics/slice"

const teacherReducer = combineReducers({
  classes: classReducer,
  subjects: subjectReducer,
  subjectTypes: subjectTypesReducer,
  subjectTypeContent: subjectTypeContentReducer,
  grades: gradesReducer,
  statistics: statisticsReducer,
})

export default teacherReducer
