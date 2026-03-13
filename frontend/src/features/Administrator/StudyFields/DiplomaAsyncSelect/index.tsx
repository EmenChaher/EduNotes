import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { fetchDiplomas } from "@src/store/slices/administrator/diplomas/thunk"
import { restoreFetch } from "@src/store/slices/administrator/diplomas/slice"
import { diplomasPerPage } from "@src/features/Administrator/Diplomas"
import { flattenPaginatedData } from "@src/utils/paginations"
import { IDiploma } from "@src/models/diploma"
import Input from "@src/components/Input"
import { GiDiploma } from "react-icons/gi"

interface DiplomaAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
  defaultValue?: string
  placholder?: string
}

const DiplomaAsyncSelect: React.FC<DiplomaAsyncSelectProps> = ({
  setFieldTouched,
  setFieldValue,
  touched,
  error,
  defaultValue,
  placholder = "Entrez le nom du diplôme",
}) => {
  const [currentPageDiplomas, setCurrentPageDiplomas] = useState<IDiploma[]>([])
  const dispatch = useAppDispatch()
  const {
    diplomas,
    total,
    fetch: { status: diplomaStatus, error: diplomaError },
  } = useAppSelector((state) => state.administrator.diplomas)

  useEffect(() => {
    if (!diplomas) {
      dispatch(restoreFetch())
      dispatch(fetchDiplomas({ page: 1, limit: diplomasPerPage }))
    }
  }, [dispatch, diplomas])

  useEffect(() => {
    if (diplomaStatus === "succeeded" && diplomas) {
      setCurrentPageDiplomas(flattenPaginatedData(diplomas))
    }
  }, [diplomas])

  const data = useMemo(() => {
    return currentPageDiplomas.map((diploma) => ({
      key: diploma._id,
      value: diploma.label,
    }))
  }, [currentPageDiplomas])

  const totalData = useMemo(() => (diplomas !== null && !diplomaError ? total : 0), [total, diplomas, diplomaError])

  const onScroll = async (event: any) => {
    const target = event.target
    const scrollHeight = target.scrollHeight
    const scrollTop = target.scrollTop
    const clientHeight = target.clientHeight
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    if (scrollPercentage >= 80 && diplomas && totalData && currentPageDiplomas.length !== totalData) {
      const totalPages = Math.ceil(totalData / diplomasPerPage)
      let nextPage
      for (var i = 1; i <= totalPages; i++) {
        if (!diplomas[i]) {
          nextPage = i
          break
        }
      }
      if (nextPage) {
        dispatch(restoreFetch())
        dispatch(fetchDiplomas({ page: nextPage, limit: diplomasPerPage }))
      }
    }
  }
  return (
    <Input
      prefixIcon={GiDiploma}
      height="tiny:h-10 sm:h-14"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      defaultValue={defaultValue}
      options={data}
      name="diploma"
      label="Nom du diplôme"
      placeholder={placholder}
    />
  )
}

export default DiplomaAsyncSelect
