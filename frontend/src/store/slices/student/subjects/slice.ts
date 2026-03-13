import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchStudentSubjects, fetchStudentSubjectsCount } from "./thunk"
import { ISubject } from "@src/models/subject"

interface StudentSubjectsState {
  subjects: { [page: number]: ISubject[] } | null
  total: number | null
  currentPageTotal: number | null
  status: string
  error: string | null
}

const initialState: StudentSubjectsState = {
  subjects: null,
  total: null,
  currentPageTotal: null,
  status: "idle",
  error: null,
}

const studentSubjectsSlice = createSlice({
  name: "studentSubjects",
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
      .addCase(fetchStudentSubjects.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchStudentSubjects.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.subjects) {
          state.subjects = {}
        }
        state.subjects = { ...state.subjects, [page]: docs }
        state.total = totalDocs
        state.status = "succeeded"
      })
      .addCase(fetchStudentSubjects.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(fetchStudentSubjectsCount.fulfilled, (state, action: PayloadAction<any>) => {
        const total = action.payload.data
        state.currentPageTotal = total
      })
  },
})

export const { restoreFetch } = studentSubjectsSlice.actions

export default studentSubjectsSlice.reducer
