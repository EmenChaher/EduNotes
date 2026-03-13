import { ColumnType } from "antd/es/table"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchClasses } from "@src/store/slices/administrator/classes/thunk"
import { restoreFetch } from "@src/store/slices/administrator/classes/slice"
import { Dropdown, Input, message } from "antd"
import type { InputRef, TableColumnType, TableProps } from "antd"
import { IClass } from "@src/models/class"
import { FaRegTrashAlt } from "react-icons/fa"
import { BsThreeDotsVertical } from "react-icons/bs"

import { IoSearch } from "react-icons/io5"
import CreateClass from "./Modal/Create"
import DeleteClass from "./Modal/Delete"
import { FilterDropdownProps } from "antd/es/table/interface"
import Highlighter from "react-highlight-words"

export const classesPerPage = 10

const Classes: React.FC = () => {
  // State
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [currentPageClasses, setCurrentPageClasses] = useState<IClass[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const searchInput = useRef<InputRef>(null)

  // Redux
  const dispatch = useAppDispatch()
  const {
    classes,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.classes)

  // Effects
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (!classes || !classes[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchClasses({ page: currentPage, limit: classesPerPage }))
    }
  }, [dispatch, classes, currentPage])

  useEffect(() => {
    if (status === "succeeded" && classes && classes[currentPage]) {
      setCurrentPageClasses(classes[currentPage])
    }
  }, [classes, currentPage, status])

  useEffect(() => {
    if (error) {
      message.error(`Échec du chargement des classes: ${error}`)
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
  const mapClasses = (docs: IClass[]) => {
    if (!docs || !Array.isArray(docs)) return []

    // Group classes by curriculum (diploma + studyField + level)
    const groupedClasses: { [key: string]: any[] } = {}

    docs.forEach((classe: IClass) => {
      const diploma = classe.level?.studyField?.diploma?.label || ""
      const studyField = classe.level?.studyField?.label || ""
      const level = classe.level?.label || ""
      const key = `${diploma}-${studyField}-${level}`

      if (!groupedClasses[key]) {
        groupedClasses[key] = []
      }

      groupedClasses[key].push({
        id: classe._id,
        key: classe._id,
        ...classe,
        diploma,
        studyField,
        level,
        classe: classe.label,
      })
    })

    // Process grouped data with row spans
    const processedData: any[] = []
    const keys = Object.keys(groupedClasses)

    keys.forEach((key, groupIndex) => {
      const classes = groupedClasses[key]
      const curriculumRowSpan = classes.length
      const groupClassName = groupIndex % 2 === 0 ? "bg-[#F3F3F2]" : ""

      classes.forEach((classe, classIndex) => {
        processedData.push({
          ...classe,
          curriculumRowSpan: classIndex === 0 ? curriculumRowSpan : 0,
          className: groupClassName,
        })
      })
    })

    return processedData
  }

  // Memoized values
  const data = useMemo(() => mapClasses(currentPageClasses), [currentPageClasses])
  const totalData = useMemo(() => (classes !== null && !error ? total : 0), [total, classes, error])
  const dataLoading = status === "loading"
  const pageLoading = (classes === null && status !== "failed") || (dataLoading && total === null)

  // Modal handlers
  const openDeleteModal = (item: TableData) => {
    setDeleteSelectedItem(item)
    setDeleteModalVisible(true)
  }

  const handleMenuClick = (e: { key: string }, item: TableData) => {
    if (e.key === "delete") setTimeout(() => openDeleteModal(item), 100)
  }

  const menuProps = (record: IClass) => ({
    items: [
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
      title: "Diplôme",
      dataIndex: "diploma",
      key: "diploma",
      width: "25%",
      className: "min-w-52",
      ...getColumnSearchProps("diplôme"),
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Filière",
      dataIndex: "studyField",
      key: "studyField",
      width: "25%",
      className: "min-w-52",
      ...getColumnSearchProps("filière"),
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Niveau",
      dataIndex: "level",
      key: "level",
      width: "25%",
      className: "min-w-8",
      ...getColumnSearchProps("niveau"),
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Classe",
      dataIndex: "classe",
      key: "classe",
      className: "min-w-8",
      ...getColumnSearchProps("classe"),
      onCell: (record) => ({
        className: record.className,
      }),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "right",
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

  const onChange: TableProps<IClass>["onChange"] = (pagination) => {
    const newPage = pagination?.current || 1
    if (newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="w-full">
      {pageLoading ? (
        <Spinner spining={pageLoading} fullcontainer />
      ) : (
        <>
          <Table
            title="Classes"
            showHeader
            data={data}
            total={totalData || 0}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={classesPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Ajouter une classe"
            createModal={CreateClass}
            deleteModal={DeleteClass}
            onChange={onChange}
          />

          {deleteSelectedItem && (
            <DeleteClass open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}
        </>
      )}
    </div>
  )
}

export default Classes
