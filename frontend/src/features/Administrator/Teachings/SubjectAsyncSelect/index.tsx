import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { flattenPaginatedData } from "@src/utils/paginations"
import Input from "@src/components/Input"
import { MdSubject } from "react-icons/md"
import { restoreFetch } from "@src/store/slices/administrator/subjects/slice"
import { fetchSubjects } from "@src/store/slices/administrator/subjects/thunk"
import { subjectsPerPage } from "@src/features/Administrator/Subjects"
import { ISubject } from "@src/models/subject"

interface SubjectAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placeholder?: string
}

const SubjectAsyncSelect: React.FC<SubjectAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placeholder = "Sélectionner la matière",
}) => {
  const [currentPageSubjects, setCurrentPageSubjects] = useState<ISubject[]>([])
  const dispatch = useAppDispatch()
  const {
    subjects,
    total,
    fetch: { status: subjectStatus, error: subjectError },
  } = useAppSelector((state) => state.administrator.subjects)

  useEffect(() => {
    if (!subjects) {
      dispatch(restoreFetch())
      dispatch(fetchSubjects({ page: 1, limit: subjectsPerPage }))
    }
  }, [dispatch, subjects])

  useEffect(() => {
    if (subjectStatus === "succeeded" && subjects) {
      setCurrentPageSubjects(flattenPaginatedData(subjects))
    }
  }, [subjects])

  const data = useMemo(() => {
    return currentPageSubjects.map((subject) => ({
      key: subject._id,
      value: subject.label,
    }))
  }, [currentPageSubjects])

  const onScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      // Load more data if needed
    }
  }

  return (
    <Input
      prefixIcon={MdSubject}
      height="tiny:h-12 sm:h-12"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      options={data}
      defaultValue={defaultValue}
      name="subject"
      label="Matière"
      placeholder={placeholder}
    />
  )
}

export default SubjectAsyncSelect
