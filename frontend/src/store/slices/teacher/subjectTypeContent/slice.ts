import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchTeacherClassSubjectTypeContent, fetchTeacherClassSubjectTypeContentCount } from "./thunk"
import { TeachingType } from "@src/models/teaching"
import { SubjectContent } from "@src/models/subject"

interface SubjectTypeContentState {
  content: {
    [key: string]: {
      data: Record<keyof SubjectContent, number>[] | null
      className: string | null
      subjectType: TeachingType | null
      subjectName: string | null
      total: number | null
    }
  } | null

  status: string
  error: string | null
}

const initialState: SubjectTypeContentState = {
  content: null,
  status: "idle",
  error: null,
}

const teacherClasseSubjectTypeContentSlice = createSlice({
  name: "teachingClassSubjectTypeContent",
  initialState,
  reducers: {
    restoreFetch: (state, action: PayloadAction<any>) => {
      const { classId, subjectId, subjectType } = action.payload
      const key = `${classId}${subjectId}${subjectType}`
      if (state.content && state.content[key]) {
        state.content[key].total = null
      }
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherClassSubjectTypeContent.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchTeacherClassSubjectTypeContent.fulfilled, (state, action: PayloadAction<any>) => {
        const { classId, subjectId, subjectType, data } = action.payload
        const key = `${classId}${subjectId}${subjectType}`

        const { className, subjectName, contents } = data.data
        if (!state.content) {
          state.content = {}
        }
        state.content[key] = {
          ...state.content[key],
          className,
          subjectType,
          subjectName,
          data: contents,
        }
        state.status = "succeeded"
      })
      .addCase(fetchTeacherClassSubjectTypeContent.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(fetchTeacherClassSubjectTypeContentCount.fulfilled, (state, action: PayloadAction<any>) => {
        const { classId, subjectId, subjectType, data } = action.payload
        const { className, subjectName, total } = data.data
        const key = `${classId}${subjectId}${subjectType}`

        if (!state.content) {
          state.content = {}
        }
        state.content[key] = {
          data: null,
          className,
          subjectType,
          subjectName,
          total: total,
        }
      })
  },
})

export const { restoreFetch } = teacherClasseSubjectTypeContentSlice.actions

export default teacherClasseSubjectTypeContentSlice.reducer
