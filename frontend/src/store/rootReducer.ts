import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "./slices/shared/auth/slice"
import notificationReducer from "./slices/shared/notification/slice"
import studentReducer from "./slices/student/slice"
import teacherReducer from "./slices/teacher/slice"
import administratorReducer from "./slices/administrator/slice"

const rootReducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
  administrator: administratorReducer,
  teacher: teacherReducer,
  student: studentReducer,
})

export default rootReducer
