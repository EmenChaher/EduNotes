import { createSlice } from "@reduxjs/toolkit"
import { fetchAdminGlobalStatistics, fetchAdminClassStatistics, fetchAdminSubjectStatistics } from "./thunk"

interface AdminStatisticsState {
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  globalStats: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    totalSubjects: number
    totalGrades: number
  } | null
  classStats: Array<{
    _id: string
    className: string
    studentCount: number
    subjectCount: number
    levelLabel: number
    studyFieldName: string
  }>
  subjectStats: Array<{
    _id: string
    subjectName: string
    coefficient: number
    averageGrade: number
    maxGrade: number
    minGrade: number
    totalGrades: number
  }>
}

const initialState: AdminStatisticsState = {
  status: "idle",
  error: null,
  globalStats: null,
  classStats: [],
  subjectStats: [],
}

const adminStatisticsSlice = createSlice({
  name: "adminStatistics",
  initialState,
  reducers: {
    resetStatistics: (state) => {
      state.status = "idle"
      state.error = null
      state.globalStats = null
      state.classStats = []
      state.subjectStats = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Global Statistics
      .addCase(fetchAdminGlobalStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAdminGlobalStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.globalStats = action.payload.data
      })
      .addCase(fetchAdminGlobalStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch global statistics"
      })
      
      // Class Statistics
      .addCase(fetchAdminClassStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAdminClassStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.classStats = action.payload.data
      })
      .addCase(fetchAdminClassStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch class statistics"
      })
      
      // Subject Statistics
      .addCase(fetchAdminSubjectStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchAdminSubjectStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.subjectStats = action.payload.data
      })
      .addCase(fetchAdminSubjectStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch subject statistics"
      })
  },
})

export const { resetStatistics } = adminStatisticsSlice.actions
export default adminStatisticsSlice.reducer
