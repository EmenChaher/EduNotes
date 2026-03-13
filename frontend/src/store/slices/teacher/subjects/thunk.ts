import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchClassSubjectsOptions {
  limit?: number
  page?: number
}

export const fetchTeacherClassSubjectsCount = createAsyncThunk(
  "teachingClassSubjects/count",
  async ({ classId, options }: { classId: string; options?: FetchClassSubjectsOptions }) => {
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}/count`, {
        params: options,
      })

      if (response.status === 200) {
        return { classId: classId, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subject count.")
    }
  }
)

export const fetchTeacherClassSubjects = createAsyncThunk(
  "teachingClassSubjects/fetch",
  async ({ classId, options }: { classId: string; options?: FetchClassSubjectsOptions }) => {
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}`, {
        params: options,
      })

      if (response.status === 200) {
        return { classId: classId, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subjects.")
    }
  }
)
