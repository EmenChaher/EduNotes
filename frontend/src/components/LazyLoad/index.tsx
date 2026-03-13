import { useEffect } from "react"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

interface ILazyLoadProps {
  showSpinner?: boolean
}

const LazyLoad: React.FC<ILazyLoadProps> = ({ showSpinner = true }) => {
  useEffect(() => {
    NProgress.configure({ showSpinner })
    NProgress.start()

    return () => {
      NProgress.done()
    }
  }, [])

  return null
}

export default LazyLoad
