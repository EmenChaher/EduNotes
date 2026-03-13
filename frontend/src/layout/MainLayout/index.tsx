import Sidebar from "../../components/Sidebar"
import Navbar from "../../components/Navbar"
import { Suspense, useState } from "react"
import LazyLoad from "@src/components/LazyLoad"

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024)
  return (
    <div className="flex min-h-screen">
      <div className={`transition-all duration-200 ease-out sm:w-16 tiny:w-0 ${!sidebarCollapsed ? "lg:w-64" : ""}`}>
        <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      </div>

      <div
        className={`flex flex-col flex-1 lg:ml-0 tiny:max-w-[100vw] sm:max-w-[calc(100vw-4rem)] ${!sidebarCollapsed ? "lg:max-w-[calc(100vw-16rem)]" : ""}`}
      >
        <div className="h-16">
          <Navbar />
        </div>
        <div className={`flex flex-col tiny:px-6 sm:px-10 lg:px-16 tiny:py-4 sm:py-6 lg:py-8 flex-1`}>
          <Suspense fallback={<LazyLoad showSpinner={false} />}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
