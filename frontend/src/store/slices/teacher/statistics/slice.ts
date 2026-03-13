import { createSlice } from "@reduxjs/toolkit"
import { fetchTeacherStatistics, fetchTeacherClassStatistics, fetchTeacherGradeStatistics } from "./thunk"

interface TeacherStatisticsState {
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  globalStats: {
    totalClasses: number
    totalSubjects: number
    totalStudents: number
  } | null
  classStats: Array<{
    _id: string
    className: string
    studentCount: number
    subjects: Array<{
      subjectId: string
      subjectName: string
      subjectType: string
    }>
  }>
  gradeStats: Array<{
    _id: {
      class: string
      subject: string
    }
    className: string
    subjectName: string
    totalGrades: number
    averageGrade: number
    maxGrade: number
    minGrade: number
  }>
}

const initialState: TeacherStatisticsState = {
  status: "idle",
  error: null,
  globalStats: null,
  classStats: [],
  gradeStats: [],
}

const teacherStatisticsSlice = createSlice({
  name: "teacherStatistics",
  initialState,
  reducers: {
    resetStatistics: (state) => {
      state.status = "idle"
      state.error = null
      state.globalStats = null
      state.classStats = []
      state.gradeStats = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Global Statistics
      .addCase(fetchTeacherStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTeacherStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.globalStats = action.payload.data
      })
      .addCase(fetchTeacherStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch statistics"
      })
      
      // Class Statistics
      .addCase(fetchTeacherClassStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTeacherClassStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.classStats = action.payload.data
      })
      .addCase(fetchTeacherClassStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch class statistics"
      })
      
      // Grade Statistics
      .addCase(fetchTeacherGradeStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTeacherGradeStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.gradeStats = action.payload.data
      })
      .addCase(fetchTeacherGradeStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch grade statistics"
      })
  },
})

export const { resetStatistics } = teacherStatisticsSlice.actions
export default teacherStatisticsSlice.reducer
