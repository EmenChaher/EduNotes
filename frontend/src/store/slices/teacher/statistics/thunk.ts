import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

export const fetchTeacherStatistics = createAsyncThunk("teacherStatistics/fetch", async () => {
  try {
    const response = await axiosInstance.get("/teacher/statistics")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch teacher statistics.")
  }
})

export const fetchTeacherClassStatistics = createAsyncThunk("teacherStatistics/fetchClasses", async () => {
  try {
    const response = await axiosInstance.get("/teacher/statistics/classes")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class statistics.")
  }
})

export const fetchTeacherGradeStatistics = createAsyncThunk("teacherStatistics/fetchGrades", async () => {
  try {
    const response = await axiosInstance.get("/teacher/statistics/grades")

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch teacher grade statistics.")
  }
})
