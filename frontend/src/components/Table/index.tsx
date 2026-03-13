import React, { useState, useEffect } from "react"
import { Dropdown, Table as AntdTable, TableColumnsType, TablePaginationConfig } from "antd"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaRegTrashAlt } from "react-icons/fa"
import { MdOutlineModeEdit } from "react-icons/md"
import { MdPlaylistAdd } from "react-icons/md"
import LayoutHeader from "@src/layout/LayoutHeader"
import Paginator from "../Paginator"
import { FilterValue, SorterResult, TableCurrentDataSource } from "antd/es/table/interface"

export interface CreateTableItemModalPropTypes {
  open: boolean
  page: number
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export interface UpdateTableItemModalPropTypes {
  open: boolean
  item: TableData
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DeleteTableItemModalPropTypes {
  open: boolean
  item: TableData
  page: number
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export type TableData = {
  [key: string]: any
}

interface TablePropTypes {
  title: string
  data: TableData[]
  total: number
  loading: boolean
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  columns: TableColumnsType<any>
  buttonText: string
  itemsPerPage?: number
  indexing?: boolean
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[],
    extra: TableCurrentDataSource<any>
  ) => void
  createModal?: React.ComponentType<CreateTableItemModalPropTypes>
  updateModal?: React.ComponentType<UpdateTableItemModalPropTypes>
  deleteModal?: React.ComponentType<DeleteTableItemModalPropTypes>
  showHeader?: boolean
  actions?: boolean
}

const Table: React.FC<TablePropTypes> = ({
  title,
  data,
  total,
  columns,
  buttonText,
  loading,
  itemsPerPage = 10,
  currentPage,
  setCurrentPage,
  onChange,
  indexing = false,
  showHeader = false,
  actions = true,
  createModal: CreateModal,
  updateModal: UpdateModal,
  deleteModal: DeleteModal,
}) => {
  const [dataSource, setDataSource] = useState<TableData[]>([])
  const [columnSource, setColumnSource] = useState<TableColumnsType<any>>([])
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openCreateModal = () => setCreateModalVisible(true)
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
    const items = []
    if (UpdateModal) {
      items.push({
        key: "update",
        label: <p className="text-dark-blue">Modifier</p>,
        icon: <MdOutlineModeEdit className="size-4 fill-dark-blue" />,
      })
    }
    if (DeleteModal) {
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

  const getTableItemActions = (record: any) => {
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
    else return false
  }

  useEffect(() => {
    const newData = data.map((item) => ({
      ...item,
      ...(indexing && {
        id: (
          <div className="w-full h-full flex justify-center items-center">
            <div className="border-[1px] border-dark-blue tiny:w-7 xs:w-8 sm:w-9 md:w-10 h-5 bg-light-blue flex justify-center items-center text-sm font-semibold text-dark-blue rounded-xl">
              {item.key}
            </div>
          </div>
        ),
      }),
      action: actions ? getTableItemActions(item) : null,
    }))
    setDataSource(newData)
  }, [actions, data, indexing])

  useEffect(() => {
    const modifiedColumns = columns.map((column) => {
      if (column.title && typeof column.title === "string") {
        column.title = <p className="text-sm font-semibold text-dark-blue">{column.title}</p>
      }
      if ("children" in column && Array.isArray(column.children)) {
        column.children = column.children.map((child) => {
          if (child.title && typeof child.title === "string") {
            child.title = <p className="text-sm font-semibold text-dark-blue">{child.title}</p>
          }
          return child
        })
      }
      return column
    })
    setColumnSource(modifiedColumns)
  }, [columns])

  return (
    <div className="flex flex-col flex-1 gap-2">
      <div className="flex justify-between items-start">
        <LayoutHeader title={title} />
        {CreateModal && buttonText && (
          <button
            onClick={openCreateModal}
            className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-8 sm:h-10 tiny:w-8 sm:w-52 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
          >
            <p className="text-white font-semibold text-sm select-none group-hover:text-dark-blue sm:block tiny:hidden">{buttonText}</p>
            <MdPlaylistAdd className="size-6 fill-white group-hover:fill-dark-blue" />
          </button>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1">
        <AntdTable
          scroll={{ x: true }}
          bordered
          showHeader={showHeader}
          pagination={false}
          columns={columnSource}
          dataSource={dataSource}
          loading={loading}
          rowHoverable={false}
          onChange={onChange}
        />

        <Paginator totalItems={total} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={handlePageChange} pageLoading={loading} />
      </div>

      {CreateModal && <CreateModal open={createModalVisible} page={currentPage} setOpen={setCreateModalVisible} />}
      {UpdateModal && updateSelectedItem && <UpdateModal open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
      {DeleteModal && deleteSelectedItem && (
        <DeleteModal open={deleteModalVisible} setOpen={setDeleteModalVisible} page={currentPage} item={deleteSelectedItem} />
      )}
    </div>
  )
}

export default Table
