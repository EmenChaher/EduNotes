import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { flattenPaginatedData } from "@src/utils/paginations"
import Input from "@src/components/Input"
import { MdPerson } from "react-icons/md"
import { restoreFetch } from "@src/store/slices/administrator/teachers/slice"
import { fetchTeachers } from "@src/store/slices/administrator/teachers/thunk"
import { IUser, UserTypes } from "@src/models/user"

interface TeacherAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placeholder?: string
}

const TeacherAsyncSelect: React.FC<TeacherAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placeholder = "Sélectionner l'enseignant",
}) => {
  const [currentPageTeachers, setCurrentPageTeachers] = useState<IUser[]>([])
  const dispatch = useAppDispatch()
  const { teachers, total, status: teacherStatus, error: teacherError } = useAppSelector((state) => state.administrator.teachers)

  useEffect(() => {
    if (!teachers) {
      dispatch(restoreFetch())
      dispatch(fetchTeachers({ page: 1, limit: 50 }))
    }
  }, [dispatch, teachers])

  useEffect(() => {
    if (teacherStatus === "succeeded" && teachers) {
      setCurrentPageTeachers(flattenPaginatedData(teachers))
    }
  }, [teachers, teacherStatus])

  const data = useMemo(() => {
    return currentPageTeachers.map((teacher) => ({
      key: teacher._id,
      value: `${teacher.name} ${teacher.surname}`,
    }))
  }, [currentPageTeachers])

  const onScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      // Load more data if needed
    }
  }

  return (
    <Input
      prefixIcon={MdPerson}
      height="tiny:h-12 sm:h-12"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      options={data}
      defaultValue={defaultValue}
      name="teacher"
      label="Enseignant"
      placeholder={placeholder}
    />
  )
}

export default TeacherAsyncSelect
