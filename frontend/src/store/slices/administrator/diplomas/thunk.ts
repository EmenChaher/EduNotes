import { createAsyncThunk } from "@reduxjs/toolkit"
import { IDiplomaTypes } from "@src/models/diploma"
import axiosInstance from "@src/utils/axios"

interface FetchDiplomasOptions {
  limit?: number
  page?: number
}

export const fetchDiplomas = createAsyncThunk("diplomas/fetch", async (options?: FetchDiplomasOptions) => {
  try {
    const response = await axiosInstance.get("administrator/diplomas", {
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

export const createDiploma = createAsyncThunk(
  "diplomas/create",
  async ({ label, type, page }: { label: string; type: IDiplomaTypes; page: number }) => {
    try {
      const response = await axiosInstance.post("administrator/diploma", { label, type })

      if (response.status === 200) {
        const newDataResponse = await axiosInstance.get("administrator/diplomas", {
          params: { page },
        })

        if (newDataResponse.status === 200) {
          return newDataResponse.data
        }
        throw new Error(newDataResponse.statusText)
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Failed to create diploma.")
    }
  }
)

export const updateDiploma = createAsyncThunk("diplomas/update", async ({ id, label, type }: { id: string; label: string; type: IDiplomaTypes }) => {
  try {
    const response = await axiosInstance.patch(`administrator/diploma/${id}`, { label, type })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to update diploma.")
  }
})

export const deleteDiploma = createAsyncThunk("diploma/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/diploma/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/diplomas", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete diploma.")
  }
})

export const fetchDiplomaRelatedData = createAsyncThunk("diploma/relatedData", async (id: string) => {
  try {
    const response = await axiosInstance.get(`administrator/diplomaRelatedData/${id}`)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to fetch diploma related data.")
  }
})
