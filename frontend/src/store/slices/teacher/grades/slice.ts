import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { createGrade, deleteGrade, fetchGrades, updateGrade } from "./thunk"
import { TeachingType } from "@src/models/teaching"
import { IGrade } from "@src/models/grade"

interface GradesState {
  grades: {
    [key: string]: {
      data: IGrade[] | null
      report: string | null
      className: string | null
      subjectType: TeachingType | null
      subjectContent: TeachingType | null
      subjectName: string | null
    }
  } | null

  fetch: {
    status: string
    error: string | null
  }
  create: {
    status: string
    error: string | null
  }
  update: {
    status: string
    error: string | null
  }
  delete: {
    status: string
    error: string | null
  }
}

const initialState: GradesState = {
  grades: null,
  fetch: {
    status: "idle",
    error: null,
  },
  create: {
    status: "idle",
    error: null,
  },
  update: {
    status: "idle",
    error: null,
  },
  delete: {
    status: "idle",
    error: null,
  },
}

const gradesSlice = createSlice({
  name: "teacherGrades",
  initialState,
  reducers: {
    restoreFetch: (state) => {
      state.fetch.error = null
      state.fetch.status = "idle"
    },
    restoreCreate: (state) => {
      state.create.error = null
      state.create.status = "idle"
    },
    restoreUpdate: (state) => {
      state.update.error = null
      state.update.status = "idle"
    },
    restoreDelete: (state) => {
      state.delete.error = null
      state.delete.status = "idle"
    },
    resetGradesData: (state, action: PayloadAction<any>) => {
      const key = action.payload
      if (state.grades && state.grades[key]) delete state.grades[key]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrades.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchGrades.fulfilled, (state, action: PayloadAction<any>) => {
        const { classId, subjectId, subjectType, subjectContent, data } = action.payload
        const key = `${classId}${subjectId}${subjectType}${subjectContent}`

        const { className, report, subjectName, grades: gradesData } = data.data
        if (!state.grades) {
          state.grades = {}
        }
        state.grades[key] = {
          ...state.grades[key],
          report,
          className,
          subjectType,
          subjectContent,
          subjectName,
          data: gradesData,
        }
        state.fetch.status = "succeeded"
      })
      .addCase(fetchGrades.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createGrade.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createGrade.fulfilled, (state, action: any) => {
        const { classId, subjectId, subjectType, subjectContent, data } = action.payload
        const key = `${classId}${subjectId}${subjectType}${subjectContent}`
        if (state.grades && state.grades[key] && state.grades[key].data) state.grades[key].data?.push(data.data)

        state.create.status = "succeeded"
      })
      .addCase(createGrade.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Failed to create grade."
        state.create.status = "failed"
      })

      .addCase(updateGrade.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateGrade.fulfilled, (state, action: any) => {
        const { classId, subjectId, subjectType, subjectContent, gradeId, newValue } = action.payload
        const key = `${classId}${subjectId}${subjectType}${subjectContent}`
        if (state.grades && state.grades[key] && state.grades[key].data)
          state.grades[key].data = state.grades[key].data!.map((grade) => {
            if (grade._id === gradeId) return { ...grade, value: newValue }
            return grade
          })

        state.update.status = "succeeded"
      })
      .addCase(updateGrade.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Failed to update grade."
        state.update.status = "failed"
      })

      .addCase(deleteGrade.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteGrade.fulfilled, (state, action: any) => {
        const { classId, subjectId, subjectType, subjectContent, gradeId } = action.payload
        const key = `${classId}${subjectId}${subjectType}${subjectContent}`
        if (state.grades && state.grades[key] && state.grades[key].data)
          state.grades[key].data = state.grades[key].data!.filter((grade) => grade._id !== gradeId)

        state.delete.status = "succeeded"
      })
      .addCase(deleteGrade.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Failed to delete grade."
        state.delete.status = "failed"
      })
  },
})

export const { resetGradesData, restoreFetch, restoreCreate, restoreUpdate, restoreDelete } = gradesSlice.actions

export default gradesSlice.reducer
