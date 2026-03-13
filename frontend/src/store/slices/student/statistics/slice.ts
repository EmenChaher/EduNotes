import { createSlice } from "@reduxjs/toolkit"
import { fetchStudentStatistics, fetchStudentSubjectStatistics, fetchStudentRankings } from "./thunk"

interface StudentStatisticsState {
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  globalStats: {
    totalSubjects: number
    totalGrades: number
    className: string
  } | null
  subjectStats: Array<{
    _id: string
    subjectName: string
    coefficient: number
    studentAverage: number
    classAverage: number
    gradeCount: number
  }>
  rankings: Array<{
    _id: string
    subjectName: string
    rank: number
    totalStudents: number
    studentAverage: number
  }>
}

const initialState: StudentStatisticsState = {
  status: "idle",
  error: null,
  globalStats: null,
  subjectStats: [],
  rankings: [],
}

const studentStatisticsSlice = createSlice({
  name: "studentStatistics",
  initialState,
  reducers: {
    resetStatistics: (state) => {
      state.status = "idle"
      state.error = null
      state.globalStats = null
      state.subjectStats = []
      state.rankings = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Global Statistics
      .addCase(fetchStudentStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStudentStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.globalStats = action.payload.data
      })
      .addCase(fetchStudentStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch statistics"
      })
      
      // Subject Statistics
      .addCase(fetchStudentSubjectStatistics.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStudentSubjectStatistics.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.subjectStats = action.payload.data
      })
      .addCase(fetchStudentSubjectStatistics.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch subject statistics"
      })
      
      // Rankings
      .addCase(fetchStudentRankings.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchStudentRankings.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.rankings = action.payload.data
      })
      .addCase(fetchStudentRankings.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch rankings"
      })
  },
})

export const { resetStatistics } = studentStatisticsSlice.actions
export default studentStatisticsSlice.reducer
