import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

export const fetchGrades = createAsyncThunk(
  "teacherGrades/fetch",
  async ({
    classId,
    subjectId,
    subjectType,
    subjectContent,
  }: {
    classId: string
    subjectId: string
    subjectType: string
    subjectContent: string
  }) => {
    try {
      const response = await axiosInstance.get(`/teacher/class/${classId}/subject/${subjectId}/${subjectType}/${subjectContent}/grades`)

      if (response.status === 200) {
        return { classId, subjectId, subjectType, subjectContent, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to fetch grades.")
    }
  },
)

export const createGrade = createAsyncThunk(
  "teacherGrades/createGrade",
  async ({
    classId,
    subjectId,
    subjectType,
    subjectContent,
    report,
    cin,
    value,
  }: {
    classId: string
    subjectId: string
    subjectType: string
    subjectContent: string
    report: string
    cin: string
    value: number | "ABS" | "DISP"
  }) => {
    try {
      const response = await axiosInstance.post(`/teacher/grade/${report}`, { cin, value })

      if (response.status === 200) {
        return { classId, subjectId, subjectType, subjectContent, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to create grade.")
    }
  },
)

export const updateGrade = createAsyncThunk(
  "teacherGrades/updateGrade",
  async ({
    classId,
    subjectId,
    subjectType,
    subjectContent,
    gradeId,
    newValue,
  }: {
    classId: string
    subjectId: string
    subjectType: string
    subjectContent: string
    gradeId: string
    newValue: number | "ABS" | "DISP"
  }) => {
    try {
      const response = await axiosInstance.patch(`/teacher/grade/${gradeId}`, { value: newValue })

      if (response.status === 200) {
        return { classId, subjectId, subjectType, subjectContent, gradeId, newValue }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to update grade.")
    }
  },
)

export const deleteGrade = createAsyncThunk(
  "teacherGrades/deleteGrade",
  async ({
    classId,
    subjectId,
    subjectType,
    subjectContent,
    gradeId,
  }: {
    classId: string
    subjectId: string
    subjectType: string
    subjectContent: string
    gradeId: string
  }) => {
    try {
      const response = await axiosInstance.delete(`/teacher/grade/${gradeId}`)

      if (response.status === 200) {
        return { classId, subjectId, subjectType, subjectContent, gradeId }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to delete grade.")
    }
  },
)
