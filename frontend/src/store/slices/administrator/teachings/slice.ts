import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ITeaching } from "@src/models/teaching"
import { createTeaching, deleteTeaching, fetchTeachings, updateTeaching } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { teachingsPerPage } from "@src/features/Administrator/Teachings"

interface TeachingState {
  teachings: { [page: number]: ITeaching[] } | null
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

const initialState: TeachingState = {
  teachings: null,
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

const teachingSlice = createSlice({
  name: "teachings",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachings.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchTeachings.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.teachings) {
          state.teachings = {}
        }
        state.teachings[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchTeachings.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createTeaching.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createTeaching.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.teachings = {}
        state.teachings[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createTeaching.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Failed to create teaching."
        state.create.status = "failed"
      })
      .addCase(updateTeaching.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateTeaching.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.teachings) {
          const { _id: id } = action.payload.data.teaching
          const allTeachings = flattenPaginatedData<ITeaching>(state.teachings!)
          const updatedTeachings = allTeachings.map((teaching) => {
            if (teaching._id === id) {
              return action.payload.data.teaching
            }
            return teaching
          })
          const reorderedTeachingsPerPage = paginateData(updatedTeachings, teachingsPerPage)
          state.teachings = reorderedTeachingsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateTeaching.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Failed to update teaching."
        state.update.status = "failed"
      })
      .addCase(deleteTeaching.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteTeaching.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.teachings = {}
        state.teachings[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteTeaching.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Failed to delete teaching."
        state.delete.status = "failed"
      })
  },
})

export const { restoreFetch, restoreCreate, restoreUpdate, restoreDelete } = teachingSlice.actions

export default teachingSlice.reducer
