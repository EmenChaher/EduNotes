import { createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"
import { RegisterResponse } from "../slice"
import { UserTypes } from "@src/models/user"

type Response = {
  data: RegisterResponse
  status: number
  statusText: string
  headers: Record<string, string>
  config: Record<string, any>
  request: Record<string, any>
}

export type Payload = {
  invitation: string
  cin: string
  name: string
  surname: string
  email: string
  phone: string
  password: string
  birthdate: string
  region: string
  type: UserTypes
  rank?: string
  specialization?: string
  studyStatus?: string
  enrollmentYear?: string
  jobStatus?: string
  recruitmentYear?: string
  mission?: string
}

export const register = createAsyncThunk("auth/register", async (query: Payload) => {
  try {
    const response: Response = await axiosInstance.post("register", query)

    if (response.status === 200) {
      return response.data
    }

    throw new Error(response.statusText)
  } catch (err: any) {
    return Promise.reject(err.response?.data?.message || "Échec de l'enregistrement de l'utilisateur.")
  }
})
