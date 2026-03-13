import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { flattenPaginatedData } from "@src/utils/paginations"
import Input from "@src/components/Input"
import { PiPathBold } from "react-icons/pi"
import { restoreFetch } from "@src/store/slices/administrator/classes/slice"
import { levelsPerPage } from "@src/features/Administrator/Levels"
import { IClass } from "@src/models/class"
import { fetchClasses } from "@src/store/slices/administrator/classes/thunk"

interface ClassAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placeholder?: string
  name?: string
}

const ClassAsyncSelect: React.FC<ClassAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placeholder = "Selectionner la classe",
  name = "clss",
}) => {
  const [currentPageCurriculum, setCurrentPageCurriculum] = useState<IClass[]>([])
  const dispatch = useAppDispatch()
  const {
    classes,
    total,
    fetch: { status: diplomaStatus, error: diplomaError },
  } = useAppSelector((state) => state.administrator.classes)

  useEffect(() => {
    if (!classes) {
      dispatch(restoreFetch())
      dispatch(fetchClasses({ page: 1, limit: levelsPerPage }))
    }
  }, [dispatch, classes])

  useEffect(() => {
    if (diplomaStatus === "succeeded" && classes) {
      setCurrentPageCurriculum(flattenPaginatedData(classes))
    }
  }, [classes])

  const data = useMemo(() => {
    return currentPageCurriculum.map((clss) => ({
      key: clss._id,
      value: `${clss.level.label}${clss.level.studyField.acronym} ${clss.label}`,
    }))
  }, [currentPageCurriculum])

  const totalData = useMemo(() => (classes !== null && !diplomaError ? total : 0), [total, classes, diplomaError])

  const onScroll = async (event: any) => {
    const target = event.target
    const scrollHeight = target.scrollHeight
    const scrollTop = target.scrollTop
    const clientHeight = target.clientHeight
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    if (scrollPercentage >= 80 && classes && totalData && currentPageCurriculum.length !== totalData) {
      const totalPages = Math.ceil(totalData / levelsPerPage)
      let nextPage
      for (var i = 1; i <= totalPages; i++) {
        if (!classes[i]) {
          nextPage = i
          break
        }
      }
      if (nextPage) {
        dispatch(restoreFetch())
        dispatch(fetchClasses({ page: nextPage, limit: levelsPerPage }))
      }
    }
  }
  return (
    <Input
      prefixIcon={PiPathBold}
      height="tiny:h-10 sm:h-12"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      options={data}
      defaultValue={defaultValue}
      name={name}
      label="Classe"
      placeholder={placeholder}
    />
  )
}

export default ClassAsyncSelect
