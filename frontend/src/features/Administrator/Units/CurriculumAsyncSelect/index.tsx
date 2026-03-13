import React, { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@src/store"
import { flattenPaginatedData } from "@src/utils/paginations"
import Input from "@src/components/Input"
import { PiPathBold } from "react-icons/pi"
import { restoreFetch } from "@src/store/slices/administrator/levels/slice"
import { fetchLevels } from "@src/store/slices/administrator/levels/thunk"
import { levelsPerPage } from "@src/features/Administrator/Levels"
import { ILevel } from "@src/models/level"
import { IDiplomaTypes } from "@src/models/diploma"

interface CurriculumAsyncSelectProps {
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  error?: string
  touched?: boolean
}

const CurriculumAsyncSelect: React.FC<CurriculumAsyncSelectProps> = ({ setFieldTouched, setFieldValue, touched, error }) => {
  const [currentPageCurriculum, setCurrentPageCurriculum] = useState<ILevel[]>([])
  const dispatch = useAppDispatch()
  const {
    levels,
    total,
    fetch: { status: diplomaStatus, error: diplomaError },
  } = useAppSelector((state) => state.administrator.levels)

  useEffect(() => {
    if (!levels) {
      dispatch(restoreFetch())
      dispatch(fetchLevels({ page: 1, limit: levelsPerPage }))
    }
  }, [dispatch, levels])

  useEffect(() => {
    if (diplomaStatus === "succeeded" && levels) {
      setCurrentPageCurriculum(flattenPaginatedData(levels))
    }
  }, [levels])
  const data = useMemo(() => {
    return currentPageCurriculum
      .filter((level: ILevel) => level.studyField.diploma.type !== IDiplomaTypes.Engineering)
      .map((level: ILevel) => ({
        key: level._id,
        value: `${level.label} ${level.studyField.acronym}`,
      }))
  }, [currentPageCurriculum])

  const totalData = useMemo(() => (levels !== null && !diplomaError ? total : 0), [total, levels, diplomaError])

  const onScroll = async (event: any) => {
    const target = event.target
    const scrollHeight = target.scrollHeight
    const scrollTop = target.scrollTop
    const clientHeight = target.clientHeight
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    if (scrollPercentage >= 80 && levels && totalData && currentPageCurriculum.length !== totalData) {
      const totalPages = Math.ceil(totalData / levelsPerPage)
      let nextPage
      for (var i = 1; i <= totalPages; i++) {
        if (!levels[i]) {
          nextPage = i
          break
        }
      }
      if (nextPage) {
        dispatch(restoreFetch())
        dispatch(fetchLevels({ page: nextPage, limit: levelsPerPage }))
      }
    }
  }
  return (
    <Input
      prefixIcon={PiPathBold}
      height="tiny:h-10 sm:h-14"
      touched={touched}
      error={error}
      type="select"
      setFieldTouched={setFieldTouched}
      setFieldValue={setFieldValue}
      onPopupScroll={onScroll}
      options={data}
      name="curriculum"
      label="Cursus"
      placeholder="Selectionner le cursus"
    />
  )
}

export default CurriculumAsyncSelect
