import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IStudyField, IStudyFieldRelatedData } from "@src/models/studyField"
import { createStudyField, deleteStudyField, fetchStudyFieldRelatedData, fetchStudyFields, updateStudyField } from "./thunk"
import { studyFieldsPerPage } from "@src/features/Administrator/StudyFields"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
interface StudyFieldState {
  studyFields: { [page: number]: IStudyField[] } | null
  total: number | null
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
    relatedData: IStudyFieldRelatedData | null
    status: string
    error: string | null
  }
}

const initialState: StudyFieldState = {
  studyFields: null,
  total: null,
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
    relatedData: null,
    status: "idle",
    error: null,
  },
}

const studyFieldSlice = createSlice({
  name: "studyFields",
  initialState,
  reducers: {
    updateDiploma: (state, action: PayloadAction<any>) => {
      if (state.studyFields) {
        const { id, label } = action.payload
        const allStudyFields = flattenPaginatedData<IStudyField>(state.studyFields!)
        const updatedStudyFields = allStudyFields.map((studyField) => {
          if (studyField.diploma._id === id) {
            return {
              ...studyField,
              diploma: {
                ...studyField.diploma,
                label: label,
              },
            }
          }
          return studyField
        })
        state.studyFields = paginateData(updatedStudyFields, studyFieldsPerPage)
      }
    },
    removeDiploma: (state, action: any) => {
      if (state.studyFields) {
        const diplomaId = action.payload
        const flattenedData = flattenPaginatedData(state.studyFields)
        const diploma = flattenedData.find((studyField) => studyField.diploma._id === diplomaId)
        if (diploma) {
          state.studyFields = null
          state.total = null
        }
      }
    },
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
      state.delete.relatedData = null
      state.delete.error = null
      state.delete.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudyFields.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchStudyFields.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.studyFields) {
          state.studyFields = {}
        }
        state.studyFields[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchStudyFields.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createStudyField.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createStudyField.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.studyFields = {}
        state.studyFields[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createStudyField.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Failed to create study field."
        state.create.status = "failed"
      })
      .addCase(updateStudyField.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateStudyField.fulfilled, (state, action: any) => {
        if (state.studyFields) {
          const { _id: id } = action.payload.data.studyField
          const allStudyFields = flattenPaginatedData<IStudyField>(state.studyFields!)
          const updatedStudyFields = allStudyFields.map((studyField) => {
            if (studyField._id === id) {
              return action.payload.data.studyField
            }
            return studyField
          })
          const reorderedStudyFieldsPerPage = paginateData(updatedStudyFields, studyFieldsPerPage)
          state.studyFields = reorderedStudyFieldsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateStudyField.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Failed to update study field."
        state.update.status = "failed"
      })
      .addCase(deleteStudyField.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteStudyField.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.studyFields = {}
        state.studyFields[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteStudyField.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Failed to delete study field."
        state.delete.status = "failed"
      })
      .addCase(fetchStudyFieldRelatedData.fulfilled, (state, action: any) => {
        state.delete.relatedData = action.payload.data
      })
  },
})

export const { updateDiploma, removeDiploma, restoreFetch, restoreCreate, restoreUpdate, restoreDelete } = studyFieldSlice.actions

export default studyFieldSlice.reducer
