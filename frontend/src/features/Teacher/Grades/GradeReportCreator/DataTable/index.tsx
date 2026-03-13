import React, { useContext, useEffect, useRef, useState } from "react"
import type { GetRef, InputRef } from "antd"
import { Form, Input, InputNumber, Popconfirm, Table, Tooltip, message } from "antd"
import { MdDelete, MdPlaylistAdd } from "react-icons/md"
import { GrScorecard } from "react-icons/gr"
import AbsentLogo from "@assets/images/grade/absent.svg?react"
import ExemptLogo from "@assets/images/grade/exempt.svg?react"
import Spinner from "@src/components/Spinner"
import axiosInstance from "@src/utils/axios"
import { useParams } from "react-router-dom"
import { transformedSubjectTypeContentDictionary, transformedSubjectTypeDictionary } from "@src/models/subject"
import { resetGradesData } from "@src/store/slices/teacher/grades/slice"
import { useAppDispatch } from "@src/store"

type FormInstance<T> = GetRef<typeof Form<T>>

const EditableContext = React.createContext<FormInstance<any> | null>(null)

interface Item {
  key: string
  id: string
  grade: string
}

interface EditableRowProps {
  index: number
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  dataIndex: keyof Item
  record: Item
  handleSave: (record: Item) => void
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const form = useContext(EditableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = form.getFieldsValue(true)
      handleSave({ ...record, ...values })

      await form.validateFields()

      toggleEdit()
    } catch (errInfo) {
      console.log("Save failed:", errInfo)
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0, padding: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} est requis.`,
          },
          {
            pattern: /^\d{8}$/,
            message: `${title} doit comporter 8 chiffres.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} size="small" />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

interface EditableGradeProps {
  grade: any
  id: number
  setGradeValue: (id: number, newValue: number | "ABS" | "DISP") => void
  handleSave: (dataIndex: number, newValue: number) => void
}

const EditableGrade: React.FC<React.PropsWithChildren<EditableGradeProps>> = ({ grade, id, setGradeValue, handleSave }) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
  }

  const save = async () => {
    try {
      toggleEdit()

      let newValue = 0
      const inputValue = inputRef.current?.value
      if (!isNaN(inputValue)) {
        newValue = inputValue
      }
      if (inputValue === "" || inputValue === undefined) {
        newValue = 0
      }
      newValue = Math.round(newValue * 4) / 4

      if (newValue < 0) {
        newValue = 0
      } else if (newValue > 20) {
        newValue = 20
      }

      handleSave(id, newValue)
    } catch (errInfo) {
      console.log("Save failed:", errInfo)
    }
  }

  return (
    <div
      className={`p-1 box-border rounded-md flex justify-center items-center gap-2 transition-[width] duration-200 ${!isNaN(grade) ? "bg-dark-blue w-24" : "w-8"}`}
      onClick={() => {
        if (isNaN(grade)) {
          setGradeValue(id, 0)
        }
        toggleEdit()
      }}
    >
      <Tooltip className="hover:cursor-pointer" title="Present" destroyTooltipOnHide>
        <GrScorecard className={`size-7 ${!isNaN(grade) ? "text-white" : "text-dark-blue"}`} />
      </Tooltip>
      {!isNaN(grade) && (
        <>
          {!editing ? (
            <div className="text-white w-16 flex items-center" onClick={toggleEdit}>
              {grade}
            </div>
          ) : (
            <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} step={0.25} min={0} max={20} defaultValue={grade} className="w-16" />
          )}
        </>
      )}
    </div>
  )
}

type EditableTableProps = Parameters<typeof Table>[0]

interface DataType {
  key: React.Key
  id: string
  grade: string | number
}

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>

interface IDataTable {
  data: { id: string; grade: string | number }[]
  removeTable: () => void
  scanned?: boolean
}

const DataTable: React.FC<IDataTable> = ({ data, removeTable, scanned = true }) => {
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [initialDataSource, setInitialDataSource] = useState<DataType[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState<boolean>(false)
  const { classId, subjectId, subjectType, subjectContent } = useParams()
  const key = `${classId}${subjectId}${transformedSubjectTypeDictionary[subjectType || ""]}${transformedSubjectTypeContentDictionary[subjectContent || ""]}`
  const dispatch = useAppDispatch()

  const validateGrades = async () => {
    try {
      setLoading(true)
      const transformedSubjectType = transformedSubjectTypeDictionary[subjectType!]
      const transformedSubjectContent = transformedSubjectTypeContentDictionary[subjectContent!]
      const grades = dataSource.map(({ id, grade }) => ({ id, grade }))
      const response = await axiosInstance.post(
        `/teacher/class/${classId}/subject/${subjectId}/${transformedSubjectType}/${transformedSubjectContent}/grades`,
        {
          grades,
        },
      )

      if (response.status === 200) {
        message.success("Les notes ont été ajouté avec succès.")
        removeTable()
        dispatch(resetGradesData(key))
        return
      }
    } catch (err: any) {
      console.log("Error while uploading grades.", err.response?.data?.message)
      let errorMessage = "Veuillez réessayer."
      if (err.response?.data?.message === "Cannot insert duplicate GradeReport for the same teaching.")
        errorMessage = "Un rapport de notes pour cette classe existe déjà."
      const userNotStudentRegex = /^User with CIN '\d+' is not a student\.$/
      if (userNotStudentRegex.test(err.response.data.message)) errorMessage = "L'utilisateur avec le CIN spécifié n'est pas un étudiant."
      return message.error(`Une erreur est survenue lors de l'ajout des notes. ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key)
    setDataSource(newData)
  }

  useEffect(() => {
    const newData = data.map((item, index) => ({
      ...item,
      key: index,
    }))
    setInitialDataSource(newData)
    setDataSource(newData)
    setCount(newData.length)
  }, [data])

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: "CIN",
      dataIndex: "id",
      width: "40%",
      editable: true,
      render: (id: any) => (
        <div className={`border-[1px] rounded-md px-2 ${!/^\d{8}$/.test(id) ? "border-red-500" : "border-transparent"}`}>{id}</div>
      ),

      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
    },
    {
      title: "Note",
      width: "55%",
      dataIndex: "grade",
      onCell: () => ({
        className: "!py-2",
      }),
      onHeaderCell: () => {
        return {
          className: "!text-sm !font-semibold !text-dark-blue",
        }
      },
      render: (grade, record) => {
        return (
          <div className="flex gap-6">
            <Tooltip className="hover:cursor-pointer" title="Absent" destroyTooltipOnHide>
              <div
                className={`p-1 rounded-md flex justify-center items-center ${grade === "ABS" ? "bg-red-400" : ""}`}
                onClick={() => {
                  if (grade !== "ABS") setGradeValue(record.key, "ABS")
                }}
              >
                <AbsentLogo className={`size-8 ${grade === "ABS" ? "text-white" : "text-red-400"}`} />
              </div>
            </Tooltip>
            <Tooltip className="hover:cursor-pointer" title="Dispensé" destroyTooltipOnHide>
              <div
                className={`p-1 rounded-md flex justify-center items-center ${grade === "DISP" ? "bg-yellow-500" : ""}`}
                onClick={() => {
                  if (grade !== "DISP") setGradeValue(record.key, "DISP")
                }}
              >
                <ExemptLogo className={`size-8 ${grade === "DISP" ? "text-white" : "text-yellow-500"}`} />
              </div>
            </Tooltip>
            <EditableGrade key={record.key} id={record.key} grade={grade} setGradeValue={setGradeValue} handleSave={handleGradeSave} />
          </div>
        )
      },
    },
    {
      title: "",
      dataIndex: "Action",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="Supprimer?" onConfirm={() => handleDelete(record.key)}>
            <MdDelete className="fill-red-500 size-6 hover:cursor-pointer" />
          </Popconfirm>
        ) : null,
    },
  ]

  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      id: `12345678`,
      grade: "0",
    }
    setDataSource([...dataSource, newData])
    setCount(count + 1)
  }

  const setGradeValue = (id: number, newValue: number | "ABS" | "DISP") => {
    const newData = dataSource.map((item) => {
      if (item.key == id) {
        return { ...item, grade: newValue }
      }
      return item
    })
    setDataSource(newData)
  }

  const handleGradeSave = (id: number, newValue: number) => {
    const newData = dataSource.map((item) => {
      if (item.key == id) {
        return { ...item, grade: newValue }
      }
      return item
    })
    setDataSource(newData)
  }

  const handleSave = (row: DataType) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row,
    })
    setDataSource(newData)
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  const fieldsValid = dataSource.every((data) => data.id && /^\d{8}$/.test(data.id))

  const validateGradeRport = async () => {
    try {
      let duplicateId = null
      const hasDuplicateIds = dataSource.some((data, index) => {
        const isDuplicate = dataSource.findIndex((d) => d.id === data.id) !== index
        if (isDuplicate) {
          duplicateId = data.id
        }
        return isDuplicate
      })
      if (hasDuplicateIds) {
        message.error(`Des identifiants (${duplicateId}) en double ont été détectés.`)
        return
      }

      validateGrades()
    } catch (errInfo) {
      console.log("Save failed:", errInfo)
    }
  }

  return (
    <div className="flex flex-col gap-2 flex-1">
      <Table
        scroll={{ x: true }}
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        pagination={false}
      />
      <div className="flex justify-between">
        <div className="flex gap-2">
          {dataSource.length > 0 && (
            <button
              onClick={() => {
                if (fieldsValid) validateGradeRport()
              }}
              disabled={!fieldsValid}
              className={`tiny:flex-1 sm:flex-[0] bg-success-green border-2 border-success-green hover:bg-white px-2 gap-2 rounded-md flex justify-center items-center group ${!fieldsValid ? "hover:cursor-not-allowed" : ""}`}
            >
              <p className=" text-white group-hover:text-success-green text-sm">Valider</p>
              {loading && <Spinner className="white hover green" />}
            </button>
          )}

          <Popconfirm title="Annuler?" onConfirm={() => removeTable()}>
            <button className="bg-red-500 border-2 border-red-500 hover:bg-white size-8 rounded-md flex justify-center items-center group">
              <MdDelete className="size-6 fill-white group-hover:fill-red-500" />
            </button>
          </Popconfirm>
        </div>

        <div className="flex gap-2">
          {scanned && (
            <button className="tiny:flex-1 sm:flex-[0] bg-slate-gray border-2 border-slate-gray hover:bg-white px-2 rounded-md flex justify-center items-center group">
              <p
                className=" text-white group-hover:text-slate-gray text-sm"
                onClick={() => {
                  setDataSource(initialDataSource)
                }}
              >
                Réinitialiser
              </p>
            </button>
          )}

          <button
            onClick={handleAdd}
            className="mx-2 rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group size-8 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
          >
            <MdPlaylistAdd className="size-6 fill-white group-hover:fill-dark-blue" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable
