import { logout } from "@src/store/slices/shared/auth/slice"
import { useAppDispatch, useAppSelector } from "@src/store"
import { IoIosLogOut } from "react-icons/io"
import { Tooltip } from "antd"
import { UserTypes, userTypeDictionary } from "@src/models/user"
import Notifications from "./NotificationDropdown"

const Navbar: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="flex justify-end items-center bg-light-blue h-16 px-6 fixed top-0 left-0 w-full z-[49]">
      <div className="flex justify-center items-center">
        <div className="flex gap-5">
          <Notifications />

          <div className="flex justify-center items-center tiny:gap-0 sm:gap-16">
            <div className="flex gap-3">
              <div className="flex flex-col justify-between tiny:hidden sm:block sm:min-w-60">
                <p className="text-dark-blue text-sm font-semibold">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-sky-blue text-sm font-normal">
                  {userTypeDictionary[user?.type!]}{" "}
                  {user?.type! === UserTypes.Student && (
                    <span>
                      {user?.class!.level.label}
                      {user?.class!.level.studyField.acronym} {user?.class!.label}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Tooltip title="Logout" arrow={false}>
              <div
                className="size-10 hover:cursor-pointer hover:bg-danger-red rounded-lg flex justify-center items-center group"
                onClick={handleLogout}
              >
                <IoIosLogOut className="size-7 text-dark-blue group-hover:text-white" />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
