import { createAsyncThunk } from "@reduxjs/toolkit"
import { TeachingType } from "@src/models/teaching"
import axiosInstance from "@src/utils/axios"

interface FetchTeachingOptions {
  limit?: number
  page?: number
}

export const fetchTeachings = createAsyncThunk("teachings/fetch", async (options?: FetchTeachingOptions) => {
  try {
    const response = await axiosInstance.get("administrator/teachings", {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des enseignements.")
  }
})

export const createTeaching = createAsyncThunk(
  "teachings/create",
  async ({ clss, teacher, subject, type, page }: { clss: string; teacher: string; subject: string; type: TeachingType; page: number }) => {
    try {
      const response = await axiosInstance.post("administrator/teaching", { class: clss, teacher, subject, type })

      if (response.status === 200) {
        const newDataResponse = await axiosInstance.get("administrator/teachings", {
          params: { page },
        })

        if (newDataResponse.status === 200) {
          return newDataResponse.data
        }
        throw new Error(newDataResponse.statusText)
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to create teaching.")
    }
  },
)

export const updateTeaching = createAsyncThunk(
  "teachings/update",
  async ({ id, query }: { id: string; query: { clss?: string; teacher?: string; subject?: string; type?: TeachingType } }) => {
    try {
      // Create a new object for the API request
      const apiQuery: { class?: string; teacher?: string; subject?: string; type?: TeachingType } = { ...query }

      // If clss exists in the query, convert it to class for the API
      if (query.clss) {
        apiQuery.class = query.clss
        delete apiQuery.clss
      }

      const response = await axiosInstance.patch(`administrator/teaching/${id}`, apiQuery)

      if (response.status === 200) {
        return response.data
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to update teaching.")
    }
  },
)

export const deleteTeaching = createAsyncThunk("teachings/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/teaching/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/teachings", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete teaching.")
  }
})
