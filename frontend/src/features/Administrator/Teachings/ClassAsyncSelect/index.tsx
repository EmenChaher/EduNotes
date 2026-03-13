import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { flattenPaginatedData } from "@src/utils/paginations"
import Input from "@src/components/Input"
import { MdClass } from "react-icons/md"
import { restoreFetch } from "@src/store/slices/administrator/classes/slice"
import { fetchClasses } from "@src/store/slices/administrator/classes/thunk"
import { classesPerPage } from "@src/features/Administrator/Classes"
import { IClass } from "@src/models/class"

interface ClassAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placeholder?: string
}

const ClassAsyncSelect: React.FC<ClassAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placeholder = "Sélectionner la classe",
}) => {
  const [currentPageClasses, setCurrentPageClasses] = useState<IClass[]>([])
  const dispatch = useAppDispatch()
  const {
    classes,
    total,
    fetch: { status: classStatus, error: classError },
  } = useAppSelector((state) => state.administrator.classes)

  useEffect(() => {
    if (!classes) {
      dispatch(restoreFetch())
      dispatch(fetchClasses({ page: 1, limit: classesPerPage }))
    }
  }, [dispatch, classes])

  useEffect(() => {
    if (classStatus === "succeeded" && classes) {
      setCurrentPageClasses(flattenPaginatedData(classes))
    }
  }, [classes])

  const data = useMemo(() => {
    return currentPageClasses.map((cls) => ({
      key: cls._id,
      value: `${cls.level.label} ${cls.level.studyField.acronym} ${cls.label}`,
    }))
  }, [currentPageClasses])

  const onScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      // Load more data if needed
    }
  }

  return (
    <Input
      prefixIcon={MdClass}
      height="tiny:h-12 sm:h-12"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      options={data}
      defaultValue={defaultValue}
      name="clss"
      label="Classe"
      placeholder={placeholder}
    />
  )
}

export default ClassAsyncSelect
