import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ILevel, ILevelRelatedData } from "@src/models/level"
import { createLevel, deleteLevel, fetchLevelRelatedData, fetchLevels, updateLevel } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { levelsPerPage } from "@src/features/Administrator/Levels"

interface LevelState {
  levels: { [page: number]: ILevel[] } | null
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
    relatedData: ILevelRelatedData | null
    status: string
    error: string | null
  }
}

const initialState: LevelState = {
  levels: null,
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

const levelSlice = createSlice({
  name: "levels",
  initialState,
  reducers: {
    updateStudyField: (state, action: PayloadAction<any>) => {
      if (state.levels) {
        const { id, label, diploma } = action.payload
        const allStudyFields = flattenPaginatedData<ILevel>(state.levels!)
        const updatedStudyFields = allStudyFields.map((level) => {
          if (level.studyField._id === id) {
            return {
              ...level,
              studyField: {
                ...level.studyField,
                label,
                diploma: diploma ? diploma : level.studyField.diploma,
              },
            }
          }
          return level
        })
        state.levels = paginateData(updatedStudyFields, levelsPerPage)
      }
    },
    removeStudyField: (state, action: any) => {
      if (state.levels) {
        if (state.levels) {
          const studyFieldId = action.payload
          const flattenedData = flattenPaginatedData(state.levels)
          const studyField = flattenedData.find((studyField) => studyField.studyField._id === studyFieldId)
          if (studyField) {
            state.levels = null
            state.total = null
          }
        }
      }
    },
    updateDiploma: (state, action: PayloadAction<any>) => {
      if (state.levels) {
        const { id, label } = action.payload
        const flattenedData = flattenPaginatedData<ILevel>(state.levels!)
        const updatedStudyFields = flattenedData.map((level) => {
          if (level.studyField.diploma._id === id) {
            return {
              ...level,
              studyField: {
                ...level.studyField,
                diploma: {
                  ...level.studyField.diploma,
                  label: label,
                },
              },
            }
          }
          return level
        })
        state.levels = paginateData(updatedStudyFields, levelsPerPage)
      }
    },

    removeDiploma: (state, action: any) => {
      if (state.levels) {
        const diplomaId = action.payload
        const flattenedData = flattenPaginatedData(state.levels)
        const diploma = flattenedData.find((level) => level.studyField.diploma._id === diplomaId)
        if (diploma) {
          state.levels = null
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
      .addCase(fetchLevels.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchLevels.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.levels) {
          state.levels = {}
        }
        state.levels[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchLevels.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createLevel.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createLevel.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.levels = {}
        state.levels[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createLevel.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Failed to create study field."
        state.create.status = "failed"
      })
      .addCase(updateLevel.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateLevel.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.levels = {}
        state.levels[page] = docs
        state.total = totalDocs
        state.update.status = "succeeded"
      })
      .addCase(updateLevel.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Failed to update level."
        state.update.status = "failed"
      })
      .addCase(deleteLevel.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteLevel.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.levels = {}
        state.levels[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteLevel.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Failed to delete study field."
        state.delete.status = "failed"
      })
      .addCase(fetchLevelRelatedData.fulfilled, (state, action: any) => {
        state.delete.relatedData = action.payload.data
      })
  },
})

export const { updateStudyField, updateDiploma, removeDiploma, removeStudyField, restoreFetch, restoreCreate, restoreUpdate, restoreDelete } =
  levelSlice.actions

export default levelSlice.reducer
