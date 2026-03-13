import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

interface FetchNotificationsOptions {
  limit?: number
  page?: number
}

export const fetchNotificationes = createAsyncThunk("notifications/fetch", async (options?: FetchNotificationsOptions) => {
  try {
    const response = await axiosInstance.get("/me/notifications", {
      params: options,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des notifications.")
  }
})

export const markNotificationAsRead = createAsyncThunk("notifications/markAsRead", async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/me/notifications/${id}/mark-read`)

    if (response.status === 200) {
      return id
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la mise a jour du notification.")
  }
})

export const markAllNotificationsAsRead = createAsyncThunk("notifications/markAllAsRead", async () => {
  try {
    const response = await axiosInstance.patch(`/me/notifications/mark-all-read`)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la mise a jour des notification.")
  }
})
