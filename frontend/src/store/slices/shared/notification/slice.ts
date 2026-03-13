import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchNotificationes, markAllNotificationsAsRead, markNotificationAsRead } from "./thunk"
import { INotification } from "@src/models/notification"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { notificationsPerPage } from "@src/components/Navbar/NotificationDropdown"

interface NotificationState {
  notifications: { [page: number]: INotification[] } | null
  total: number | null
  unreadCount: number | null
  status: string
  error: string | null
}

const initialState: NotificationState = {
  notifications: null,
  total: null,
  unreadCount: null,
  status: "idle",
  error: null,
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<INotification>) => {
      const flattenedNotifications = flattenPaginatedData(state.notifications!);
      const updatedNotifications = [action.payload, ...flattenedNotifications];
      const paginatedNotifications = paginateData(updatedNotifications, notificationsPerPage);
      state.notifications = paginatedNotifications;
      state.total = (state.total || 0) + 1;
      state.unreadCount = (state.unreadCount || 0) + 1;
    },    
    restoreFetch: (state) => {
      state.error = null
      state.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationes.pending, (state) => {
        state.error = null
        state.status = "loading"
      })
      .addCase(fetchNotificationes.fulfilled, (state, action: PayloadAction<any>) => {
        const {
          unread_count,
          notifications: { page, docs, totalDocs },
        } = action.payload.data
        if (!state.notifications) {
          state.notifications = {}
        }
        state.notifications[page] = docs
        state.total = totalDocs
        state.unreadCount = unread_count
        state.status = "succeeded"
      })
      .addCase(fetchNotificationes.rejected, (state, action: any) => {
        state.error = action.error?.message || "Une erreur inconnue est survenue."
        state.status = "failed"
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        if (state.notifications) {
          const allNotifications = flattenPaginatedData(state.notifications)
          const updatedNotifications = allNotifications.map((notification) =>
            notification._id === action.payload ? { ...notification, read: true } : notification,
          )
          const reorderedNotificationsPerPage = paginateData(updatedNotifications, notificationsPerPage)
          if (state.unreadCount) state.unreadCount = state.unreadCount - 1
          state.notifications = reorderedNotificationsPerPage
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        if (state.notifications) {
          const allNotifications = flattenPaginatedData(state.notifications)
          const updatedNotifications = allNotifications.map((notification) => ({
            ...notification,
            read: true,
          }))
          state.unreadCount = 0
          const reorderedNotificationsPerPage = paginateData(updatedNotifications, notificationsPerPage)
          state.notifications = reorderedNotificationsPerPage
        }
      })
  },
})

export const { restoreFetch, addNotification } = notificationSlice.actions

export default notificationSlice.reducer
