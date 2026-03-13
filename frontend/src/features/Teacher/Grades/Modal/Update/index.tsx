import Modal from "@src/components/Modal"
import { InputNumber, message } from "antd"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { useAppDispatch, useAppSelector } from "@src/store"
import { useEffect, useRef, useState } from "react"
import { restoreUpdate } from "@src/store/slices/teacher/grades/slice"
import AbsentLogo from "@assets/images/grade/absent.svg?react"
import ExemptLogo from "@assets/images/grade/exempt.svg?react"
import { updateGrade } from "@src/store/slices/teacher/grades/thunk"
import { transformedSubjectTypeContentDictionary, transformedSubjectTypeDictionary } from "@src/models/subject"
import { useParams } from "react-router-dom"
import Spinner from "@src/components/Spinner"

interface EditableGradeProps {
  gradeValue: any
  setGradeValue: React.Dispatch<React.SetStateAction<number | "--">>
}

const EditableGrade: React.FC<React.PropsWithChildren<EditableGradeProps>> = ({ gradeValue, setGradeValue }) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>(null)
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    if (!editing && gradeValue == "--") setGradeValue(0)
    setEditing(!editing)
  }

  const save = async () => {
    try {
      toggleEdit()

      let newValue = 0
      const inputValue = inputRef.current?.value
      if (!isNaN(inputValue)) {
        newValue = inputValue
      }
      if (inputValue === "" || inputValue === undefined) {
        newValue = 0
      }
      newValue = Math.round(newValue * 4) / 4

      if (newValue < 0) {
        newValue = 0
      } else if (newValue > 20) {
        newValue = 20
      }

      setGradeValue(newValue)
    } catch (errInfo) {
      console.log("Save failed:", errInfo)
    }
  }
  return (
    <div className={`p-1 box-border rounded-md flex justify-center items-center gap-2 transition-[width] duration-200}`}>
      {!editing ? (
        <div className="text-dark-blue flex items-center text-base font-medium" onClick={toggleEdit}>
          {gradeValue}
        </div>
      ) : (
        <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} step={0.25} min={0} max={20} defaultValue={gradeValue} className="w-16" />
      )}
    </div>
  )
}

const UpdateGrade: React.FC<UpdateTableItemModalPropTypes> = ({ open, item, setOpen }) => {
  const { status, error } = useAppSelector((state) => state.teacher.grades.update)
  const { classId, subjectId, subjectType, subjectContent } = useParams()
  const [gradeValue, setGradeValue] = useState<number | "DISP" | "ABS">(item.grade)
  const [gradeNumericalValue, setGradeNumericalValue] = useState<number | "--">("--")
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restoreUpdate())
  }, [open, dispatch])

  useEffect(() => {
    setGradeValue(item.grade)
    setGradeNumericalValue(typeof item.grade === "number" && !isNaN(item.grade) ? item.grade : "--")
  }, [item, open])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la mise à jour du note. Veuillez réessayer.`)
      console.log("Error while updating gradeValue:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("Le note a été mis à jour avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = () => {
    let newValue: number | "ABS" | "DISP" = 0
    if (gradeValue === "DISP" || gradeValue === "ABS") newValue = gradeValue
    else if (gradeNumericalValue !== "--") newValue = gradeNumericalValue
    console.log(newValue)

    if (newValue === item.grade) return message.error("Vous n'avez apporté aucune modification.")
    dispatch(
      updateGrade({
        gradeId: item.id,
        classId: classId!,
        subjectId: subjectId!,
        subjectType: transformedSubjectTypeDictionary[subjectType!],
        subjectContent: transformedSubjectTypeContentDictionary[subjectContent!],
        newValue,
      }),
    )
  }

  const loading = status === "loading"

  return (
    <Modal open={open} title="Corriger note" closeModal={closeModal} destroyOnClose>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center flex-col gap-4">
            <p className="font-normal text-base text-[#959595]">Accorder une note</p>
            <div
              onClick={() => {
                setGradeValue(0)
              }}
              className={` bg-dark-blue bg-opacity-15 w-44 py-3 rounded-lg border-2 hover:cursor-pointer ${typeof gradeValue === "number" && !isNaN(gradeValue) ? "border-dashed border-dark-blue" : ""}`}
            >
              <div className="flex justify-center items-center h-8">
                <EditableGrade gradeValue={gradeNumericalValue} setGradeValue={setGradeNumericalValue} />
                <p className="text-dark-blue text-base font-medium">/20</p>
              </div>
            </div>
          </div>
          <hr className="bg-[#959595] bg-opacity-50 w-full h-[2px]" />
          <div className="flex flex-col justify-between w-full items-center gap-4">
            <p className="font-normal text-base text-[#959595]">Marquer comme</p>
            <div className="flex  justify-around w-full">
              <div
                onClick={() => {
                  setGradeValue("ABS")
                }}
                className={`flex flex-col justify-center items-center bg-red-500 bg-opacity-15 w-44 h-20 rounded-lg hover:cursor-pointer hover:-translate-y-0.5 hover:shadow-lg border-2 ${gradeValue === "ABS" ? "border-dashed border-red-500" : ""}`}
              >
                <AbsentLogo className="size-8 text-red-500" />
                <p className="text-red-500 text-base font-medium">Absent</p>
              </div>
              <p className="text-xl font-semibold text-dark-blue self-center">ou</p>
              <div
                onClick={() => {
                  setGradeValue("DISP")
                }}
                className={`flex flex-col justify-center items-center bg-yellow-500 bg-opacity-15 w-44 h-20 rounded-lg hover:cursor-pointer hover:-translate-y-0.5 hover:shadow-lg border-2 ${gradeValue === "DISP" ? "border-dashed border-yellow-500" : ""}`}
              >
                <ExemptLogo className="size-8 text-yellow-500" />
                <p className="text-yellow-500 text-base font-medium">Dispensé</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={handleSubmit}
            className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
            type="submit"
            disabled={loading}
          >
            <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Mettre à jour</p>
            {loading && <Spinner className="white hover dark-blue" />}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UpdateGrade
