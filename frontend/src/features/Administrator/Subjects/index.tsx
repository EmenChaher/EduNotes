import CreateSubject from "./Modal/Create"
import UpdateSubject from "./Modal/Update"
import DeleteSubject from "./Modal/Delete"
import Table from "@src/components/Table"
import { useEffect, useMemo, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Checkbox, Dropdown, TableColumnsType, message } from "antd"
import { FaRegTrashAlt } from "react-icons/fa"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MdOutlineModeEdit } from "react-icons/md"
import { ISubject } from "@src/models/subject"
import { restoreFetch } from "@src/store/slices/administrator/subjects/slice"
import { fetchSubjects } from "@src/store/slices/administrator/subjects/thunk"

export const subjectsPerPage = 10

const Subjects: React.FC = () => {
  // Modal states
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [updateSelectedItem, setUpdateSelectedItem] = useState<any>(null)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<any>(null)

  // Modal handlers
  const openUpdateModal = (item: any) => {
    setUpdateSelectedItem(item)
    setUpdateModalVisible(true)
  }

  const openDeleteModal = (item: any) => {
    setDeleteSelectedItem(item)
    setDeleteModalVisible(true)
  }

  const closeUpdateModal = () => {
    setUpdateModalVisible(false)
    setUpdateSelectedItem(null)
  }

  const closeDeleteModal = () => {
    setDeleteModalVisible(false)
    setDeleteSelectedItem(null)
  }

  const handleMenuClick = (e: { key: string }, item: any) => {
    if (e.key === "update") setTimeout(() => openUpdateModal(item), 100)
    else if (e.key === "delete") setTimeout(() => openDeleteModal(item), 100)
  }

  const menuProps = (record: any) => ({
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

  const columns: TableColumnsType<any> = [
    {
      title: "Diplôme",
      dataIndex: "diploma",
      key: "diploma",
      width: "25%",
      className: "min-w-28",
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
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Niveau",
      dataIndex: "level",
      key: "level",
      className: "!text-center",
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
      onCell: (record) => ({
        rowSpan: record.curriculumRowSpan,
        className: record.className,
      }),
    },
    {
      title: "Matière",
      dataIndex: "subject",
      key: "subject",
      className: "min-w-64",
      onCell: (record) => ({
        className: record.className,
      }),
    },
    {
      title: "Coefficient",
      dataIndex: "coefficient",
      key: "coefficient",
      className: "!text-center",
      onCell: (record) => ({
        className: record.className,
      }),
    },
    {
      title: "Contenu",
      dataIndex: "content",
      key: "content",
      children: [
        {
          title: "Cours",
          dataIndex: "lecture",
          key: "lecture",
          className: "min-w-20 !text-center",
          render: (lecture) => <Checkbox checked={lecture} disabled />,
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "TD",
          dataIndex: "guidedSession",
          key: "guidedSession",
          className: "min-w-20 !text-center",
          render: (guidedSession) => <Checkbox checked={guidedSession} disabled />,
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "TP",
          dataIndex: "practicalSession",
          key: "practicalSession",
          className: "min-w-20 !text-center",
          render: (practicalSession) => <Checkbox checked={practicalSession} disabled />,
          onCell: (record) => ({
            className: record.className,
          }),
        },
      ],
      onCell: (record) => ({
        className: record.className,
      }),
    },
    {
      title: "Regime",
      dataIndex: "grading",
      key: "grading",
      children: [
        {
          title: "DS1",
          dataIndex: "supervisedAssessment1",
          key: "supervisedAssessment1",
          className: "min-w-24 !text-center",
          render: (supervisedAssessment1) => supervisedAssessment1 + "%",
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "DS2",
          dataIndex: "supervisedAssessment2",
          key: "supervisedAssessment2",
          className: "min-w-24 !text-center",
          render: (supervisedAssessment2) => supervisedAssessment2 + "%",
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "TP",
          dataIndex: "practical",
          key: "practical",
          className: "min-w-24 !text-center",
          render: (practical) => practical + "%",
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "Examen",
          dataIndex: "exam",
          key: "exam",
          className: "min-w-24 !text-center",
          render: (exam) => exam + "%",
          onCell: (record) => ({
            className: record.className,
          }),
        },
        {
          title: "Autre",
          dataIndex: "other",
          key: "other",
          className: "min-w-24 !text-center",
          render: (other) => other + "%",
          onCell: (record) => ({
            className: record.className,
          }),
        },
      ],
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
      onCell: (record) => ({
        className: record.className,
      }),
    },
  ]

  const dispatch = useAppDispatch()
  const [currentPageSubjects, setCurrentPageSubjects] = useState<ISubject[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const {
    subjects,
    total,
    fetch: { status, error },
  } = useAppSelector((state) => state.administrator.subjects)

  const mapClassFields = (docs: any[]) => {
    const groupedSubjects: { [key: string]: any[] } = {}

    docs.forEach((subject: ISubject) => {
      let key = subject.unit
        ? `${subject.unit.label}-${subject.unit.level.studyField.diploma.label}-${subject.unit.level.studyField.label}-${subject.unit.level.label}`
        : `${subject.level.studyField.diploma.label}-${subject.level.studyField.label}-${subject.level.label}`

      if (!groupedSubjects[key]) {
        groupedSubjects[key] = []
      }
      groupedSubjects[key].push({
        key: subject._id,
        id: subject._id,
        subject: subject.label,
        coefficient: subject.coefficient,
        lecture: subject.lecture,
        guidedSession: subject.guidedSession,
        practicalSession: subject.practicalSession,
        supervisedAssessment1: subject?.grading?.supervisedAssessment1 || 0,
        supervisedAssessment2: subject?.grading?.supervisedAssessment2 || 0,
        practical: subject?.grading?.practical || 0,
        exam: subject?.grading?.exam || 0,
        other: subject?.grading?.other || 0,
        unit: subject.unit ? subject.unit.label : "-",
        diploma: subject.unit ? subject.unit.level.studyField.diploma.label : subject.level.studyField.diploma.label,
        studyField: subject.unit ? subject.unit.level.studyField.label : subject.level.studyField.label,
        level: subject.unit ? subject.unit.level.label : subject.level.label,
        levelId: subject.unit ? subject.unit.level._id : subject.level._id,
      })
    })

    const processedData: any[] = []

    const keys = Object.keys(groupedSubjects)
    keys.forEach((key, index) => {
      const subjects = groupedSubjects[key]
      const curriculumRowSpan = subjects.length
      const groupClassName = index % 2 === 0 ? "bg-[#F3F3F2]" : ""
      subjects.forEach((subject, subjectIndex) => {
        processedData.push({
          ...subject,
          curriculumRowSpan: subjectIndex === 0 ? curriculumRowSpan : 0,
          className: groupClassName,
        })
      })
    })

    return processedData
  }

  useEffect(() => {
    if (status === "succeeded" && subjects && subjects[currentPage]) {
      setCurrentPageSubjects(subjects[currentPage])
    }
  }, [subjects, currentPage])

  const data = useMemo(() => mapClassFields(currentPageSubjects), [currentPageSubjects, mapClassFields])
  const totalData = useMemo(() => (subjects !== null && !error ? total : 0), [total, subjects, error])
  const dataLoading = status === "loading"
  const pageLoading = (subjects === null && status !== "failed") || (dataLoading && totalData === 0)

  useEffect(() => {
    if (!subjects || !subjects[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchSubjects({ page: currentPage, limit: subjectsPerPage }))
    }
  }, [dispatch, subjects, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (error) {
      message.error(`Failed to fetch data. ${error}`)
    }
  }, [error])

  return (
    <div>
      {pageLoading ? (
        <Spinner spinning={pageLoading} fullcontainer />
      ) : (
        <Table
          title={"Matières"}
          showHeader
          data={data!}
          total={totalData!}
          loading={dataLoading}
          columns={columns}
          itemsPerPage={subjectsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          buttonText="Ajouter une matière"
          createModal={CreateSubject}
          updateModal={UpdateSubject}
          deleteModal={DeleteSubject}
        />
      )}

      {/* Update Modal */}
      {updateSelectedItem && <UpdateSubject open={updateModalVisible} setOpen={closeUpdateModal} item={updateSelectedItem} />}

      {/* Delete Modal */}
      {deleteSelectedItem && <DeleteSubject open={deleteModalVisible} setOpen={closeDeleteModal} item={deleteSelectedItem} page={currentPage} />}
    </div>
  )
}

export default Subjects
