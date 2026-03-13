import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchClassesOptions {
  limit?: number
  page?: number
}

export const fetchTeacherClassCount = createAsyncThunk("teachingClasses/count", async (options?: FetchClassesOptions) => {
  try {
    const response = await axiosInstance.get(`/teacher/classes/count`, {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch teacher classes.")
  }
})

export const fetchTeacherClasses = createAsyncThunk("teachingClasses/fetch", async (options?: FetchClassesOptions) => {
  try {
    const response = await axiosInstance.get(`/teacher/classes`, {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch teacher classes.")
  }
})
