import { combineReducers } from "redux"
import classReducer from "./classes/slice"
import diplomasReducer from "./diplomas/slice"
import levelsReducer from "./levels/slice"
import studyFieldsReducer from "./studyFields/slice"
import subjectsReducer from "./subjects/slice"
import teachingsReducer from "./teachings/slice"
import unitsReducer from "./units/slice"
import usersReducer from "./users/slice"
import teachersReducer from "./teachers/slice"
import statisticsReducer from "../admin/statistics/slice"

const administratorReducer = combineReducers({
  classes: classReducer,
  diplomas: diplomasReducer,
  levels: levelsReducer,
  studyFields: studyFieldsReducer,
  subjects: subjectsReducer,
  teachings: teachingsReducer,
  units: unitsReducer,
  users: usersReducer,
  teachers: teachersReducer,
  statistics: statisticsReducer,
})

export default administratorReducer
