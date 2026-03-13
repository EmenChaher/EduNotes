import React, { useEffect, useMemo, useState } from "react"
import Card from "@src/components/Card"
import Paginator from "@src/components/Paginator"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Breadcrumb, Empty } from "antd"
import { Link, useParams } from "react-router-dom"
import Error from "@src/components/Error"
import { isValidMongoId } from "@src/utils/mongoIdValidator"
import { restoreFetch } from "@src/store/slices/teacher/subjectTypes/slice"
import { fetchTeacherClassSubjectTypes, fetchTeacherClassSubjectTypesCount } from "@src/store/slices/teacher/subjectTypes/thunk"
import { subjectTypeDictionary } from "@src/models/subject"
import { TeachingType } from "@src/models/teaching"

export const subjectTypesPerPage = 12

const SubjectTypes: React.FC = () => {
  const { classId, subjectId } = useParams()

  const dispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { types, status, error } = useAppSelector((state) => state.teacher.subjectTypes)

  const mapSubjectTypes = (docs: { type: string }[]) => {
    return docs.map((subject, index) => {
      const teachingType = subject.type as TeachingType
      const parsedTeachingType = subjectTypeDictionary[teachingType]
      return {
        id: index,
        title: parsedTeachingType,
        to: parsedTeachingType.toLowerCase().replace(/\s+/g, "-"),
      }
    })
  }

  const data = useMemo(() => {
    if (types && classId && subjectId && types[subjectId] && types[subjectId].pages && types[subjectId].pages![currentPage]) {
      return mapSubjectTypes(types[subjectId].pages![currentPage])
    }
    return []
  }, [types, classId, subjectId, currentPage, mapSubjectTypes])

  const totalData = useMemo(() => {
    if (types && classId && subjectId && types[subjectId] && types[subjectId].total !== null && !error) {
      return types[subjectId].total
    }
    return 0
  }, [types, classId, error])
  const dataLoading = status === "loading"

  useEffect(() => {
    if (classId && subjectId && (!types || !types[subjectId] || !types[subjectId].pages || !types[subjectId].pages![currentPage])) {
      dispatch(restoreFetch(classId))
      dispatch(
        fetchTeacherClassSubjectTypesCount({ classId: classId, subjectId: subjectId, options: { page: currentPage, limit: subjectTypesPerPage } })
      ).then(() => {
        dispatch(fetchTeacherClassSubjectTypes({ classId: classId, subjectId: subjectId, options: { page: currentPage, limit: subjectTypesPerPage } }))
      })
    }
  }, [dispatch, classId, subjectId, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [])

  if (!classId || !subjectId) {
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

  if (!isValidMongoId(subjectId)) {
    return (
      <Error
        status="404"
        title="Identifiant du matière invalide"
        subTitle="Désolé, l'identifiant du matière est invalide."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (status === "failed") {
    return (
      <Error
        status="500"
        title="Erreur interne du serveur."
        subTitle={error}
        fullcontainer
      />
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="h-8 flex items-center mb-8">
        {classId &&
          subjectId &&
          types &&
          types[subjectId] &&
          types[subjectId].className &&
          types[subjectId].subjectName &&
          typeof types[subjectId].className === "string" &&
          typeof types[subjectId].subjectName === "string" && (
            <Breadcrumb
              items={[
                {
                  title: <Link to="/enseignant/classes">Classes</Link>,
                  key: "classes",
                },
                {
                  title: types[subjectId].className,
                  key: "className",
                },
                {
                  title: <Link to={`/enseignant/classes/${classId}`}>Matières</Link>,
                  key: "subjects",
                },
                {
                  title: types[subjectId].subjectName,
                  key: "subjectName",
                },
              ]}
            />
          )}
      </div>
      <div className="flex flex-col justify-between flex-1">
        {!types || !types[subjectId] || types[subjectId].currentPageTotal === null ? (
          <Spinner fullcontainer />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(12,1fr)] gap-3">
              {(!types[subjectId] || types[subjectId].pages === null || !types[subjectId].pages![currentPage]) &&
              types[subjectId] &&
              types[subjectId].currentPageTotal !== null ? (
                Array.from({ length: types[subjectId].currentPageTotal! }).map((_, index) => <Card key={index} loading={true} title="" />)
              ) : data.length === 0 ? (
                <Empty className="col-span-12" description={<p className="text-slate-gray select-none">Pas de données</p>} />
              ) : (
                data.map((clss, index) => <Card key={index} {...clss} />)
              )}
            </div>
            {data && data.length > 0 && (
              <Paginator
                totalItems={totalData!}
                itemsPerPage={subjectTypesPerPage}
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

export default SubjectTypes
