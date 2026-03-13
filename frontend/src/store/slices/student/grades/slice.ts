import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchGrades } from "./thunk"

interface Grading {
  type: string
  pourcentage: number
}

interface Grade {
  _id: string
  grading: Grading
  content: string
  teacher: string
  grade_count?: number
  max_grade?: number | string
  min_grade?: number
  class_average?: number
  grade?: number
  rank?: number
  createdAt?: string
  updatedAt?: string
}

export interface SubjectGrades {
  coefficient: number
  label: string
  unit: string
  grades: Grade[]
}
interface GradesState {
  grades: {
    [key: string]: {
      data: SubjectGrades | null
    }
  } | null

  status: string
  error: string | null
}

const initialState: GradesState = {
  grades: null,
  status: "idle",
  error: null,
}

const gradesSlice = createSlice({
  name: "studentGrades",
  initialState,
  reducers: {
    restoreFetch: (state) => {
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrades.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchGrades.fulfilled, (state, action: PayloadAction<any>) => {
        const { subjectId, data } = action.payload
        const { grades } = data.data
        if (!state.grades) {
          state.grades = {}
        }
        state.grades[subjectId] = {
          ...state.grades[subjectId],
          data: grades[0],
        }
        state.status = "succeeded"
      })
      .addCase(fetchGrades.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
  },
})

export const { restoreFetch } = gradesSlice.actions

export default gradesSlice.reducer
