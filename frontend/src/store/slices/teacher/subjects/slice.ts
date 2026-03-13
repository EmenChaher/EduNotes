import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchTeacherClassSubjects, fetchTeacherClassSubjectsCount } from "./thunk"
import { ISubjectWithTypes } from "@src/models/subject"

interface TeacherClassesState {
  subjects: {
    [classId: string]: {
      pages: { [page: number]: ISubjectWithTypes[] } | null
      className: string | null
      total: number | null
      currentPageTotal: number | null
    }
  } | null

  status: string
  error: string | null
}

const initialState: TeacherClassesState = {
  subjects: null,
  status: "idle",
  error: null,
}

const teacherClassesSlice = createSlice({
  name: "teachingClassSubjects",
  initialState,
  reducers: {
    restoreFetch: (state, action: PayloadAction<any>) => {
      const classId = action.payload.data
      if (state.subjects && state.subjects[classId]) {
        state.subjects[classId].currentPageTotal = null
      }
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherClassSubjects.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchTeacherClassSubjects.fulfilled, (state, action: PayloadAction<any>) => {
        const { classId, data } = action.payload
        const {
          className,
          subjects: { page, docs, totalDocs },
        } = data.data
        if (!state.subjects) {
          state.subjects = {}
        }
        state.subjects[classId] = {
          ...state.subjects[classId],
          total: totalDocs,
          className: className,
          pages: {
            ...state.subjects[classId].pages,
            [page]: docs,
          },
        }
        state.status = "succeeded"
      })
      .addCase(fetchTeacherClassSubjects.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(fetchTeacherClassSubjectsCount.fulfilled, (state, action: PayloadAction<any>) => {
        const { classId, data } = action.payload
        const { className, total } = data.data
        if (!state.subjects) {
          state.subjects = {}
        }
        state.subjects[classId] = {
          pages: null,
          className: className,
          total: null,
          currentPageTotal: total,
        }
      })
  },
})

export const { restoreFetch } = teacherClassesSlice.actions

export default teacherClassesSlice.reducer
