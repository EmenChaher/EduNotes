import { ColumnType } from "antd/es/table"
import Table, { TableData } from "@src/components/Table"
import { useEffect, useMemo, useRef, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Dropdown, Input, InputRef, TableColumnType, TableProps, message } from "antd"
import { restoreFetch } from "@src/store/slices/administrator/teachings/slice"
import { fetchTeachings } from "@src/store/slices/administrator/teachings/thunk"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaRegTrashAlt } from "react-icons/fa"
import { MdOutlineModeEdit } from "react-icons/md"
import { IoSearch } from "react-icons/io5"
import DeleteTeaching from "@features/Administrator/Teachings/Modal/Delete"
import UpdateTeaching from "@features/Administrator/Teachings/Modal/Update"
import CreateTeaching from "@features/Administrator/Teachings/Modal/Create"
import { TeachingType, teachingTypeDictionary } from "@src/models/teaching"
import { FilterDropdownProps } from "antd/es/table/interface"
import Highlighter from "react-highlight-words"

// Constants
export const teachingsPerPage = 10

// Import the ITeaching interface
import { ITeaching } from "@src/models/teaching"

const Teachings: React.FC = () => {
  // State
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [currentPageTeachings, setCurrentPageTeachings] = useState<ITeaching[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchText, setSearchText] = useState<Record<string, string>>({})
  const searchInput = useRef<InputRef>(null)

  // Redux
  const dispatch = useAppDispatch()
  const {
    teachings,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.teachings)

  // Effects
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (!teachings || !teachings[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchTeachings({ page: currentPage, limit: teachingsPerPage }))
    }
  }, [dispatch, teachings, currentPage])

  useEffect(() => {
    if (status === "succeeded" && teachings && teachings[currentPage]) {
      setCurrentPageTeachings(teachings[currentPage])
    }
  }, [teachings, currentPage, status])

  useEffect(() => {
    if (error) {
      message.error(`Échec du chargement des enseignements: ${error}`)
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
  const mapTeachings = (docs: ITeaching[]) => {
    if (!docs || !Array.isArray(docs)) return []

    // Group teachings by class and subject
    const groupedTeachings: { [key: string]: any[] } = {}

    docs.forEach((teaching: ITeaching) => {
      const classLabel =
        teaching.class?.level?.label && teaching.class?.level?.studyField?.acronym && teaching.class?.label
          ? `${teaching.class.level.label} ${teaching.class.level.studyField.acronym} ${teaching.class.label}`
          : ""
      const subjectLabel = teaching.subject?.label || ""
      const key = `${classLabel}-${subjectLabel}`

      if (!groupedTeachings[key]) {
        groupedTeachings[key] = []
      }

      groupedTeachings[key].push({
        id: teaching._id,
        key: teaching._id,
        ...teaching,
        class: classLabel,
        subject: subjectLabel,
        teacher: `${teaching.teacher?.name || ""} ${teaching.teacher?.surname || ""}`.trim(),
        classLabel,
        subjectLabel,
        teacherName: `${teaching.teacher?.name || ""} ${teaching.teacher?.surname || ""}`.trim(),
      })
    })

    // Process grouped data with row spans
    const processedData: any[] = []
    const keys = Object.keys(groupedTeachings)

    keys.forEach((key, groupIndex) => {
      const teachings = groupedTeachings[key]
      const groupClassName = groupIndex % 2 === 0 ? "bg-[#F3F3F2]" : ""

      teachings.forEach((teaching, teachingIndex) => {
        processedData.push({
          ...teaching,
          classRowSpan: teachingIndex === 0 ? teachings.length : 0,
          subjectRowSpan: teachingIndex === 0 ? teachings.length : 0,
          className: groupClassName,
        })
      })
    })

    return processedData
  }

  // Memoized values
  const data = useMemo(() => mapTeachings(currentPageTeachings), [currentPageTeachings])
  const totalData = useMemo(() => (teachings !== null && !error ? total : 0), [total, teachings, error])
  const dataLoading = status === "loading"
  const pageLoading = (teachings === null && status !== "failed") || (dataLoading && total === null)

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

  const menuProps = (record: ITeaching) => ({
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

  // Table configuration
  const columns: ColumnType<ITeaching>[] = [
    {
      title: "Classe",
      dataIndex: "class",
      key: "class",
      className: "min-w-32",
      ...getColumnSearchProps("classe"),
      onCell: (record) => ({
        rowSpan: record.classRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Matière",
      dataIndex: "subject",
      key: "subject",
      className: "min-w-32",
      ...getColumnSearchProps("matière"),
      onCell: (record) => ({
        rowSpan: record.subjectRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      className: "min-w-32",
      filters: Object.values(TeachingType).map((type) => ({
        text: teachingTypeDictionary[type],
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
      render: (type: TeachingType) => teachingTypeDictionary[type],
      onCell: (record) => ({
        className: record.className,
      }),
    },
    {
      title: "Enseignant",
      dataIndex: "teacher",
      key: "teacher",
      className: "min-w-48",
      ...getColumnSearchProps("enseignant"),
      onCell: (record) => ({
        className: record.className,
      }),
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

  const onChange: TableProps<ITeaching>["onChange"] = (pagination) => {
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
            title="Enseignements"
            showHeader
            data={data}
            total={totalData}
            loading={dataLoading}
            columns={columns}
            itemsPerPage={teachingsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            buttonText="Ajouter un enseignement"
            createModal={CreateTeaching}
            updateModal={UpdateTeaching}
            deleteModal={DeleteTeaching}
            onChange={onChange}
          />

          {deleteSelectedItem && (
            <DeleteTeaching open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
          )}

          {updateSelectedItem && <UpdateTeaching open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
        </>
      )}
    </div>
  )
}

export default Teachings
