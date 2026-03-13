import { sidebarItems } from "@components/Sidebar/items"
import { useAppSelector } from "@src/store"
import ItemContainer from "./ItemContainer"

interface SidebarItemsProps {
  sidebarCollapsed: boolean
}

const SidebarItems: React.FC<SidebarItemsProps> = ({ sidebarCollapsed }) => {
  const { type } = useAppSelector((state) => state.auth.user)!
  return (
    <div className={`flex flex-col gap-3 ${sidebarCollapsed ? "items-center" : "mx-4 items-baseline"}`}>
      {sidebarItems
        ?.filter((item) => !item.userTypes || (item.userTypes && item.userTypes.length === 0) || item.userTypes.includes(type))
        .map((item, index) => (
          <ItemContainer key={item.link} sidebarCollapsed={sidebarCollapsed} item={item} index={index} isRootItem={true}/>
        ))}
    </div>
  )
}

export default SidebarItems
