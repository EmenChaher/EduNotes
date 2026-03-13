import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IClass } from "@src/models/class"
import { fetchTeacherClassCount, fetchTeacherClasses } from "./thunk"

export interface IClassWithCount extends IClass {
  student_count?: number
  subject_count?: number
}

interface TeacherClassesState {
  classes: { [page: number]: IClassWithCount[] } | null
  total: number | null
  currentPageTotal: number | null
  status: string
  error: string | null
}

const initialState: TeacherClassesState = {
  classes: null,
  total: null,
  currentPageTotal: null,
  status: "idle",
  error: null,
}

const teacherClassesSlice = createSlice({
  name: "teachingClasses",
  initialState,
  reducers: {
    restoreFetch: (state) => {
      state.currentPageTotal = null
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherClasses.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action: PayloadAction<any>) => {
        const responseData = action.payload.data

        // Handle different possible response structures
        if (responseData && typeof responseData === "object") {
          const { page, docs, totalDocs } = responseData

          if (!state.classes) {
            state.classes = {}
          }
          state.classes[page || 1] = docs || []
          state.total = totalDocs || 0
        } else {
          // Fallback if data structure is different
          if (!state.classes) {
            state.classes = {}
          }
          state.classes[1] = []
          state.total = 0
        }
        state.status = "succeeded"
      })
      .addCase(fetchTeacherClasses.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(fetchTeacherClassCount.fulfilled, (state, action: PayloadAction<any>) => {
        state.currentPageTotal = action.payload.data
      })
  },
})

export const { restoreFetch } = teacherClassesSlice.actions

export default teacherClassesSlice.reducer
