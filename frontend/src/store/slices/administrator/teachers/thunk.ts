import { createAsyncThunk } from "@reduxjs/toolkit"
import { UserTypes } from "@src/models/user"
import axiosInstance from "@src/utils/axios"

interface FetchUsersOptions {
  limit?: number
  page?: number
}

export const fetchTeachers = createAsyncThunk("teachers/fetch", async (options?: FetchUsersOptions) => {
  try {
    let queryParams: Record<string, string | number> = { ...options, type: UserTypes.Teacher }

    const response = await axiosInstance.get("administrator/users", {
      params: queryParams,
    })

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la récupération des utilisateurs.")
  }
})
