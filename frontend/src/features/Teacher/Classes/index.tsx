import React, { useEffect, useMemo, useState } from "react"
import Card from "@src/components/Card"
import Paginator from "@src/components/Paginator"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Empty } from "antd"
import Error from "@src/components/Error"
import { restoreFetch } from "@src/store/slices/teacher/classes/slice"
import { fetchTeacherClassCount, fetchTeacherClasses } from "@src/store/slices/teacher/classes/thunk"
import { IClassWithCount } from "@src/store/slices/teacher/classes/slice"
import LayoutHeader from "@src/layout/LayoutHeader"

export const classesPerPage = 12

const Classes: React.FC = () => {
  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { classes, total, currentPageTotal, status, error } = useAppSelector((state) => state.teacher.classes)
  const currentUser = useAppSelector((state) => state.auth.user)

  const mapClasses = (docs: IClassWithCount[]) => {
    return docs.map((classe) => {
      const diploma = classe.level?.studyField?.diploma?.label || ""
      const studyField = classe.level?.studyField?.label || ""
      const level = classe.level?.label || ""
      const studentCount = classe.student_count || 0
      const subjectCount = classe.subject_count || 0

      return {
        id: classe._id,
        title: classe.label,
        subTitle: [
          `${diploma}`,
          `${studyField} - ${level}`,
          `${studentCount} étudiant${studentCount !== 1 ? "s" : ""}`,
          `${subjectCount} matière${subjectCount !== 1 ? "s" : ""}`,
        ],
        to: classe._id,
      }
    })
  }

  const data = useMemo(() => {
    if (!classes || !classes[currentPage]) return []
    return mapClasses(classes[currentPage])
  }, [classes, currentPage])

  useEffect(() => {
    if (!classes || !classes[currentPage]) {
      dispatch(restoreFetch())
      dispatch(fetchTeacherClassCount({ page: currentPage, limit: classesPerPage })).then(() => {
        dispatch(fetchTeacherClasses({ page: currentPage, limit: classesPerPage }))
      })
    }
  }, [dispatch, classes, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  if (error) {
    return <Error message={error} />
  }

  return (
    <div className="flex flex-col flex-1">
      <LayoutHeader title="Classes" />
      <div className="flex flex-col justify-between flex-1">
        {!classes || currentPageTotal === null ? (
          <Spinner fullcontainer />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(12,1fr)] gap-3">
              {!classes[currentPage] && currentPageTotal !== null ? (
                Array.from({ length: currentPageTotal }).map((_, index) => <Card key={index} loading={true} title="" />)
              ) : data.length === 0 ? (
                <Empty className="col-span-12" description={<p className="text-slate-gray select-none">Pas de données</p>} />
              ) : (
                data.map((classe, index) => <Card key={index} {...classe} />)
              )}
            </div>
            {total && total > classesPerPage && (
              <Paginator currentPage={currentPage} setCurrentPage={setCurrentPage} totalItems={total} itemsPerPage={classesPerPage} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Classes
