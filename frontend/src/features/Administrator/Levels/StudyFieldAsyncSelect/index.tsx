import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchStudyFields } from "@src/store/slices/administrator/studyFields/thunk"
import { restoreFetch } from "@src/store/slices/administrator/studyFields/slice"
import { studyFieldsPerPage } from "@src/features/Administrator/StudyFields"
import { flattenPaginatedData } from "@src/utils/paginations"
import { IStudyField } from "@src/models/studyField"
import Input from "@src/components/Input"
import { IoSchool } from "react-icons/io5"

interface StudyFieldAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placholder?: string
}

const StudyFieldAsyncSelect: React.FC<StudyFieldAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placholder = "Sélectionner la filière",
}) => {
  const [currentPageStudyFields, setCurrentPageStudyFields] = useState<IStudyField[]>([])
  const dispatch = useAppDispatch()
  const {
    studyFields,
    total,
    fetch: { status: studyFieldStatus, error: studyFieldError },
  } = useAppSelector((state) => state.administrator.studyFields)

  useEffect(() => {
    if (!studyFields) {
      dispatch(restoreFetch())
      dispatch(fetchStudyFields({ page: 1, limit: studyFieldsPerPage }))
    }
  }, [dispatch, studyFields])

  useEffect(() => {
    if (studyFieldStatus === "succeeded" && studyFields) {
      setCurrentPageStudyFields(flattenPaginatedData(studyFields))
    }
  }, [studyFields, studyFieldStatus])

  const data = useMemo(() => {
    if (!currentPageStudyFields || !Array.isArray(currentPageStudyFields)) return []
    
    return currentPageStudyFields.map((studyField) => {
      if (!studyField || !studyField.label || !studyField.acronym || !studyField.diploma || !studyField.diploma.label) {
        return { key: studyField._id, value: "Filière non définie" }
      }
      return {
        key: studyField._id,
        value: `${studyField.label} (${studyField.acronym}) - ${studyField.diploma.label}`,
      }
    })
  }, [currentPageStudyFields])

  const totalData = useMemo(() => (studyFields !== null && !studyFieldError ? total : 0), [total, studyFields, studyFieldError])

  const onScroll = async (event: any) => {
    const target = event.target
    const scrollHeight = target.scrollHeight
    const scrollTop = target.scrollTop
    const clientHeight = target.clientHeight
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    if (scrollPercentage >= 80 && studyFields && totalData && currentPageStudyFields.length !== totalData) {
      const totalPages = Math.ceil(totalData / studyFieldsPerPage)
      let nextPage
      for (var i = 1; i <= totalPages; i++) {
        if (!studyFields[i]) {
          nextPage = i
          break
        }
      }
      if (nextPage) {
        dispatch(restoreFetch())
        dispatch(fetchStudyFields({ page: nextPage, limit: studyFieldsPerPage }))
      }
    }
  }
  return (
    <Input
      prefixIcon={IoSchool}
      height="tiny:h-10 sm:h-14"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      defaultValue={defaultValue}
      options={data}
      name="studyField"
      label="Filière"
      placeholder={placholder}
    />
  )
}

export default StudyFieldAsyncSelect 