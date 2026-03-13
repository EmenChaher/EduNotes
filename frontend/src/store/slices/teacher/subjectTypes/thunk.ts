import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchClassSubjectTypesOptions {
  limit?: number
  page?: number
}

export const fetchTeacherClassSubjectTypesCount = createAsyncThunk(
  "teachingClassSubjectTypes/count",
  async ({ classId, subjectId, options }: { classId: string; subjectId: string; options?: FetchClassSubjectTypesOptions }) => {
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}/subject/${subjectId}/count`, {
        params: options,
      })

      if (response.status === 200) {
        return { subjectId: subjectId, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subject types count.")
    }
  }
)

export const fetchTeacherClassSubjectTypes = createAsyncThunk(
  "teachingClassSubjectTypes/fetch",
  async ({ classId, subjectId, options }: { classId: string; subjectId: string; options?: FetchClassSubjectTypesOptions }) => {
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}/subject/${subjectId}`, {
        params: options,
      })

      if (response.status === 200) {
        return { subjectId: subjectId, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subject types.")
    }
  }
)
