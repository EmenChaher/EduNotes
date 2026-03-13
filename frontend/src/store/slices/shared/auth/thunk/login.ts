import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"
import { LoginResponse } from "../slice"

type Response = {
  data: LoginResponse
  status: number
  statusText: string
  headers: Record<string, string>
  config: Record<string, any>
  request: Record<string, any>
}

type Payload = {
  email: string
  password: string
  remember: boolean
}

export const login = createAsyncThunk("auth/login", async (query: Payload) => {
  try {
    const response: Response = await axiosInstance.post("login", query)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de la connexion.")
  }
})
