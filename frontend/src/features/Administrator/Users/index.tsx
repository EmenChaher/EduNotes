import { ColumnType } from "antd/es/table"
import InviteUser from "./Modal/Create"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Dropdown, Input, InputRef, TableColumnType, TableProps, Tooltip, message } from "antd"
import { IUser, UserTypes, userTypeDictionary } from "@src/models/user"
import { restoreFetch } from "@src/store/slices/administrator/users/slice"
import { fetchUsers } from "@src/store/slices/administrator/users/thunk"
import { FaFemale, FaMale, FaRegTrashAlt } from "react-icons/fa"
import Regions from "@src/constants/Regions"
import { FilterDropdownProps } from "antd/es/table/interface"
import { IoSearch } from "react-icons/io5"
import Highlighter from "react-highlight-words"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MdOutlineModeEdit } from "react-icons/md"
import { FaCrown } from "react-icons/fa"
import DeleteUser from "./Modal/Delete"
import PromoteUser from "./Modal/Promote"
import UpdateUser from "./Modal/Update"

export const usersPerPage = 10

const Users: React.FC = () => {
  const [promoteSelectedItem, setPromoteSelectedItem] = useState<TableData | null>(null)
  const [promoteModalVisible, setPromoteModalVisible] = useState<boolean>(false)
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const { type } = useAppSelector((state) => state.auth.user)!
  const searchInput = useRef<InputRef>(null)

  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps["confirm"], dataIndex: string) => {
    confirm()
    setSearchText((prevState) => ({
      ...prevState,
      [dataIndex]: selectedKeys[0],
    }))
  }

  const handleReset = (clearFilters: () => void, confirm: FilterDropdownProps["confirm"], dataIndex: string) => {
    if (!searchText[dataIndex]) return
    clearFilters()
    setSearchText((prevState) => {
      const newState = { ...prevState }
      delete newState[dataIndex]
      return newState
    })
    confirm()
  }

  const getColumnSearchProps = (dataIndex: any): TableColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          className="border-dark-blue !flex "
          placeholder={`Rechercher ${dataIndex}`}
          prefix={<IoSearch className="text-[#999]" />}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div className="flex justify-between">
          <button
            className={`hover:brightness-125 px-1 ${searchText[dataIndex] ? "text-[#1677FF]" : "text-[#00000040] hover:cursor-not-allowed"}`}
            onClick={() => clearFilters && handleReset(clearFilters, confirm, dataIndex)}
          >
            Reset
          </button>
          <button
            className="bg-dark-blue border-2 border-dark-blue text-white hover:bg-white hover:text-dark-blue rounded-md flex items-center gap-2 px-1"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          >
            <IoSearch /> Recherche
          </button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => <IoSearch className={`size-3 ${filtered ? "text-dark-blue" : ""}`} />,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[searchText[dataIndex]]}
        autoEscape
        textToHighlight={text ? text.toString() : ""}
      />
    ),
  })

  const openUpdateModal = (item: TableData) => {
    setUpdateSelectedItem(item)
    setUpdateModalVisible(true)
  }

  const openPromoteModal = (item: TableData) => {
    setPromoteSelectedItem(item)
    setPromoteModalVisible(true)
  }

  const openDeleteModal = (item: TableData) => {
    setDeleteSelectedItem(item)
    setDeleteModalVisible(true)
  }
  const handleMenuClick = (e: any, item: TableData) => {
    if (e.key === "update") setTimeout(() => openUpdateModal(item), 100)
    else if (e.key === "delete") setTimeout(() => openDeleteModal(item), 100)
    else if (e.key === "promote") setTimeout(() => openPromoteModal(item), 100)
  }

  const menuProps = (record: any) => {
    const items = []
    if (record.type !== UserTypes.SuperAdmin || (record.type === UserTypes.SuperAdmin && type === UserTypes.SuperAdmin)) {
      items.push({
        key: "update",
        label: <p className="text-dark-blue">Modifier</p>,
        icon: <MdOutlineModeEdit className="size-4 fill-dark-blue" />,
      })
    }

    if (record.type === UserTypes.Admin && type === UserTypes.SuperAdmin) {
      items.push({
        key: "promote",
        label: <p className="text-[#FFD700]">Promouvoir</p>,
        icon: <FaCrown className="size-4 fill-[#FFD700]" />,
      })
    }

    if (record.type !== UserTypes.SuperAdmin) {
      items.push({
        key: "delete",
        danger: true,
        label: "Supprimer",
        icon: <FaRegTrashAlt />,
      })
    }
    return {
      items,
      onClick: (e: any) => handleMenuClick(e, record),
    }
  }

  const columns: ColumnType<any>[] = [
    {
      dataIndex: "gender",
      key: "gender",
      className: "min-w-14",
      render: (gender) => {
        return (
          <Tooltip title={gender}>
            {gender === "Homme" ? <FaMale className="size-5 fill-blue-400" /> : <FaFemale className="size-5 fill-pink-400" />}
          </Tooltip>
        )
      },
      filters: ["Homme", "Femme"].map((gender) => ({
        text: gender,
        value: gender,
      })),
    },
    {
      title: "CIN",
      dataIndex: "cin",
      key: "cin",
      className: "min-w-28",
      ...getColumnSearchProps("CIN"),
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      className: "min-w-52",
      ...getColumnSearchProps("nom"),
    },
    {
      title: "Prénom",
      dataIndex: "surname",
      key: "surname",
      className: "min-w-52",
      ...getColumnSearchProps("prénom"),
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      className: "min-w-72",
      ...getColumnSearchProps("e-mail"),
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      className: "min-w-36",
      ...getColumnSearchProps("téléphone"),
    },
    {
      title: "Date de naissance",
      dataIndex: "birthdate",
      key: "birthdate",
      className: "min-w-44",
    },
    {
      title: "Région",
      dataIndex: "region",
      key: "region",
      className: "min-w-32",
      filterSearch: true,
      filters: Regions.map((region) => ({
        text: region,
        value: region,
      })),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      className: "min-w-48",
      filters: Object.keys(UserTypes).map((key) => ({
        text: key,
        value: UserTypes[key as keyof typeof UserTypes],
      })),
      render: (type: UserTypes) => {
        return userTypeDictionary[type]
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "4rem",
      render: (_, record) => {
        const menuItems = menuProps(record)
        if (menuItems.items.length > 0)
          return (
            <div className="flex justify-end">
              <Dropdown menu={menuItems}>
                <button>
                  <BsThreeDotsVertical className="fill-slate-gray" />
                </button>
              </Dropdown>
            </div>
          )
      },
    },
  ]

  const dispatch = useAppDispatch()
  const [currentPageUsers, setCurrentPageUsers] = useState<IUser[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const {
    users,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.users)

  const mapUsers = (docs: any[]) => {
    return docs.map((user: any, index: number) => ({
      id: user._id,
      key: (index + 1 + (currentPage - 1) * usersPerPage).toString(),
      gender: user.gender,
      ...user,
    }))
  }

  useEffect(() => {
    if (status === "succeeded" && users && users[currentPage]) {
      setCurrentPageUsers(users[currentPage])
    }
  }, [users, currentPage])

  const data = useMemo(() => mapUsers(currentPageUsers), [currentPageUsers, mapUsers])
  const totalData = useMemo(() => (users !== null && !error ? total : 0), [total, users, error])
  const dataLoading = status === "loading"
  const pageLoading = (users === null && status !== "failed") || (dataLoading && total === null)

  useEffect(() => {
    if (!users || !users[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchUsers({ options: { page: currentPage, limit: usersPerPage } }))
    }
  }, [dispatch, users, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (error) {
      message.error(`Failed to fetch data. ${error}`)
    }
  }, [error])

  const onChange: TableProps<any>["onChange"] = (_, filters) => {
    dispatch(fetchUsers({ filters, options: { page: currentPage, limit: usersPerPage } }))
  }

  return (
    <div>
      {pageLoading ? (
        <Spinner spinning={pageLoading} fullcontainer />
      ) : (
        <>
          <Table
            title={"Utilisateurs"}
            showHeader
            data={data!}
            total={totalData!}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={usersPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Inviter un utilisateur"
            createModal={InviteUser}
            onChange={onChange}
          />
          {deleteSelectedItem && (
            <DeleteUser open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}
          {updateSelectedItem && <UpdateUser open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
          {promoteSelectedItem && <PromoteUser open={promoteModalVisible} setOpen={setPromoteModalVisible} item={promoteSelectedItem} />}
        </>
      )}
    </div>
  )
}

export default Users
