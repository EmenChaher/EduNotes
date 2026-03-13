import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

export const fetchTeacherClassSubjectTypeContentCount = createAsyncThunk(
  "teachingClassSubjectTypeContent/count",
  async ({ classId, subjectId, subjectType }: { classId: string; subjectId: string; subjectType: string }) => {
    try {
      console.log("1", classId, subjectId, subjectType)
      const response = await axiosInstance.get(`/teacher/class/${classId}/subject/${subjectId}/${subjectType}/count`)

      if (response.status === 200) {
        return { classId, subjectId, subjectType, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subject type content count.")
    }
  }
)

export const fetchTeacherClassSubjectTypeContent = createAsyncThunk(
  "teachingClassSubjectTypeContent/fetch",
  async ({ classId, subjectId, subjectType }: { classId: string; subjectId: string; subjectType: string }) => {
    console.log("2", classId, subjectId, subjectType)
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}/subject/${subjectId}/${subjectType}`)

      if (response.status === 200) {
        return { classId, subjectId, subjectType, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch teacher class subject type content.")
    }
  }
)
