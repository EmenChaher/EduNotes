import { ColumnType } from "antd/es/table"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchUnits } from "@src/store/slices/administrator/units/thunk"
import { restoreFetch } from "@src/store/slices/administrator/units/slice"
import { Dropdown, Input, InputRef, TableColumnType, TableProps, message } from "antd"
import { IUnit } from "@src/models/unit"
import { FaRegTrashAlt } from "react-icons/fa"
import { MdOutlineModeEdit } from "react-icons/md"
import { BsThreeDotsVertical } from "react-icons/bs"
import { IoSearch } from "react-icons/io5"
import CreateUnit from "./Modal/Create"
import UpdateUnit from "./Modal/Update"
import DeleteUnit from "./Modal/Delete"
import { FilterDropdownProps } from "antd/es/table/interface"
import Highlighter from "react-highlight-words"

export const unitsPerPage = 10

const Units: React.FC = () => {
  // State
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [currentPageUnits, setCurrentPageUnits] = useState<IUnit[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const searchInput = useRef<InputRef>(null)

  // Redux
  const dispatch = useAppDispatch()
  const {
    units,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.units)

  // Effects
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (!units || !units[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchUnits({ page: currentPage, limit: unitsPerPage }))
    }
  }, [dispatch, units, currentPage])

  useEffect(() => {
    if (status === "succeeded" && units && units[currentPage]) {
      setCurrentPageUnits(units[currentPage])
    }
  }, [units, currentPage, status])

  useEffect(() => {
    if (error) {
      message.error(`Échec du chargement des unités: ${error}`)
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
  const mapUnits = (docs: IUnit[]) => {
    if (!docs || !Array.isArray(docs)) return []

    // Group units by curriculum (diploma + studyField + level)
    const groupedUnits: { [key: string]: any[] } = {}

    docs.forEach((unit: IUnit) => {
      const diploma = unit.level?.studyField?.diploma?.label || ""
      const studyField = unit.level?.studyField?.label || ""
      const level = unit.level?.label || ""
      const key = `${diploma}-${studyField}-${level}`

      if (!groupedUnits[key]) {
        groupedUnits[key] = []
      }

      groupedUnits[key].push({
        id: unit._id,
        key: unit._id,
        ...unit,
        diploma,
        studyField,
        level,
        unit: unit.label,
      })
    })

    // Process grouped data with row spans
    const processedData: any[] = []
    const keys = Object.keys(groupedUnits)

    keys.forEach((key, groupIndex) => {
      const units = groupedUnits[key]
      const curriculumRowSpan = units.length
      const groupClassName = groupIndex % 2 === 0 ? "bg-[#F3F3F2]" : ""

      units.forEach((unit, unitIndex) => {
        processedData.push({
          ...unit,
          curriculumRowSpan: unitIndex === 0 ? curriculumRowSpan : 0,
          className: groupClassName,
        })
      })
    })

    return processedData
  }

  // Memoized values
  const data = useMemo(() => mapUnits(currentPageUnits), [currentPageUnits])
  const totalData = useMemo(() => (units !== null && !error ? total : 0), [total, units, error])
  const dataLoading = status === "loading"
  const pageLoading = (units === null && status !== "failed") || (dataLoading && total === null)

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

  const menuProps = (record: IUnit) => ({
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
      width: "10%",
      className: "min-w-8",
      ...getColumnSearchProps("niveau"),
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Unité",
      dataIndex: "unit",
      key: "unit",
      className: "min-w-64",
      ...getColumnSearchProps("unité"),
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

  const onChange: TableProps<IUnit>["onChange"] = (pagination, filters) => {
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
            title="Unités"
            showHeader
            data={data}
            total={totalData}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={unitsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Ajouter une unité"
            createModal={CreateUnit}
            updateModal={UpdateUnit}
            deleteModal={DeleteUnit}
            onChange={onChange}
          />

          {deleteSelectedItem && (
            <DeleteUnit open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}

          {updateSelectedItem && <UpdateUnit open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
        </>
      )}
    </div>
  )
}

export default Units
