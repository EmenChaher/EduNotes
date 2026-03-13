import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchSubjectsOptions {
  limit?: number
  page?: number
}

export const fetchSubjects = createAsyncThunk("subjects/fetch", async (options?: FetchSubjectsOptions) => {
  try {
    const response = await axiosInstance.get("administrator/subjects", {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des niveaux.")
  }
})

export const createSubject = createAsyncThunk(
  "subjects/create",
  async ({
    label,
    level,
    page,
    unit,
    coefficient,
    lecture,
    guidedSession,
    practicalSession,
    supervisedAssessment1,
    supervisedAssessment2,
    practical,
    exam,
    other,
  }: {
    label: string
    level: string
    page: number
    unit?: string
    coefficient: number
    lecture: boolean
    guidedSession: boolean
    practicalSession: boolean
    supervisedAssessment1?: number
    supervisedAssessment2?: number
    practical?: number
    exam?: number
    other?: number
  }) => {
    if (level && unit) {
      throw new Error("You can only provide either a curriculum or a unit, not both.")
    }
    try {
      const response = await axiosInstance.post("administrator/subject", {
        label,
        level,
        unit,
        coefficient,
        lecture,
        guidedSession,
        practicalSession,
        supervisedAssessment1,
        supervisedAssessment2,
        practical,
        exam,
        other,
      })

      if (response.status === 200) {
        const newDataResponse = await axiosInstance.get("administrator/subjects", {
          params: { page },
        })

        if (newDataResponse.status === 200) {
          return newDataResponse.data
        }
        throw new Error(newDataResponse.statusText)
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to create subject.")
    }
  },
)

export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({
    id,
    label,
    page,
    coefficient,
    lecture,
    guidedSession,
    practicalSession,
    supervisedAssessment1,
    supervisedAssessment2,
    practical,
    exam,
    other,
  }: {
    id: string
    label?: string
    page?: number
    coefficient?: number
    lecture?: boolean
    guidedSession?: boolean
    practicalSession?: boolean
    supervisedAssessment1?: number
    supervisedAssessment2?: number
    practical?: number
    exam?: number
    other?: number
  }) => {
    try {
      const response = await axiosInstance.patch(`administrator/subject/${id}`, {
        label,
        page,
        coefficient,
        lecture,
        guidedSession,
        practicalSession,
        supervisedAssessment1,
        supervisedAssessment2,
        practical,
        exam,
        other,
      })

      if (response.status === 200) {
        return response.data
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to update subject.")
    }
  },
)

export const deleteSubject = createAsyncThunk("subjects/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/subject/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/subjects", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }
    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete subject.")
  }
})

export const fetchSubjectRelatedData = createAsyncThunk("subjects/relatedData", async (id: string) => {
  try {
    const response = await axiosInstance.get(`administrator/subjectRelatedData/${id}`)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch subject related data.")
  }
})
