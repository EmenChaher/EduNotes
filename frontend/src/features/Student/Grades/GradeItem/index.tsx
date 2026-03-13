import { subjectContentDictionary } from "@src/models/subject"
import { VscSearchStop } from "react-icons/vsc"
import { PiFlagBannerBold } from "react-icons/pi"
import { Popconfirm, Tooltip, message } from "antd"
import axiosInstance from "@src/utils/axios"
import { useState } from "react"
import Spinner from "@src/components/Spinner"

interface Grading {
  type: string
  pourcentage: number
}

interface IGradeItem {
  _id: string
  grading: Grading
  grade_count?: number
  max_grade?: number
  min_grade?: number
  class_average?: number
  grade?: number | "ABS" | "DISP"
  rank?: number
  createdAt?: string
  updatedAt?: string
}

const getColorForValue = (value: number, min: number = 0, max: number = 20): string => {
  const clampedValue = Math.max(min, Math.min(max, value))
  const normalized = (clampedValue - min) / (max - min)
  const r = Math.floor((1 - normalized) * 255)
  const g = Math.floor(normalized * 255)
  return `rgb(${r}, ${g}, 0)`
}

type FormatFractionProps = {
  numerator: number | "ABS" | "DISP"
  denominator: number
  reversed?: boolean
  isStudentGrade?: boolean
}

const formatFraction: React.FC<FormatFractionProps> = ({ numerator, denominator, reversed = false, isStudentGrade = false }) => {
  let classnameColor = "text-dark-blue"

  if (numerator === "ABS") {
    classnameColor = "text-red-500"
  } else if (numerator === "DISP") {
    classnameColor = "text-yellow-500"
  }

  let style: React.CSSProperties = {}

  if (typeof numerator === "number") {
    style.color = !reversed ? getColorForValue(numerator, 0, denominator) : getColorForValue(denominator - numerator + 1, 1, denominator)
  }

  const className = `min-w-10 flex items-baseline justify-end ${classnameColor}`

  let displayText: React.ReactNode

  if (numerator === "DISP") {
    displayText = "Dispensé"
  } else if (numerator === "ABS") {
    displayText = "Absent"
  } else {
    displayText = numerator
  }

  return (
    <div className={className} style={style}>
      <p className={`${!isStudentGrade ? "text-lg" : "text-2xl"}`}>{displayText}</p>
      {!(numerator === "ABS" || numerator === "DISP") && <p className="text-xs font-normal">/{denominator}</p>}
    </div>
  )
}

const GradeItem: React.FC<IGradeItem> = ({ _id, grading, grade_count, max_grade, min_grade, class_average, grade, rank, createdAt, updatedAt }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const hasData =
    grade !== undefined &&
    createdAt &&
    updatedAt &&
    rank !== undefined &&
    grade_count !== undefined &&
    max_grade !== undefined &&
    min_grade !== undefined &&
    class_average !== undefined

  if (!hasData) {
    return (
      <div className="h-full flex xl:flex-row xl:gap-0 tiny:flex-col tiny:gap-1 flex-1 min-w-full w-max border-l-4 border-dark-blue shadow-[0px_0px_18px_0px_#D2D1D199] rounded-md px-3 justify-between">
        <div className="flex justify-between flex-1">
          <div className="flex min-w-32 justify-center flex-col py-1">
            <p className="text-slate-gray text-2xl font-semibold ">{subjectContentDictionary[grading.type]}</p>
          </div>
          <div className="flex gap-2 flex-1 text-gray-300 items-center justify-center select-none hover:cursor-not-allowed">
            <VscSearchStop className="size-8 fill-gray-300" />
            <p>Pas de données</p>
          </div>
        </div>
      </div>
    )
  }

  const flagGrade = async (id: string) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post(`/student/grade/flag/${id}`)

      if (response.status === 200) {
        message.success("Une erreur de note a été réclamée avec succès.")
        return
      }
    } catch (err: any) {
      console.log("Failed to flag grade.", err.response?.data?.message)
      return message.error("Impossible de réclamer une erreur. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const gradeExtraData = [
    { label: "Rang", value: rank, max: grade_count, reversed: true },
    { label: "Min note", value: min_grade, max: 20 },
    { label: "Max note", value: max_grade, max: 20 },
    { label: "Moyenne de classe", value: Number(class_average.toFixed(2)), max: 20 },
  ]

  const createdDate = new Date(createdAt)
  const updatedDate = new Date(updatedAt)
  const isUpdated = updatedDate > createdDate
  const formattedDate = isUpdated ? updatedDate.toLocaleDateString() : createdDate.toLocaleDateString()

  return (
    <>
      {loading && <Spinner fullscreen />}
      <div className=" py-2 h-full flex xl:flex-row xl:gap-0 tiny:flex-col tiny:gap-1 flex-1 min-w-full w-max border-l-4 border-dark-blue shadow-[0px_0px_18px_0px_#D2D1D199] rounded-md px-3 justify-between">
        <>
          <div className="flex justify-between">
            <div className="flex min-w-52 justify-between flex-col py-1">
              <p className="text-slate-gray text-xl font-semibold">{subjectContentDictionary[grading.type]}</p>
              <p className="text-[#B5B5B5] text-sm font-light"> {isUpdated ? `Mis à jour le ${formattedDate}` : `Ajouté le ${formattedDate}`}</p>
            </div>
            <div className="flex items-center justify-around min-w-40 gap-2">
              {_id && (
                <Tooltip title="Réclamer" arrow={false} className="hover:cursor-pointer">
                  <Popconfirm
                    title="Réclamer cette note?"
                    onConfirm={() => {
                      flagGrade(_id)
                    }}
                  >
                    <PiFlagBannerBold className="size-6 fill-danger-red" />
                  </Popconfirm>
                </Tooltip>
              )}

              {formatFraction({ numerator: grade, denominator: 20, isStudentGrade: true })}
            </div>
          </div>
          {gradeExtraData.map(({ label, value, max, reversed }) => (
            <div
              key={label}
              className={`flex tiny:flex-row xl:flex-col tiny:justify-between xl:justify-around items-center min-w-28 h-full ${label === "Rang" && (grade === "ABS" || grade === "DISP") ? "tiny:hidden xl:invisible xl:flex" : ""}`}
            >
              <p className="text-sky-blue">{label}</p>
              {formatFraction({ numerator: value, denominator: max, reversed })}
            </div>
          ))}
        </>
      </div>
    </>
  )
}

export default GradeItem
