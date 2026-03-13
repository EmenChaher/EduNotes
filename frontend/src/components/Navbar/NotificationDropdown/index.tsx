import { INotification } from "@src/models/notification"
import { useAppDispatch, useAppSelector } from "@src/store"
import { addNotification, restoreFetch } from "@src/store/slices/shared/notification/slice"
import { fetchNotificationes, markAllNotificationsAsRead } from "@src/store/slices/shared/notification/thunk"
import { flattenPaginatedData } from "@src/utils/paginations"
import { Badge, Dropdown, Empty, MenuProps, Tooltip, message } from "antd"
import React, { useEffect, useMemo, useState } from "react"
import { FiBell } from "react-icons/fi"
import Notification from "./Notification"
import Spinner from "@src/components/Spinner"
import { MdMarkEmailRead } from "react-icons/md"
import socketManager from "@src/socket"
import { getAccessToken } from "@src/utils/token"

export const notificationsPerPage = 10

const Notifications: React.FC = () => {
  const { notifications, total, unreadCount, error, status } = useAppSelector((state) => state.notification)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleNotification = (data: INotification) => {
      dispatch(addNotification(data))
    }
    const accessToken = getAccessToken()
    if (accessToken) socketManager.setAccessToken(accessToken)
    socketManager.connect()
    socketManager.on("notification", handleNotification)

    socketManager.on("connect_error", (err) => {
      console.log("socket error", err.message)
    })

    return () => {
      socketManager.off("notification", handleNotification)
      socketManager.disconnect()
      socketManager.clearAccessToken()
    }
  }, [dispatch])

  useEffect(() => {
    if (unreadCount !== null) {
      document.title = `EduNotes${unreadCount > 0 ? ` (${unreadCount})` : ""}`
    }
  }, [unreadCount])

  useEffect(() => {
    if (!notifications || !notifications[1]) {
      dispatch(restoreFetch())
      dispatch(fetchNotificationes({ page: 1, limit: notificationsPerPage }))
    }
  }, [dispatch, notifications, 1])

  useEffect(() => {
    if (error) {
      message.error(`Failed to fetch notifications. ${error}`)
    }
  }, [error])

  const mapNotifications = (docs: INotification[]) => {
    return docs.map((notification) => {
      return {
        key: notification._id,
        source: notification.source,
        className: "!p-0",
        label: (
          <Notification
            key={notification._id}
            id={notification._id}
            message={notification.message}
            date={notification.createdAt}
            read={notification.read}
            path={notification.path}
          />
        ),
      }
    })
  }

  const items: MenuProps["items"] = useMemo(() => {
    return notifications ? mapNotifications(flattenPaginatedData(notifications)) : []
  }, [notifications, mapNotifications])

  const totalData = useMemo(() => (notifications !== null && !error ? total : 0), [total, notifications, error])

  const onScroll = async (event: any) => {
    const target = event.target
    const scrollHeight = target.scrollHeight
    const scrollTop = target.scrollTop
    const clientHeight = target.clientHeight
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    if (scrollPercentage >= 90 && notifications && totalData && items.length !== totalData) {
      const totalPages = Math.ceil(totalData / notificationsPerPage)
      let nextPage
      for (var i = 1; i <= totalPages; i++) {
        if (!notifications[i]) {
          nextPage = i
          break
        }
      }
      if (nextPage) {
        dispatch(restoreFetch())
        dispatch(fetchNotificationes({ page: nextPage, limit: notificationsPerPage }))
      }
    }
    event.stopPropagation()
  }

  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth
      setWidth(windowWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [width])

  const markAsReadElement = (
    <div
      className={`flex items-center gap-2 ${unreadCount && unreadCount > 0 ? "hover:cursor-pointer" : "hover:cursor-not-allowed"}`}
      onClick={() => {
        if (unreadCount && unreadCount > 0) dispatch(markAllNotificationsAsRead())
      }}
    >
      <MdMarkEmailRead className={`${unreadCount && unreadCount > 0 ? "fill-dark-blue" : "fill-gray-400"}  size-5`} />
      <p className={`${unreadCount && unreadCount > 0 ? "text-dark-blue" : "text-gray-400"} tiny:hidden sm:block text-xs tracking-tight`}>
        Marquer comme lu
      </p>
    </div>
  )

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      className="hover:cursor-pointer"
      overlayClassName="w-96 max-w-[calc(100dvw-3rem)] tiny:!right-[1.5rem] sm:!right-auto fixed"
      placement="bottomLeft"
      dropdownRender={(menu) => (
        <div className="bg-white rounded-lg flex flex-col gap-2 py-2 shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]">
          <div className="px-4 flex justify-between">
            <p className=" text-xl">Notifications</p>
            {width < 640 ? <Tooltip title="Marquer comme lu">{markAsReadElement}</Tooltip> : markAsReadElement}
          </div>
          <div className="h-[23.75rem]">
            {total === 0 ? (
              <Empty
                className="col-span-12 h-full flex justify-center items-center flex-col"
                description={<p className="text-slate-gray select-none">Pas de notifications</p>}
              />
            ) : (
              React.cloneElement(menu as React.ReactElement, {
                onScroll: onScroll,
                className: "!shadow-none flex max-h-[23.75rem] flex-col gap-1 overflow-hidden overflow-y-auto",
              })
            )}
          </div>

          {status === "loading" && <Spinner />}
        </div>
      )}
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <div className="bg-white size-[2.8rem] border rounded-full border-none flex justify-center items-center relative">
          <FiBell className="size-6 stroke-dark-blue" />
        </div>
      </Badge>
    </Dropdown>
  )
}

export default Notifications
