import React, { useEffect, useMemo, useState } from "react"
import LayoutHeader from "@src/layout/LayoutHeader"
import Card from "@src/components/Card"
import Paginator from "@src/components/Paginator"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Empty, message } from "antd"
import { ISubject } from "@src/models/subject"
import { restoreFetch } from "@src/store/slices/student/subjects/slice"
import { fetchStudentSubjects, fetchStudentSubjectsCount } from "@src/store/slices/student/subjects/thunk"

export const subjectsPerPage = 12

const Subjects: React.FC = () => {
  // State
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Redux
  const dispatch = useAppDispatch()
  const { subjects, total, currentPageTotal, status, error } = useAppSelector((state) => state.student.subjects)

  // Map subjects to card format
  const mapSubjects = (docs: ISubject[]) => {
    return docs.map((subject) => {
      // Build subtitle with available session types
      const sessionTypes = []
      if (subject.lecture) sessionTypes.push("Cours")
      if (subject.guidedSession) sessionTypes.push("TD")
      if (subject.practicalSession) sessionTypes.push("TP")

      return {
        id: subject._id,
        title: subject.label,
        subTitle: [`Coefficient: ${subject.coefficient}`, `Types: ${sessionTypes.join(", ")}`],
        to: `${subject._id}`,
      }
    })
  }

  // Memoized data for current page
  const data = useMemo(() => {
    if (subjects && subjects[currentPage]) {
      return mapSubjects(subjects[currentPage])
    }
    return []
  }, [subjects, currentPage])

  // Loading states
  const pageLoading = status === "loading" && !subjects
  const dataLoading = status === "loading"

  // Effects
  useEffect(() => {
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    dispatch(restoreFetch())
  }, [dispatch])

  useEffect(() => {
    if (currentPageTotal === null) {
      dispatch(fetchStudentSubjectsCount({ page: currentPage, limit: subjectsPerPage }))
    }
  }, [dispatch, currentPage, currentPageTotal])

  useEffect(() => {
    if (!subjects || !subjects[currentPage]) {
      dispatch(fetchStudentSubjects({ page: currentPage, limit: subjectsPerPage }))
    }
  }, [dispatch, subjects, currentPage])

  // Error handling
  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])

  return (
    <div className="flex flex-col flex-1">
      <LayoutHeader title="Matières" />
      <div className="flex flex-col justify-between flex-1">
        {pageLoading ? (
          <Spinner fullcontainer />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(12,1fr)] gap-3">
              {dataLoading && (!subjects || !subjects[currentPage]) && currentPageTotal !== null ? (
                Array.from({ length: currentPageTotal }).map((_, index) => <Card key={index} loading={true} title="" />)
              ) : data.length === 0 ? (
                <Empty className="col-span-12" description={<p className="text-slate-gray select-none">Aucune matière trouvée</p>} />
              ) : (
                data.map((subject, index) => <Card key={index} {...subject} />)
              )}
            </div>

            {total !== null && total > 0 && (
              <Paginator
                totalItems={total}
                itemsPerPage={subjectsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageLoading={dataLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Subjects
