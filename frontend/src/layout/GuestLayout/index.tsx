import LazyLoad from "@src/components/LazyLoad"
import { Fragment, Suspense } from "react"

interface MainLayoutProps {
  children: React.ReactNode
}

const GuestLayout = ({ children }: MainLayoutProps) => {
  return (
    <Fragment>
      <Suspense fallback={<LazyLoad />}>{children}</Suspense>
    </Fragment>
  )
}

export default GuestLayout
