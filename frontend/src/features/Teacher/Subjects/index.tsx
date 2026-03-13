import React, { useEffect, useMemo, useState } from "react"
import Card from "@src/components/Card"
import Paginator from "@src/components/Paginator"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Breadcrumb, Empty } from "antd"
import { Link, useParams } from "react-router-dom"
import Error from "@src/components/Error"
import { isValidMongoId } from "@src/utils/mongoIdValidator"
import { restoreFetch } from "@src/store/slices/teacher/subjects/slice"
import { fetchTeacherClassSubjects, fetchTeacherClassSubjectsCount } from "@src/store/slices/teacher/subjects/thunk"
import { ISubjectWithTypes, subjectTypeDictionary } from "@src/models/subject"

export const subjectsPerPage = 12

const Subjects: React.FC = () => {
  const { classId } = useParams()

  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { subjects, status, error } = useAppSelector((state) => state.teacher.subjects)

  const mapSubjects = (docs: ISubjectWithTypes[]) => {
    return docs.map((subject) => {
      const convertedTypes = subject.types.map((type) => subjectTypeDictionary[type])
      return {
        id: subject._id,
        title: subject?.label,
        subTitle: convertedTypes,
        to: `matières/${subject._id}`,
      }
    })
  }

  const data = useMemo(() => {
    if (subjects && classId && subjects[classId] && subjects[classId].pages && subjects[classId].pages![currentPage]) {
      return mapSubjects(subjects[classId].pages![currentPage])
    }
    return []
  }, [subjects, classId, currentPage, mapSubjects])

  const totalData = useMemo(() => {
    if (subjects && classId && subjects[classId] && subjects[classId].total !== null && !error) {
      return subjects[classId].total
    }
    return 0
  }, [subjects, classId, error])
  const dataLoading = status === "loading"

  useEffect(() => {
    if (classId && (!subjects || !subjects[classId] || !subjects[classId].pages || !subjects[classId].pages![currentPage])) {
      dispatch(restoreFetch(classId))
      dispatch(fetchTeacherClassSubjectsCount({ classId: classId, options: { page: currentPage, limit: subjectsPerPage } })).then(() => {
        dispatch(fetchTeacherClassSubjects({ classId: classId, options: { page: currentPage, limit: subjectsPerPage } }))
      })
    }
  }, [dispatch, classId, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  if (!classId) {
    return (
      <Error
        status="404"
        title="Identifiant de classe non fourni"
        subTitle="Désolé, l'identifiant de classe n'a pas été fourni."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!isValidMongoId(classId)) {
    return (
      <Error
        status="404"
        title="Identifiant de classe invalide"
        subTitle="Désolé, l'identifiant de classe est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (status === "failed") {
    return <Error status="500" title="Erreur interne du serveur." subTitle={error} fullcontainer />
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="h-8 flex items-center mb-8">
        {subjects && classId && subjects[classId] && subjects[classId].className && (
          <Breadcrumb
            items={[
              {
                title: <Link to="/enseignant/classes">Classes</Link>,
                key: "classes",
              },
              {
                title: subjects[classId].className,
                key: "className",
              },
              {
                title: "Matières",
                key: "subjects",
              },
            ]}
          />
        )}
      </div>
      <div className="flex flex-col justify-between flex-1">
        {!subjects || !subjects[classId] || subjects[classId].currentPageTotal === null ? (
          <Spinner fullcontainer />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(12,1fr)] gap-3">
              {(!subjects[classId] || subjects[classId].pages === null || !subjects[classId].pages![currentPage]) &&
              subjects[classId] &&
              subjects[classId].currentPageTotal !== null ? (
                Array.from({ length: subjects[classId].currentPageTotal! }).map((_, index) => <Card key={index} loading={true} title="" />)
              ) : data.length === 0 ? (
                <Empty className="col-span-12" description={<p className="text-slate-gray select-none">Pas de données</p>} />
              ) : (
                data.map((clss, index) => <Card key={index} {...clss} />)
              )}
            </div>
            {data && data.length > 0 && (
              <Paginator
                totalItems={totalData!}
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
