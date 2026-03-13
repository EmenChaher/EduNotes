import { combineReducers } from "redux"
import subjectReducer from "./subjects/slice"
import gradesReducer from "./grades/slice"
import statisticsReducer from "./statistics/slice"

const studentReducer = combineReducers({
  subjects: subjectReducer,
  grades: gradesReducer,
  statistics: statisticsReducer,
})

export default studentReducer
