import React, { useEffect, useMemo } from "react"
import Card from "@src/components/Card"
import Spinner from "@src/components/Spinner"
import { useAppDispatch, useAppSelector } from "@src/store"
import { Breadcrumb, Empty } from "antd"
import { Link, useParams } from "react-router-dom"
import Error from "@src/components/Error"
import { SubjectContent, subjectContentDictionary, subjectTypeDictionary } from "@src/models/subject"
import {
  fetchTeacherClassSubjectTypeContent,
  fetchTeacherClassSubjectTypeContentCount,
} from "@src/store/slices/teacher/subjectTypeContent/thunk"
import { restoreFetch } from "@src/store/slices/teacher/subjectTypeContent/slice"

interface TransformedDictionary {
  [key: string]: string
}
const transformedDictionary: TransformedDictionary = {}
for (const key in subjectTypeDictionary) {
  if (subjectTypeDictionary.hasOwnProperty(key)) {
    const transformedKey = subjectTypeDictionary[key].toLowerCase().replace(/\s+/g, "-")
    transformedDictionary[transformedKey] = key
  }
}
const SubjectTypeContents: React.FC = () => {
  const { classId, subjectId, subjectType } = useParams()
  const key = `${classId}${subjectId}${transformedDictionary[subjectType || ""]}`

  const dispatch = useAppDispatch()
  const { content, status, error } = useAppSelector((state) => state.teacher.subjectTypeContent)

  const mapSubjectTypeContent = (docs: Record<keyof SubjectContent, number>[]) => {
    return Object.entries(docs).map(([key, value], index) => {
      return {
        id: index,
        title: subjectContentDictionary[key],
        subTitle: `Pourcentage: ${value}%`,
        to: subjectContentDictionary[key].toLowerCase().replace(/\s+/g, "-"),
      }
    })
  }

  const data = useMemo(() => {
    if (content && classId && subjectId && subjectType && content[key] && content[key].data) {
      return mapSubjectTypeContent(content[key].data!)
    }
    return []
  }, [content, classId, subjectId, subjectType, mapSubjectTypeContent])

  useEffect(() => {
    if (classId && subjectId && subjectType && (!content || !content[key] || !content[key].data)) {
      dispatch(restoreFetch({ classId, subjectId, subjectType: transformedDictionary[subjectType] }))
      dispatch(fetchTeacherClassSubjectTypeContentCount({ classId, subjectId, subjectType: transformedDictionary[subjectType] })).then(() => {
        dispatch(fetchTeacherClassSubjectTypeContent({ classId, subjectId, subjectType: transformedDictionary[subjectType] }))
      })
    }
  }, [dispatch, classId, subjectId, subjectType])

  if (!classId || !subjectId || !subjectType) {
    return (
      <Error
        status="404"
        title="Paramètres non valides"
        subTitle="Désolé, les paramètres fournis ne sont pas valides."
        button={{ redirect: "/enseignant/classes", text: "Aller au classes" }}
        fullcontainer
      />
    )
  }

  if (!transformedDictionary[subjectType]) {
    return (
      <Error
        status="404"
        title="Type de matière invalide"
        subTitle="Désolé, le type du matière est invalide."
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
        {classId &&
          subjectId &&
          content &&
          content[key] &&
          content[key].className &&
          content[key].subjectName &&
          typeof content[key].className === "string" &&
          typeof content[key].subjectName === "string" && (
            <Breadcrumb
              items={[
                {
                  title: <Link to="/enseignant/classes">Classes</Link>,
                  key: "classes",
                },
                {
                  title: content[key].className,
                  key: "className",
                },
                {
                  title: <Link to={`/enseignant/classes/${classId}`}>Matières</Link>,
                  key: "subjects",
                },
                {
                  title: content[key].subjectName,
                  key: "subjectName",
                },
                {
                  title: <Link to={`/enseignant/classes/${classId}/matières/${subjectId}`}>Contenu</Link>,
                  key: "types",
                },
                {
                  title: subjectTypeDictionary[transformedDictionary[subjectType]],
                  key: "typeName",
                },
              ]}
            />
          )}
      </div>
      <div className="flex flex-col justify-between flex-1">
        {!content || !content[key] || content[key].total === null ? (
          <Spinner fullcontainer />
        ) : (
          <>
            <div className="grid grid-cols-[repeat(12,1fr)] gap-3">
              {(!content[key] || content[key].data === null) && content[key] && content[key].total !== null ? (
                Array.from({ length: content[key].total! }).map((_, index) => <Card key={index} loading={true} title="" />)
              ) : data.length === 0 ? (
                <Empty className="col-span-12" description={<p className="text-slate-gray select-none">Pas de données</p>} />
              ) : (
                data.map((clss, index) => <Card key={index} {...clss} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SubjectTypeContents
