import React, { useState } from "react"
import SidebarItem from "../Item"
import { useAppSelector } from "@src/store"
import { ISidebarItem } from "../../items"
import { useLocation } from "react-router-dom"

interface ItemContainerProps {
  sidebarCollapsed: boolean
  item: ISidebarItem
  index: number
  isChild?: boolean
  isRootItem?: boolean
}

const ItemContainer: React.FC<ItemContainerProps> = ({ sidebarCollapsed, item, index, isChild = false, isRootItem = false }) => {
  const { pathname } = useLocation()
  const selected = pathname === item.link || (item.link && pathname.startsWith(item.link))
  const { type } = useAppSelector((state) => state.auth.user)!
  const [itemCollapsed, setItemCollapsed] = useState<boolean>(
    item.children === undefined ? true : selected ? false : item.collapsed !== undefined ? item.collapsed : false,
  )
  return (
    <div
      className={`flex flex-col ${!sidebarCollapsed ? `w-full ${isRootItem ? `p-1 box-border ${!itemCollapsed ? "border-[1px] border-dashed rounded-lg" : ""}` : ""}` : ""} `}
    >
      <SidebarItem
        sidebarCollapsed={sidebarCollapsed}
        itemCollapsed={itemCollapsed}
        setItemCollapsed={setItemCollapsed}
        item={item}
        index={index}
        isChild={isChild}
      />
      {item.children && item.children.length > 0 && (
        <div
          className={`flex flex-col gap-3 transition-all duration-300 ease-in-out overflow-hidden ${itemCollapsed ? "max-h-0" : "max-h-dvh mt-3"}`}
        >
          {item.children
            ?.filter((item) => !item.userTypes || (item.userTypes && item.userTypes.length === 0) || item.userTypes.includes(type))
            .map((child, childIndex) => {
              const childItem = { ...child, link: `${item.link}${child.link}` }

              return <ItemContainer key={childIndex} sidebarCollapsed={sidebarCollapsed} item={childItem} index={childIndex} isChild={true} />
            })}
        </div>
      )}
    </div>
  )
}

export default ItemContainer
