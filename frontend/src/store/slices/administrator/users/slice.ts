import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IUser, UserTypes } from "@src/models/user"
import { deleteUser, fetchUsers, promoteUser, sendInvitation, updateUser } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { usersPerPage } from "@src/features/Administrator/Users"

interface UserState {
  users: { [page: number]: IUser[] } | null
  total: number | null
  fetch: {
    status: string
    error: string | null
  }
  invite: {
    status: string
    error: string | null
  }
  delete: {
    status: string
    error: string | null
  }
  update: {
    status: string
    error: string | null
  }
  promote: {
    status: string
    error: string | null
  }
}

const initialState: UserState = {
  users: null,
  total: null,
  fetch: {
    status: "idle",
    error: null,
  },
  invite: {
    status: "idle",
    error: null,
  },
  delete: {
    status: "idle",
    error: null,
  },
  update: {
    status: "idle",
    error: null,
  },
  promote: {
    status: "idle",
    error: null,
  },
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    restoreUsers: (state) => {
      state.users = null
      state.total = null
    },
    restoreFetch: (state) => {
      state.fetch.error = null
      state.fetch.status = "idle"
    },
    restoreInvite: (state) => {
      state.invite.error = null
      state.invite.status = "idle"
    },
    restoreUpdate: (state) => {
      state.update.error = null
      state.update.status = "idle"
    },
    restoreDelete: (state) => {
      state.delete.error = null
      state.delete.status = "idle"
    },
    restorePromote: (state) => {
      state.promote.error = null
      state.promote.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        const {
          filters,
          data: { page, docs, totalDocs },
        } = action.payload.data
        if (!state.users || filters) {
          state.users = {}
        }
        state.users[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchUsers.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(sendInvitation.pending, (state) => {
        state.invite.error = null
        state.invite.status = "loading"
      })
      .addCase(sendInvitation.fulfilled, (state) => {
        state.invite.error = null
        state.invite.status = "succeeded"
      })
      .addCase(sendInvitation.rejected, (state, action: any) => {
        state.invite.error = action.error?.message || "Une erreur inconnue est survenue."
        state.invite.status = "failed"
      })
      .addCase(updateUser.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateUser.fulfilled, (state, action: any) => {
        if (state.users) {
          const { _id: id } = action.payload.data.user
          const allUsers = flattenPaginatedData<IUser>(state.users!)
          const updatedUsers = allUsers.map((user) => {
            if (user._id === id) {
              return action.payload.data.user
            }
            return user
          })
          const reorderedUnitsPerPage = paginateData(updatedUsers, usersPerPage)
          state.users = reorderedUnitsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateUser.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Une erreur inconnue est survenue."
        state.update.status = "failed"
      })
      .addCase(promoteUser.pending, (state) => {
        state.promote.error = null
        state.promote.status = "loading"
      })
      .addCase(promoteUser.fulfilled, (state, action: any) => {
        if (state.users) {
          const { previousSuperAdminId, id } = action.payload
          const allUsers = flattenPaginatedData<any>(state.users!)
          const updatedUsers = allUsers.map((user) => {
            if (user._id === id) {
              return { ...user, type: UserTypes.SuperAdmin }
            }
            if (user._id === previousSuperAdminId) {
              return { ...user, type: UserTypes.Admin }
            }
            return user
          })
          const reorderedUnitsPerPage = paginateData(updatedUsers, usersPerPage)
          state.users = reorderedUnitsPerPage
        }
        state.promote.status = "succeeded"
      })
      .addCase(promoteUser.rejected, (state, action: any) => {
        state.promote.error = action.error?.message || "Une erreur inconnue est survenue."
        state.promote.status = "failed"
      })
      .addCase(deleteUser.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteUser.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.users = {}
        state.users[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteUser.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Une erreur inconnue est survenue."
        state.delete.status = "failed"
      })
  },
})

export const { restoreUpdate, restorePromote, restoreUsers, restoreFetch, restoreInvite, restoreDelete } = userSlice.actions

export default userSlice.reducer
