import { ColumnType } from "antd/es/table"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchDiplomas } from "@src/store/slices/administrator/diplomas/thunk"
import { restoreFetch } from "@src/store/slices/administrator/diplomas/slice"
import { Dropdown, Input, InputRef, TableColumnType, TableProps, message } from "antd"
import { IDiploma, IDiplomaTypes } from "@src/models/diploma"
import { FaRegTrashAlt } from "react-icons/fa"
import { MdOutlineModeEdit } from "react-icons/md"
import { BsThreeDotsVertical } from "react-icons/bs"
import { IoSearch } from "react-icons/io5"
import CreateDiploma from "./Modal/Create"
import UpdateDiploma from "./Modal/Update"
import DeleteDiploma from "./Modal/Delete"
import { FilterDropdownProps } from "antd/es/table/interface"
import Highlighter from "react-highlight-words"

export const diplomasPerPage = 10

const Diplomas: React.FC = () => {
  // State
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [currentPageDiplomas, setCurrentPageDiplomas] = useState<IDiploma[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const searchInput = useRef<InputRef>(null)

  // Redux
  const dispatch = useAppDispatch()
  const {
    diplomas,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.diplomas)

  // Effects
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (!diplomas || !diplomas[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchDiplomas({ page: currentPage, limit: diplomasPerPage }))
    }
  }, [dispatch, diplomas, currentPage])

  useEffect(() => {
    if (status === "succeeded" && diplomas && diplomas[currentPage]) {
      setCurrentPageDiplomas(diplomas[currentPage])
    }
  }, [diplomas, currentPage, status])

  useEffect(() => {
    if (error) {
      message.error(`Échec du chargement des diplômes: ${error}`)
    }
  }, [error])

  // Search functionality
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
        searchWords={[searchText[dataIndex] || ""]}
        autoEscape
        textToHighlight={text ? text.toString() : ""}
      />
    ),
  })

  // Helpers
  const mapDiplomas = (docs: IDiploma[]) => {
    return docs.map((diploma) => ({
      id: diploma._id,
      key: diploma._id,
      ...diploma,
    }))
  }

  // Memoized values
  const data = useMemo(() => mapDiplomas(currentPageDiplomas), [currentPageDiplomas])
  const totalData = useMemo(() => (diplomas !== null && !error ? total : 0), [total, diplomas, error])
  const dataLoading = status === "loading"
  const pageLoading = (diplomas === null && status !== "failed") || (dataLoading && total === null)

  // Modal handlers
  const openUpdateModal = (item: TableData) => {
    setUpdateSelectedItem(item)
    setUpdateModalVisible(true)
  }

  const openDeleteModal = (item: TableData) => {
    setDeleteSelectedItem(item)
    setDeleteModalVisible(true)
  }

  const handleMenuClick = (e: { key: string }, item: TableData) => {
    if (e.key === "update") setTimeout(() => openUpdateModal(item), 100)
    else if (e.key === "delete") setTimeout(() => openDeleteModal(item), 100)
  }

  const menuProps = (record: IDiploma) => ({
    items: [
      {
        key: "update",
        label: <p className="text-dark-blue">Modifier</p>,
        icon: <MdOutlineModeEdit className="size-4 fill-dark-blue" />,
      },
      {
        key: "delete",
        danger: true,
        label: "Supprimer",
        icon: <FaRegTrashAlt className="size-4" />,
      },
    ],
    onClick: (e: { key: string }) => handleMenuClick(e, record),
  })

  const columns: ColumnType<any>[] = [
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      className: "min-w-40",
      ...getColumnSearchProps("label"),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      className: "min-w-32",
      render: (type: IDiplomaTypes) => type,
      filters: Object.values(IDiplomaTypes).map((type) => ({
        text: type,
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "4rem",
      render: (_, record) => (
        <div className="flex justify-end">
          <Dropdown menu={menuProps(record)} trigger={["click"]}>
            <button onClick={(e) => e.stopPropagation()} className="hover:bg-gray-100 p-1 rounded-full">
              <BsThreeDotsVertical className="fill-slate-gray" />
            </button>
          </Dropdown>
        </div>
      ),
    },
  ]

  const onChange: TableProps<IDiploma>["onChange"] = (pagination, filters) => {
    const newPage = pagination?.current || 1
    if (newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="w-full">
      {pageLoading ? (
        <Spinner spinning={pageLoading} fullcontainer />
      ) : (
        <>
          <Table
            title="Diplômes"
            showHeader
            data={data}
            total={totalData}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={diplomasPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Ajouter un diplôme"
            createModal={CreateDiploma}
            updateModal={UpdateDiploma}
            deleteModal={DeleteDiploma}
            onChange={onChange}
          />

          {deleteSelectedItem && (
            <DeleteDiploma open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}

          {updateSelectedItem && <UpdateDiploma open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
        </>
      )}
    </div>
  )
}

export default Diplomas
