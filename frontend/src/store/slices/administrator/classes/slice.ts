import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IClass } from "@src/models/class"
import { createClass, deleteClass, fetchClasses } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { classesPerPage } from "@src/features/Administrator/Classes"

interface ClassState {
  classes: { [page: number]: IClass[] } | null
  total: number | null
  fetch: {
    status: string
    error: string | null
  }
  create: {
    status: string
    error: string | null
  }
  delete: {
    status: string
    error: string | null
  }
}

const initialState: ClassState = {
  classes: null,
  total: null,
  fetch: {
    status: "idle",
    error: null,
  },
  create: {
    status: "idle",
    error: null,
  },
  delete: {
    status: "idle",
    error: null,
  },
}

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    removeLevel: (state, action: any) => {
      if (state.classes) {
        if (state.classes) {
          const levelId = action.payload
          const flattenedData = flattenPaginatedData(state.classes)
          const level = flattenedData.find((classe) => classe.level._id === levelId)
          if (level) {
            state.classes = null
            state.total = null
          }
        }
      }
    },
    updateStudyField: (state, action: PayloadAction<any>) => {
      if (state.classes) {
        const { id, label, diploma } = action.payload
        const allStudyFields = flattenPaginatedData<IClass>(state.classes!)
        const updatedStudyFields = allStudyFields.map((classe) => {
          if (classe.level.studyField._id === id) {
            return {
              ...classe,
              level: {
                ...classe.level,
                studyField: {
                  ...classe.level.studyField,
                  label,
                  diploma: diploma ? diploma : classe.level.studyField.diploma,
                },
              },
            }
          }
          return classe
        })
        state.classes = paginateData(updatedStudyFields, classesPerPage)
      }
    },
    removeStudyField: (state, action: any) => {
      if (state.classes) {
        if (state.classes) {
          const studyFieldId = action.payload
          const flattenedData = flattenPaginatedData(state.classes)
          const studyField = flattenedData.find((classe) => classe.level.studyField._id === studyFieldId)
          if (studyField) {
            state.classes = null
            state.total = null
          }
        }
      }
    },
    updateDiploma: (state, action: PayloadAction<any>) => {
      if (state.classes) {
        const { id, label } = action.payload
        const flattenedData = flattenPaginatedData<IClass>(state.classes!)
        const updatedStudyFields = flattenedData.map((classe) => {
          if (classe.level.studyField.diploma._id === id) {
            return {
              ...classe,
              level: {
                ...classe.level,
                studyField: {
                  ...classe.level.studyField,
                  diploma: {
                    ...classe.level.studyField.diploma,
                    label: label,
                  },
                },
              },
            }
          }
          return classe
        })
        state.classes = paginateData(updatedStudyFields, classesPerPage)
      }
    },

    removeDiploma: (state, action: any) => {
      if (state.classes) {
        const diplomaId = action.payload
        const flattenedData = flattenPaginatedData(state.classes)
        const diploma = flattenedData.find((classe) => classe.level.studyField.diploma._id === diplomaId)
        if (diploma) {
          state.classes = null
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
    restoreDelete: (state) => {
      state.delete.relatedData = null
      state.delete.error = null
      state.delete.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchClasses.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.classes) {
          state.classes = {}
        }
        state.classes[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchClasses.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createClass.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createClass.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.classes = {}
        state.classes[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createClass.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Une erreur inconnue est survenue."
        state.create.status = "failed"
      })
      .addCase(deleteClass.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteClass.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.classes = {}
        state.classes[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteClass.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Une erreur inconnue est survenue."
        state.delete.status = "failed"
      })
  },
})

export const { removeLevel, updateStudyField, removeStudyField, updateDiploma, removeDiploma, restoreFetch, restoreCreate, restoreDelete } =
  classSlice.actions

export default classSlice.reducer
