import { ColumnType } from "antd/es/table"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Dropdown, Input, InputRef, TableColumnType, TableProps, message } from "antd"
import { restoreFetch } from "@src/store/slices/administrator/studyFields/slice"
import { fetchStudyFields } from "@src/store/slices/administrator/studyFields/thunk"
import { FilterDropdownProps } from "antd/es/table/interface"
import { IoSearch } from "react-icons/io5"
import Highlighter from "react-highlight-words"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MdOutlineModeEdit } from "react-icons/md"
import { FaRegTrashAlt } from "react-icons/fa"
import { IStudyField } from "@src/models/studyField"
import CreateStudyField from "./Modal/Create"
import DeleteStudyField from "./Modal/Delete"
import UpdateStudyField from "./Modal/Update"

export const studyFieldsPerPage = 10

const StudyFields: React.FC = () => {
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
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

  const openDeleteModal = (item: TableData) => {
    setDeleteSelectedItem(item)
    setDeleteModalVisible(true)
  }

  const handleMenuClick = (e: any, item: TableData) => {
    if (e.key === "update") setTimeout(() => openUpdateModal(item), 100)
    else if (e.key === "delete") setTimeout(() => openDeleteModal(item), 100)
  }

  const menuProps = (record: any) => {
    const items = [
      {
        key: "update",
        label: <p className="text-dark-blue">Modifier</p>,
        icon: <MdOutlineModeEdit className="size-4 fill-dark-blue" />,
      },
      {
        key: "delete",
        danger: true,
        label: "Supprimer",
        icon: <FaRegTrashAlt />,
      },
    ]
    
    return {
      items,
      onClick: (e: any) => handleMenuClick(e, record),
    }
  }

  const columns: ColumnType<any>[] = [
    {
      title: "ID",
      dataIndex: "key",
      key: "key",
      width: "10%",
    },
    {
      title: "Diplôme",
      dataIndex: "diploma",
      key: "diploma",
      className: "min-w-52",
      ...getColumnSearchProps("diplôme"),
      render: (diploma: any) => diploma && diploma.label ? diploma.label : "—",
    },
    {
      title: "Filière",
      dataIndex: "label",
      key: "label",
      className: "min-w-52",
      ...getColumnSearchProps("filière"),
    },
    {
      title: "Acronyme",
      dataIndex: "acronym",
      key: "acronym",
      className: "min-w-28",
      ...getColumnSearchProps("acronyme"),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "4rem",
      render: (_, record) => {
        const menuItems = menuProps(record)
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
  const [currentPageStudyFields, setCurrentPageStudyFields] = useState<IStudyField[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const {
    studyFields,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.studyFields)

  const mapStudyFields = (docs: any[]) => {
    if (!docs || !Array.isArray(docs)) return []
    
    return docs.map((studyField: any, index: number) => ({
      id: studyField._id,
      key: (index + 1 + (currentPage - 1) * studyFieldsPerPage).toString(),
      ...studyField,
    }))
  }

  useEffect(() => {
    if (status === "succeeded" && studyFields && studyFields[currentPage]) {
      setCurrentPageStudyFields(studyFields[currentPage])
    }
  }, [studyFields, currentPage, status])

  const data = useMemo(() => mapStudyFields(currentPageStudyFields), [currentPageStudyFields, mapStudyFields])
  const totalData = useMemo(() => (studyFields !== null && !error ? total : 0), [total, studyFields, error])
  const dataLoading = status === "loading"
  const pageLoading = (studyFields === null && status !== "failed") || (dataLoading && total === null)

  useEffect(() => {
    if (!studyFields || !studyFields[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchStudyFields({ page: currentPage, limit: studyFieldsPerPage }))
    }
  }, [dispatch, studyFields, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (error) {
      message.error(`Failed to fetch data. ${error}`)
    }
  }, [error])

  const onChange: TableProps<any>["onChange"] = (_, filters) => {
    dispatch(fetchStudyFields({ page: currentPage, limit: studyFieldsPerPage }))
  }

  return (
    <div>
      {pageLoading ? (
        <Spinner spinning={pageLoading} fullcontainer />
      ) : (
        <>
          <Table
            title={"Filières"}
            showHeader
            data={data!}
            total={totalData!}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={studyFieldsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Ajouter une filière"
            createModal={CreateStudyField}
            onChange={onChange}
          />
          {deleteSelectedItem && (
            <DeleteStudyField open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}
          {updateSelectedItem && <UpdateStudyField open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
        </>
      )}
    </div>
  )
}

export default StudyFields
