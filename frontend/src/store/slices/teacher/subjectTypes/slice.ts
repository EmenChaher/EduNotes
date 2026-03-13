import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchTeacherClassSubjectTypes, fetchTeacherClassSubjectTypesCount } from "./thunk"

interface SubjectTypesState {
  types: {
    [subjectId: string]: {
      pages: { [page: number]: { type: string }[] } | null
      className: string | null
      subjectName: string | null
      total: number | null
      currentPageTotal: number | null
    }
  } | null

  status: string
  error: string | null
}

const initialState: SubjectTypesState = {
  types: null,
  status: "idle",
  error: null,
}

const SubjectTypesSlice = createSlice({
  name: "teachingClassSubjectTypes",
  initialState,
  reducers: {
    restoreFetch: (state, action: PayloadAction<any>) => {
      const subjectId = action.payload.data
      if (state.types && state.types[subjectId]) {
        state.types[subjectId].currentPageTotal = null
      }
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherClassSubjectTypes.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchTeacherClassSubjectTypes.fulfilled, (state, action: PayloadAction<any>) => {
        const { subjectId, data } = action.payload
        const {
          className,
          subjectName,
          types: { page, docs, totalDocs },
        } = data.data
        if (!state.types) {
          state.types = {}
        }
        state.types[subjectId] = {
          ...state.types[subjectId],
          total: totalDocs,
          className: className,
          subjectName: subjectName,
          pages: {
            ...state.types[subjectId].pages,
            [page]: docs,
          },
        }
        state.status = "succeeded"
      })
      .addCase(fetchTeacherClassSubjectTypes.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(fetchTeacherClassSubjectTypesCount.fulfilled, (state, action: PayloadAction<any>) => {
        const { subjectId, data } = action.payload
        const { className, subjectName, total } = data.data
        if (!state.types) {
          state.types = {}
        }
        state.types[subjectId] = {
          pages: null,
          total: null,
          className: className,
          subjectName: subjectName,
          currentPageTotal: total,
        }
      })
  },
})

export const { restoreFetch } = SubjectTypesSlice.actions

export default SubjectTypesSlice.reducer
