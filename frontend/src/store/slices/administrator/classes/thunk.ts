import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchClassesOptions {
  limit?: number
  page?: number
}

export const fetchClasses = createAsyncThunk("classes/fetch", async (options?: FetchClassesOptions) => {
  try {
    const response = await axiosInstance.get("administrator/classes", {
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

export const createClass = createAsyncThunk("classes/create", async ({ level, page }: { level: string; page: number }) => {
  try {
    const response = await axiosInstance.post("administrator/class", { level })

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/classes", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to create class.")
  }
})

export const deleteClass = createAsyncThunk("classes/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/class/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/classes", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }
    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete class.")
  }
})
