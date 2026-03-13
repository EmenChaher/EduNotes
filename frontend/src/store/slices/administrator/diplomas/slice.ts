import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IDiploma, IDiplomaRelatedData } from "@src/models/diploma"
import { createDiploma, deleteDiploma, fetchDiplomaRelatedData, fetchDiplomas, updateDiploma } from "./thunk"
import { diplomasPerPage } from "@src/features/Administrator/Diplomas"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"

interface DiplomaState {
  diplomas: { [page: number]: IDiploma[] } | null
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
    relatedData: IDiplomaRelatedData | null
    status: string
    error: string | null
  }
}

const initialState: DiplomaState = {
  diplomas: null,
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

const diplomaSlice = createSlice({
  name: "diplomas",
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
      state.delete.relatedData = null
      state.delete.error = null
      state.delete.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiplomas.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchDiplomas.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.diplomas) {
          state.diplomas = {}
        }
        state.diplomas[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchDiplomas.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createDiploma.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createDiploma.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.diplomas = {}
        state.diplomas[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createDiploma.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Failed to create diploma."
        state.create.status = "failed"
      })
      .addCase(updateDiploma.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateDiploma.fulfilled, (state, action: any) => {
        if (state.diplomas) {
          const { _id: id } = action.payload.data.diploma
          const allDiplomas = flattenPaginatedData<IDiploma>(state.diplomas!)
          const updatedDiplomas = allDiplomas.map((diploma) => {
            if (diploma._id === id) {
              return action.payload.data.diploma
            }
            return diploma
          })
          const reorderedStudyFieldsPerPage = paginateData(updatedDiplomas, diplomasPerPage)
          state.diplomas = reorderedStudyFieldsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateDiploma.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Failed to update diploma."
        state.update.status = "failed"
      })
      .addCase(deleteDiploma.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteDiploma.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.diplomas = {}
        state.diplomas[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteDiploma.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Failed to delete diploma."
        state.delete.status = "failed"
      })
      .addCase(fetchDiplomaRelatedData.fulfilled, (state, action: any) => {
        state.delete.relatedData = action.payload.data
      })
  },
})

export const { restoreFetch, restoreCreate, restoreUpdate, restoreDelete } = diplomaSlice.actions

export default diplomaSlice.reducer
