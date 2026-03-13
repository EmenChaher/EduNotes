import SidebarItems from "@src/components/Sidebar/SidebarItems"
import { FiMenu } from "react-icons/fi"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

interface SidebarPropType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const Sidebar: React.FC<SidebarPropType> = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { pathname } = useLocation()

  const [prevWidth, setPrevWidth] = useState(window.innerWidth)
  const [showBurgerMenu, setShowBurgerMenu] = useState(prevWidth < 640)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth
      if (prevWidth < 1024 && windowWidth >= 1024) {
        setSidebarCollapsed(false)
      } else if (prevWidth >= 1024 && windowWidth < 1024) {
        setSidebarCollapsed(true)
      }
      if (windowWidth < 640) {
        setShowBurgerMenu(true)
      } else {
        setShowBurgerMenu(false)
      }
      setPrevWidth(windowWidth)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [prevWidth])

  useEffect(() => {
    if (prevWidth < 1024) setSidebarCollapsed(true)
  }, [pathname])

  const hamburgerMenuIcon = <FiMenu className="size-8 stroke-dark-blue hover:cursor-pointer" onClick={toggleSidebar} />

  return (
    <>
      {showBurgerMenu && (
        <div className="bg-light-blue h-16 p-6 flex justify-center items-center top-0 left-0 z-50 fixed rounded-full ">
          <div className="flex justify-center items-center">{hamburgerMenuIcon}</div>
        </div>
      )}

      <div
        className={`flex flex-col min-h-dvh transition-all duration-200 ease-out fixed top-0 sm:left-0 lg:shadow-none z-50 ${
          sidebarCollapsed ? "w-16 tiny:-left-16" : "tiny:shadow-[rgba(0,0,0,0.5)_0px_0px_0px_10000px] w-64"
        }`}
      >
        <div className={`bg-light-blue h-16 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-end p-6"}`}>{hamburgerMenuIcon}</div>
        <div className="bg-dark-blue flex-1 pt-16 pb-10 max-h-[calc(100dvh-4rem)] overflow-hidden overflow-y-auto">
          <SidebarItems sidebarCollapsed={sidebarCollapsed} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
