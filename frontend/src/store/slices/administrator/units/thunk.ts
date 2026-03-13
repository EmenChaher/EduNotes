import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchUnitsOptions {
  limit?: number
  page?: number
}

export const fetchUnits = createAsyncThunk("units/fetch", async (options?: FetchUnitsOptions) => {
  try {
    const response = await axiosInstance.get("administrator/units", {
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

export const createUnit = createAsyncThunk("units/create", async ({ label, level, page }: { label: string; level: string; page: number }) => {
  try {
    const response = await axiosInstance.post("administrator/unit", { label, level })

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/units", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to create unit.")
  }
})

export const updateUnit = createAsyncThunk("units/update", async ({ id, label }: { id: string; label: string }) => {
  try {
    const response = await axiosInstance.patch(`administrator/unit/${id}`, { label })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to update unit.")
  }
})

export const deleteUnit = createAsyncThunk("units/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/unit/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/units", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }
    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete unit.")
  }
})
