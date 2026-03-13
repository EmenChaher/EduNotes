import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IUnit } from "@src/models/unit"
import { createUnit, deleteUnit, fetchUnits, updateUnit } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { unitsPerPage } from "@src/features/Administrator/Units"

interface UnitState {
  units: { [page: number]: IUnit[] } | null
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
    status: string
    error: string | null
  }
}

const initialState: UnitState = {
  units: null,
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
    status: "idle",
    error: null,
  },
}

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    removeLevel: (state, action: any) => {
      if (state.units) {
        if (state.units) {
          const levelId = action.payload
          const flattenedData = flattenPaginatedData(state.units)
          const level = flattenedData.find((unite) => unite.level._id === levelId)
          if (level) {
            state.units = null
            state.total = null
          }
        }
      }
    },
    updateStudyField: (state, action: PayloadAction<any>) => {
      if (state.units) {
        const { id, label, diploma } = action.payload
        const allStudyFields = flattenPaginatedData<IUnit>(state.units!)
        const updatedStudyFields = allStudyFields.map((unite) => {
          if (unite.level.studyField._id === id) {
            return {
              ...unite,
              level: {
                ...unite.level,
                studyField: {
                  ...unite.level.studyField,
                  label,
                  diploma: diploma ? diploma : unite.level.studyField.diploma,
                },
              },
            }
          }
          return unite
        })
        state.units = paginateData(updatedStudyFields, unitsPerPage)
      }
    },
    removeStudyField: (state, action: any) => {
      if (state.units) {
        if (state.units) {
          const studyFieldId = action.payload
          const flattenedData = flattenPaginatedData(state.units)
          const studyField = flattenedData.find((unite) => unite.level.studyField._id === studyFieldId)
          if (studyField) {
            state.units = null
            state.total = null
          }
        }
      }
    },
    updateDiploma: (state, action: PayloadAction<any>) => {
      if (state.units) {
        const { id, label } = action.payload
        const flattenedData = flattenPaginatedData<IUnit>(state.units!)
        const updatedStudyFields = flattenedData.map((unite) => {
          if (unite.level.studyField.diploma._id === id) {
            return {
              ...unite,
              level: {
                ...unite.level,
                studyField: {
                  ...unite.level.studyField,
                  diploma: {
                    ...unite.level.studyField.diploma,
                    label: label,
                  },
                },
              },
            }
          }
          return unite
        })
        state.units = paginateData(updatedStudyFields, unitsPerPage)
      }
    },

    removeDiploma: (state, action: any) => {
      if (state.units) {
        const diplomaId = action.payload
        const flattenedData = flattenPaginatedData(state.units)
        const diploma = flattenedData.find((unite) => unite.level.studyField.diploma._id === diplomaId)
        if (diploma) {
          state.units = null
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
      .addCase(fetchUnits.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchUnits.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.units) {
          state.units = {}
        }
        state.units[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchUnits.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createUnit.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createUnit.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.units = {}
        state.units[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createUnit.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Une erreur inconnue est survenue."
        state.create.status = "failed"
      })
      .addCase(updateUnit.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateUnit.fulfilled, (state, action: any) => {
        if (state.units) {
          const { _id: id } = action.payload.data.unit
          const allUnits = flattenPaginatedData<IUnit>(state.units!)
          const updatedUnits = allUnits.map((unit) => {
            if (unit._id === id) {
              return action.payload.data.unit
            }
            return unit
          })
          const reorderedUnitsPerPage = paginateData(updatedUnits, unitsPerPage)
          state.units = reorderedUnitsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateUnit.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Une erreur inconnue est survenue."
        state.update.status = "failed"
      })
      .addCase(deleteUnit.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteUnit.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.units = {}
        state.units[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteUnit.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Une erreur inconnue est survenue."
        state.delete.status = "failed"
      })
  },
})

export const {
  removeLevel,
  updateStudyField,
  removeStudyField,
  updateDiploma,
  removeDiploma,
  restoreFetch,
  restoreCreate,
  restoreUpdate,
  restoreDelete,
} = unitSlice.actions

export default unitSlice.reducer
