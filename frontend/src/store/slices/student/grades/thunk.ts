import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

export const fetchGrades = createAsyncThunk("studentGrades/fetch", async (subjectId: string) => {
  try {
    const response = await axiosInstance.get(`/student/subject/${subjectId}/grades`)

    if (response.status === 200) {
      return { subjectId, data: response.data }
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch student grades.")
  }
})
