import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchLevelsOptions {
  limit?: number
  page?: number
}

export const fetchLevels = createAsyncThunk("levels/fetch", async (options?: FetchLevelsOptions) => {
  try {
    const response = await axiosInstance.get("administrator/levels", {
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

export const createLevel = createAsyncThunk("levels/create", async ({ studyField, page }: { studyField: string; page: number }) => {
  try {
    const response = await axiosInstance.post("administrator/level", { studyField })

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/levels", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to create level.")
  }
})

export const updateLevel = createAsyncThunk(
  "levels/update",
  async ({ id, studyField, page }: { id: string; studyField: string; page: number }) => {
    try {
      const response = await axiosInstance.put(`administrator/level/${id}`, { studyField })

      if (response.status === 200) {
        const newDataResponse = await axiosInstance.get("administrator/levels", {
          params: { page },
        })

        if (newDataResponse.status === 200) {
          return newDataResponse.data
        }
        throw new Error(newDataResponse.statusText)
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to update level.")
    }
  }
)

export const deleteLevel = createAsyncThunk("levels/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/level/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/levels", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }
    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete level.")
  }
})

export const fetchLevelRelatedData = createAsyncThunk("levels/relatedData", async (id: string) => {
  try {
    const response = await axiosInstance.get(`administrator/levelRelatedData/${id}`)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch level related data.")
  }
})
