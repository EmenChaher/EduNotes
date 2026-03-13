import { createAsyncThunk } from "@reduxjs/toolkit"
import { IUser, UserTypes } from "@src/models/user"
import axiosInstance from "@src/utils/axios"
import { FilterValue } from "antd/es/table/interface"

interface FetchUsersOptions {
  limit?: number
  page?: number
}

interface SendInvitationQuery {
  emails: string[]
  type: UserTypes
  clss?: string
}

export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async ({ filters, options }: { filters?: Record<string, FilterValue | null>; options?: FetchUsersOptions }) => {
    try {
      let queryParams: Record<string, string | number> = { ...options }

      if (filters) {
        Object.keys(filters).forEach((key) => {
          const values = filters[key]
          if (values && values.length > 0) {
            queryParams[key] = values.join(",")
          }
        })
      }

      const response = await axiosInstance.get("administrator/users", {
        params: queryParams,
      })

      if (response.status === 200) {
        return { filters: filters !== null, data: response.data }
      }

      throw new Error(response.statusText)
    } catch (err: any) {
      return Promise.reject(err.response?.data?.message || "Échec de la récupération des utilisateurs.")
    }
  },
)

export const deleteUser = createAsyncThunk("users/delete", async ({ id, page }: { id: string; page: number }) => {
  try {
    const response = await axiosInstance.delete(`administrator/user/${id}`)

    if (response.status === 200) {
      const newDataResponse = await axiosInstance.get("administrator/users", {
        params: { page },
      })

      if (newDataResponse.status === 200) {
        return newDataResponse.data
      }
      throw new Error(newDataResponse.statusText)
    }
    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to delete user.")
  }
})

export const updateUser = createAsyncThunk("users/update", async ({ id, query }: { id: string; query: { [key in keyof IUser]: string } }) => {
  try {
    const response = await axiosInstance.patch(`administrator/user/${id}`, query)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to update user.")
  }
})

export const promoteUser = createAsyncThunk("users/promote", async ({ previousSuperAdminId, id }: { previousSuperAdminId: string; id: string }) => {
  try {
    const response = await axiosInstance.post(`administrator/user/promote/${id}`)

    if (response.status === 200) {
      return { previousSuperAdminId, id }
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Failed to promote user.")
  }
})

export const sendInvitation = createAsyncThunk("users/sendInvitation", async (query: SendInvitationQuery) => {
  try {
    const response = await axiosInstance.post("administrator/invite", query)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des utilisateurs.")
  }
})