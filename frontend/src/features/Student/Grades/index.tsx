import React, { useEffect, useMemo } from "react"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Breadcrumb } from "antd"
import { Link, useParams } from "react-router-dom"
import Error from "@src/components/Error"
import { subjectTypeDictionary } from "@src/models/subject"
import { isValidMongoId } from "@src/utils/mongoIdValidator"
import { SubjectGrades, restoreFetch } from "@src/store/slices/student/grades/slice"
import { fetchGrades } from "@src/store/slices/student/grades/thunk"
import GradeItem from "./GradeItem"

const Grades: React.FC = () => {
  const { subjectId } = useParams()
  const dispatch = useAppDispatch()
  const { grades, status, error } = useAppSelector((state) => state.student.grades)

  const mapGrades = (docs: SubjectGrades) => {
    const grouped: { [key: string]: any[] } = {}
    docs.grades.forEach((grade) => {
      const { content, teacher, ...gradeWithoutContent } = grade
      const key = `${content}_${teacher}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(gradeWithoutContent)
    })

    return Object.keys(grouped).map((key) => {
      const [content, teacher] = key.split("_")
      return {
        content,
        teacher,
        grades: grouped[key],
      }
    })
  }

  const data = useMemo(() => {
    if (grades && subjectId && grades[subjectId] && grades[subjectId].data) {
      return mapGrades(grades[subjectId].data!)
    }
    return []
  }, [grades, subjectId])

  useEffect(() => {
    if (subjectId && (!grades || !grades[subjectId] || !grades[subjectId].data)) {
      dispatch(restoreFetch())
      dispatch(fetchGrades(subjectId))
    }
  }, [dispatch, subjectId])

  if (!subjectId) {
    return (
      <Error
        status="404"
        title="Paramètres non valides"
        subTitle="Désolé, les paramètres fournis ne sont pas valides."
        button={{ redirect: "/etudiant/matieres", text: "Aller au matières" }}
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
        button={{ redirect: "/etudiant/matieres", text: "Aller au matières" }}
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
        {subjectId &&
          grades &&
          grades[subjectId] &&
          grades[subjectId].data &&
          grades[subjectId].data?.label &&
          typeof grades[subjectId].data?.label === "string" && (
            <Breadcrumb
              items={[
                {
                  title: <Link to="/etudiant/matieres">Matières</Link>,
                  key: "subjects",
                },
                {
                  title: grades[subjectId].data?.label,
                  key: "subjectName",
                },
              ]}
            />
          )}
      </div>
      <div className="flex flex-col flex-1 gap-4">
        {(!grades || !grades[subjectId]) && !error ? (
          <Spinner fullcontainer />
        ) : (
          <>
            {data.map((content, dataIndex) => (
              <div
                key={dataIndex}
                className="shadow-[0px_0px_18px_0px_#33333333] rounded-lg overflow-hidden overflow-x-auto pb-2 flex flex-col gap-4"
              >
                <div className="bg-light-blue rounded-md h-9 flex justify-between tiny:px-4 sm:px-6 items-center text-dark-blue w-auto">
                  <p className="text-xl font-semibold">{subjectTypeDictionary[content.content]}</p>
                  <p className="text-base font-normal tiny:hidden sm:block">{content.teacher}</p>
                </div>
                <div className="flex flex-col gap-4 box-border tiny:pb-4 tiny:px-4 sm:pb-5 sm:px-6">
                  {content.grades.map((grade, gradeIndex) => (
                    <div key={gradeIndex} className="min-h-16">
                      <GradeItem {...grade} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Grades
