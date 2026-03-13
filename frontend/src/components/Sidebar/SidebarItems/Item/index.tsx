import { Link, useLocation } from "react-router-dom"
import { Tooltip } from "antd"
import { Fragment } from "react"
import { SlArrowUp } from "react-icons/sl"
import { ISidebarItem } from "../../items"

interface SidebarItemProps {
  sidebarCollapsed: boolean
  itemCollapsed: boolean
  setItemCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  item: ISidebarItem
  index: number
  isChild?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({ sidebarCollapsed, itemCollapsed, setItemCollapsed, item, index, isChild = false }) => {
  const { pathname } = useLocation()
  const Icon = item.icon

  const onClick = () => {
    if (item.children) setItemCollapsed(!itemCollapsed)
  }

  const selected = pathname === item.link || (item.link && pathname.startsWith(item.link))
  const partiallySelected = selected && item.link !== pathname && item.children

  const elementWrapperClassname = `flex rounded-lg py-2 hover:bg-white hover:cursor-pointer group px-3 items-center ${
    !sidebarCollapsed ? "w-full justify-between " : "justify-center"
  } ${selected ? (partiallySelected ? "bg-white bg-opacity-70 active" : "bg-white bg-opacity-100 active") : "hover:bg-opacity-80"}`

  const linkElement = (
    <>
      <div
        className={`stroke-white fill-white group-hover:stroke-dark-blue group-hover:fill-dark-blue group-[.active]:stroke-dark-blue group-[.active]:fill-dark-blue ${
          selected ? (partiallySelected ? "" : "bg-white bg-opacity-100 active") : ""
        }`}
      >
        <div className="flex gap-3">
          {Icon && (
            <Icon className={`${isChild ? "size-6" : "size-7 "} fill-white stroke-white group-hover:fill-dark-blue group-hover:stroke-dark-blue group-[.active]:fill-dark-blue group-[.active]:stroke-dark-blue`} />
          )}
          {!sidebarCollapsed && (
            <p
              className={`${isChild ? "text-base" : "text-lg"} text-white group-hover:text-dark-blue group-[.active]:text-dark-blue font-normal select-none`}
            >
              {item.label}
            </p>
          )}
        </div>
      </div>
      {!sidebarCollapsed && item.children && item.children.length > 0 && (
        <SlArrowUp
          className={`size-4 fill-dark-blue hover:cursor-pointer transition-transform transform ${itemCollapsed ? "rotate-180" : "rotate-0"}`}
        />
      )}
    </>
  )

  const itemElement = (
    <Fragment key={index}>
      {!item.children && item.link ? (
        <Link className={elementWrapperClassname} to={item.link}>
          {linkElement}
        </Link>
      ) : (
        <div className={elementWrapperClassname} onClick={onClick}>
          {linkElement}
        </div>
      )}
    </Fragment>
  )

  return sidebarCollapsed ? (
    <Tooltip title={item.label} placement="right" destroyTooltipOnHide key={index}>
      {itemElement}
    </Tooltip>
  ) : (
    itemElement
  )
}

export default SidebarItem
