import React, { Fragment } from "react"
import { format, formatDistance } from "date-fns"
import { fr } from "date-fns/locale"
import { AiFillNotification } from "react-icons/ai"
import { Link } from "react-router-dom"
import { useAppDispatch } from "@src/store"
import { markNotificationAsRead } from "@src/store/slices/shared/notification/thunk"

interface INotification {
  id: string
  message: string
  date: Date
  read: boolean
  path?: string
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const formatTime = (date: Date) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const difference = now.getTime() - notificationDate.getTime()

  if (difference < 86400000 * 3) {
    return capitalizeFirstLetter(formatDistance(date, now, { addSuffix: true, locale: fr }))
  } else {
    return format(date, "yyyy-MM-dd")
  }
}

const shouldDisplayFormatTime = (date: Date) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const difference = now.getTime() - notificationDate.getTime()
  return difference < 86400000 * 3
}

const Notification: React.FC<INotification> = ({ id, message, date, read, path }) => {
  const dispatch = useAppDispatch()
  const timeDisplayed = shouldDisplayFormatTime(date)

  const onNotificationClick = () => {
    if (id) dispatch(markNotificationAsRead(id))
  }

  const notificationElement = (
    <div
      onClick={onNotificationClick}
      className={`flex gap-5 h-[4.5rem] p-2 box-border shadow-md hover:brightness-105 rounded-md ${!read ? "bg-[#e6f7ff]" : ""}`}
    >
      <AiFillNotification className="fill-dark-blue tiny:size-5 sm:size-7 self-center" />
      <div className="flex flex-col justify-between flex-1 h-full">
        <p className="tiny:text-xs sm:text-sm sm:font-medium !leading-4">{message}</p>

        <div className={`flex ${timeDisplayed ? "tiny:justify-end sm:justify-between" : "justify-end"}`}>
          {timeDisplayed && (
            <p className="text-gray-400 tiny:font-light sm:font-normal text-xs tracking-tight tiny:hidden sm:block">{formatTime(date)}</p>
          )}
          <p className="text-gray-400 tiny:font-light sm:font-normal text-xs tracking-tight">{format(date, "yyyy-MM-dd HH:mm")}</p>
        </div>
      </div>
    </div>
  )

  return path ? <Link to={`${window.location.origin}/${path}`}>{notificationElement}</Link> : <Fragment>{notificationElement}</Fragment>
}

export default Notification
