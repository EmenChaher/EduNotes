import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IUser } from "@src/models/user"
import { fetchTeachers } from "./thunk"

interface TeacherState {
  teachers: { [page: number]: IUser[] } | null
  total: number | null
  status: string
  error: string | null
}

const initialState: TeacherState = {
  total: null,
  teachers: null,
  status: "idle",
  error: null,
}

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {
    restoreFetch: (state) => {
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchTeachers.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.teachers) {
          state.teachers = {}
        }
        state.teachers[page] = docs
        state.total = totalDocs
        state.status = "succeeded"
      })
      .addCase(fetchTeachers.rejected, (state, action: any) => {
        state.status = "failed"
        state.error = action.error?.message || "An unknown error occurred."
      })
  },
})

export const { restoreFetch } = teacherSlice.actions

export default teacherSlice.reducer
