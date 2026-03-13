import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchClassSubjectsOptions {
  limit?: number
  page?: number
}

export const fetchStudentSubjectsCount = createAsyncThunk("studentSubjects/count", async (options: FetchClassSubjectsOptions) => {
  try {
    const response = await axiosInstance.get(`/student/subjects/count`, {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student subject count.")
  }
})

export const fetchStudentSubjects = createAsyncThunk("studentSubjects/fetch", async (options: FetchClassSubjectsOptions) => {
  try {
    const response = await axiosInstance.get(`/student/subjects`, {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student subjects.")
  }
})
