import { createAsyncThunk } from "@reduxjs/toolkit"
import { ApiResponse } from "@src/types"
import axiosInstance from "@src/utils/axios"

export const fetchAdminGlobalStatistics = createAsyncThunk("admin/statistics/fetchGlobal", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/administrator/statistics/global")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch global statistics")
  }
})

export const fetchAdminClassStatistics = createAsyncThunk("admin/statistics/fetchClasses", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/administrator/statistics/classes")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch class statistics")
  }
})

export const fetchAdminSubjectStatistics = createAsyncThunk("admin/statistics/fetchSubjects", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/administrator/statistics/subjects")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch subject statistics")
  }
})
