import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

export const fetchStudentStatistics = createAsyncThunk("studentStatistics/fetch", async () => {
  try {
    const response = await axiosInstance.get("/student/statistics")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student statistics.")
  }
})

export const fetchStudentSubjectStatistics = createAsyncThunk("studentStatistics/fetchSubjects", async () => {
  try {
    const response = await axiosInstance.get("/student/statistics/subjects")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student subject statistics.")
  }
})

export const fetchStudentRankings = createAsyncThunk("studentStatistics/fetchRankings", async () => {
  try {
    const response = await axiosInstance.get("/student/statistics/rankings")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student rankings.")
  }
})
