import React, { useEffect, useMemo, useState } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Breadcrumb, Dropdown, Popconfirm, Table, Tooltip, message } from "antd"
import { Link, useParams } from "react-router-dom"
import Error from "@src/components/Error"
import {
  subjectContentDictionary,
  subjectTypeDictionary,
  transformedSubjectTypeContentDictionary,
  transformedSubjectTypeDictionary,
} from "@src/models/subject"
import { resetGradesData, restoreFetch } from "@src/store/slices/teacher/grades/slice"
import { fetchGrades } from "@src/store/slices/teacher/grades/thunk"
import { isValidMongoId } from "@src/utils/mongoIdValidator"
import GradeReportCreator from "./GradeReportCreator"
import { IGrade } from "@src/models/grade"
import { ColumnType } from "antd/es/table"
import { TableData } from "@src/components/Table"
import { MdDelete, MdOutlineModeEdit, MdPlaylistAdd } from "react-icons/md"
import { FaRegTrashAlt } from "react-icons/fa"
import { BsThreeDotsVertical } from "react-icons/bs"
import { IUser } from "@src/models/user"
import DeleteGrade from "./Modal/Delete"
import UpdateGrade from "./Modal/Update"
import CreateGrade from "./Modal/Create"
import axiosInstance from "@src/utils/axios"

const Grades: React.FC = () => {
  const [updateSelectedItem, setUpdateSelectedItem] = useState<TableData | null>(null)
  const [deleteSelectedItem, setDeleteSelectedItem] = useState<TableData | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false)
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { classId, subjectId, subjectType, subjectContent } = useParams()
  const key = `${classId}${subjectId}${transformedSubjectTypeDictionary[subjectType || ""]}${transformedSubjectTypeContentDictionary[subjectContent || ""]}`
  console.log(key)
  const dispatch = useAppDispatch()
  const {
    grades,
    fetch: { status, error },
  } = useAppSelector((state) => state.teacher.grades)

  const mapGrades = (docs: IGrade[]) => {
    return docs.map((grade) => {
      return {
        key: grade._id,
        id: grade._id,
        cin: typeof grade?.student === "string" ? grade?.student : (grade?.student as IUser)?.cin,
        name_surname:
          typeof grade?.student === "string" ? (
            <p className="text-gray-400">Étudiant non enregistré</p>
          ) : (
            `${(grade?.student as IUser)?.surname} ${(grade?.student as IUser)?.name}`
          ),
        email: typeof grade?.student === "string" ? <p className="text-gray-400">Étudiant non enregistré</p> : (grade?.student as IUser)?.email,
        grade: grade?.value,
      }
    })
  }

  const removeGradeReport = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.delete(`teacher/gradeReport/${grades![key].report}`)

      if (response.status === 200) {
        message.success("La fiche de notes a été supprimée avec succès.")
        dispatch(resetGradesData(key))
        return
      }
    } catch (err: any) {
      console.log("Failed to delete grade report.", err.response?.data?.message)
      return message.error("Impossible de supprimer fiche de notes. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
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
      title: "CIN",
      dataIndex: "cin",
      key: "cin",
      className: "min-w-28",
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
    },
    {
      title: "Nom et prénom",
      dataIndex: "name_surname",
      key: "name_surname",
      className: "min-w-72",
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      className: "min-w-52",
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
    },
    {
      title: "Note",
      dataIndex: "grade",
      key: "grade",
      className: "!p-0 !px-4",
      width: 100,
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
      render: (value) => {
        let content

        switch (typeof value) {
          case "number":
            content = (
              <div className="p-1 bg-opacity-20 bg-dark-blue rounded-2xl px-3 flex gap-2 items-center w-28">
                <div className="rounded-full size-2 bg-dark-blue"></div>
                <p className="text-dark-blue font-semibold text-xs"> {value}</p>
              </div>
            )
            break
          case "string":
            switch (value) {
              case "ABS":
                content = (
                  <div className="p-1 bg-opacity-20 bg-red-500 rounded-2xl px-3 flex gap-2 items-center w-28">
                    <div className="rounded-full size-2 bg-red-500"></div>
                    <p className="text-red-500 font-medium text-xs">Absent</p>
                  </div>
                )
                break
              case "DISP":
                content = (
                  <div className="p-1 bg-opacity-20 bg-yellow-500 rounded-2xl px-3 flex gap-2 items-center w-28">
                    <div className="rounded-full size-2 bg-yellow-500"></div>
                    <p className="text-yellow-500 font-medium text-xs">Dispensé</p>
                  </div>
                )
                break
              default:
                content = (
                  <div className="p-1 bg-opacity-20 bg-gray-500 rounded-2xl px-3 flex gap-2 items-center w-28">
                    <div className="rounded-full size-2 bg-gray-500"></div>
                    <p className="text-gray-500 font-medium text-xs">Unknown</p>
                  </div>
                )
                break
            }
            break
          default:
            content = (
              <div className="p-1 bg-opacity-20 bg-gray-500 rounded-2xl px-3 flex gap-2 items-center w-28">
                <div className="rounded-full size-2 bg-gray-500"></div>
                <p className="text-gray-500 font-medium text-xs">Unknown</p>
              </div>
            )
            break
        }

        return content
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "4rem",
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
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

  const data = useMemo(() => {
    if (grades && classId && subjectId && subjectType && subjectContent && grades[key] && grades[key].report && grades[key].data) {
      return mapGrades(grades[key].data!)
    }
    return []
  }, [grades, classId, subjectId, subjectType])

  useEffect(() => {
    if (classId && subjectId && subjectType && subjectContent && (!grades || !grades[key] || !grades[key].data)) {
      dispatch(restoreFetch())
      dispatch(
        fetchGrades({
          classId,
          subjectId,
          subjectType: transformedSubjectTypeDictionary[subjectType],
          subjectContent: transformedSubjectTypeContentDictionary[subjectContent],
        }),
      )
    }
  }, [dispatch, grades, classId, subjectId, subjectType])

  if (!classId || !subjectId || !subjectType || !subjectContent) {
    return (
      <Error
        status="404"
        title="Paramètres non valides"
        subTitle="Désolé, les paramètres fournis ne sont pas valides."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!isValidMongoId(classId)) {
    return (
      <Error
        status="404"
        title="Identifiant de classe invalide"
        subTitle="Désolé, l'identifiant de classe est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!isValidMongoId(subjectId)) {
    return (
      <Error
        status="404"
        title="Identifiant du matière invalide"
        subTitle="Désolé, l'identifiant du matière est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!transformedSubjectTypeDictionary[subjectType]) {
    return (
      <Error
        status="404"
        title="Type de matière invalide"
        subTitle="Désolé, le type du matière est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!transformedSubjectTypeContentDictionary[subjectContent]) {
    return (
      <Error
        status="404"
        title="Type de note invalide"
        subTitle="Désolé, le type du note est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (status === "failed") {
    return <Error status="500" title="Erreur interne du serveur." subTitle={error} fullcontainer />
  }

  if (grades) console.log(grades![key])

  return (
    <>
      {loading && <Spinner fullscreen />}
      <div className="flex flex-col flex-1">
        <div className="h-8 flex items-center mb-8">
          {classId &&
            subjectId &&
            grades &&
            grades[key] &&
            grades[key].className &&
            grades[key].subjectName &&
            grades[key].subjectContent &&
            typeof grades[key].className === "string" &&
            typeof grades[key].subjectName === "string" &&
            typeof grades[key].subjectContent === "string" && (
              <Breadcrumb
                items={[
                  {
                    title: <Link to="/enseignant/classes">Classes</Link>,
                    key: "classes",
                  },
                  {
                    title: grades[key].className,
                    key: "className",
                  },
                  {
                    title: <Link to={`/enseignant/classes/${classId}`}>Matières</Link>,
                    key: "subjects",
                  },
                  {
                    title: grades[key].subjectName,
                    key: "subjectName",
                  },
                  {
                    title: <Link to={`/enseignant/classes/${classId}/matières/${subjectId}`}>Contenu</Link>,
                    key: "types",
                  },
                  {
                    title: subjectTypeDictionary[transformedSubjectTypeDictionary[subjectType]],
                    key: "typeName",
                  },
                  {
                    title: <Link to={`/enseignant/classes/${classId}/matières/${subjectId}/${subjectType}`}>Notes</Link>,
                    key: "grade",
                  },
                  {
                    title: subjectContentDictionary[grades[key].subjectContent!],
                    key: "gradeContentName",
                  },
                ]}
              />
            )}
        </div>
        <div className="flex flex-col flex-1 gap-2">
          {(!grades || !grades[key]) && !error ? (
            <Spinner fullcontainer />
          ) : (
            <>
              {!grades![key].report ? (
                <GradeReportCreator />
              ) : (
                <>
                  <div className="flex gap-2 self-end">
                    <Tooltip title="Supprimer">
                      <Popconfirm
                        title="Supprimer fiche de notes?"
                        onConfirm={() => {
                          if (grades![key].report) removeGradeReport()
                        }}
                      >
                        <button className="bg-red-500 border-2 border-red-500 hover:bg-white size-8 rounded-md flex justify-center items-center group">
                          <MdDelete className="size-6 fill-white group-hover:fill-red-500" />
                        </button>
                      </Popconfirm>
                    </Tooltip>

                    <button
                      onClick={openCreateModal}
                      className="mx-2 rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group size-8 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                    >
                      <MdPlaylistAdd className="size-6 fill-white group-hover:fill-dark-blue" />
                    </button>
                  </div>
                  <Table scroll={{ x: true }} bordered dataSource={data} columns={columns} pagination={false} />
                  {<CreateGrade open={createModalVisible} report={grades![key].report!} setOpen={setCreateModalVisible} />}
                  {updateSelectedItem && <UpdateGrade open={updateModalVisible} setOpen={setUpdateModalVisible} item={updateSelectedItem} />}
                  {deleteSelectedItem && <DeleteGrade open={deleteModalVisible} setOpen={setDeleteModalVisible} item={deleteSelectedItem} />}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Grades
