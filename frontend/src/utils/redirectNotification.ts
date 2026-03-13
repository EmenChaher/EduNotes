import { MutableRefObject } from "react"

interface IRedirectNotification {
  api: any
  key: string | MutableRefObject<string>
  onClose: () => void
  redirectTo: string
  duration?: number
  placement?: string
}

export const showRedirectNotification = ({ api, key, onClose, redirectTo, duration = 5, placement = "bottomRight" }: IRedirectNotification) => {
  let remainingTime = duration

  const displayNotification = () => {
    const title = `Redirection vers  ${redirectTo}`
    const description = `Vous serez redirigé vers ${redirectTo} dans {time} secondes.`
    api.info({
      key,
      placement,
      message: title,
      description: description.replace("{time}", `${remainingTime}`),
      duration: duration,
      onClose,
    })
  }

  const updateTimer = () => {
    remainingTime--
    if (remainingTime <= 0) {
      clearInterval(intervalId)
      api.info({
        key,
        placement,
        message: "Redirecting...",
        description: `Vous serez redirigé vers ${redirectTo}.`,
        duration: 1,
        onClose,
      })
    } else {
      displayNotification()
    }
  }

  displayNotification()

  const intervalId = setInterval(updateTimer, 1000)
}
