import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchStudyFieldsOptions {
  limit?: number
  page?: number
}

export const fetchStudyFields = createAsyncThunk("studyFields/fetch", async (options?: FetchStudyFieldsOptions) => {
  try {
    const response = await axiosInstance.get("administrator/studyFields", {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des diplômes.")
  }
})

export const createStudyField = createAsyncThunk(
  "studyFields/create",
  async ({ label, acronym, diploma, page }: { label: string; acronym: string; diploma: string; page: number }) => {
    try {
      const response = await axiosInstance.post("administrator/studyField", { label, acronym, diploma })

      if (response.status === 200) {
        const newDataResponse = await axiosInstance.get("administrator/studyFields", {
          params: { page },
        })

        if (newDataResponse.status === 200) {
          return newDataResponse.data
        }
        throw new Error(newDataResponse.statusText)
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to create study field.")
    }
  }
)

export const updateStudyField = createAsyncThunk(
  "studyFields/update",
  async ({ id, label, acronym, diploma }: { id: string; label: string; acronym: string; diploma: string }) => {
    try {
      const response = await axiosInstance.patch(`administrator/studyField/${id}`, { label, acronym, diploma })

      if (response.status === 200) {
        return response.data
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to update study field.")
    }
  }
)

export const deleteStudyField = createAsyncThunk("studyFields/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/studyField/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/studyFields", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete study field.")
  }
})

export const fetchStudyFieldRelatedData = createAsyncThunk("studyField/relatedData", async (id: string) => {
  try {
    const response = await axiosInstance.get(`administrator/studyFieldRelatedData/${id}`)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch study field related data.")
  }
})
