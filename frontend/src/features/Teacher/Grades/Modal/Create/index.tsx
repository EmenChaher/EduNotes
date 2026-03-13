import Modal from "@src/components/Modal"
import { InputNumber, message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import { useEffect, useRef, useState } from "react"
import AbsentLogo from "@assets/images/grade/absent.svg?react"
import ExemptLogo from "@assets/images/grade/exempt.svg?react"
import { createGrade } from "@src/store/slices/teacher/grades/thunk"
import { transformedSubjectTypeContentDictionary, transformedSubjectTypeDictionary } from "@src/models/subject"
import { useParams } from "react-router-dom"
import Spinner from "@src/components/Spinner"
import { Form, Formik } from "formik"
import Input from "@src/components/Input"
import { HiIdentification } from "react-icons/hi"
import * as Yup from "yup"
import { restoreCreate } from "@src/store/slices/teacher/grades/slice"

const initialValues = {
  cin: "",
}

const validationSchema = Yup.object().shape({
  cin: Yup.string()
    .required("Veuillez saisir le numéro de CIN.")
    .matches(/^\d{8}$/, "Veuillez saisir un numéro de CIN valide."),
})

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

interface ICreateGrade {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  report: string
}

const CreateGrade: React.FC<ICreateGrade> = ({ open, setOpen, report }) => {
  const { status, error } = useAppSelector((state) => state.teacher.grades.create)
  const { classId, subjectId, subjectType, subjectContent } = useParams()
  const [gradeValue, setGradeValue] = useState<number | "DISP" | "ABS">(0)
  const [gradeNumericalValue, setGradeNumericalValue] = useState<number | "--">("--")
  const formikRef = useRef<any>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restoreCreate())
  }, [open, dispatch])

  useEffect(() => {
    setGradeValue(0)
    setGradeNumericalValue("--")
  }, [open])

  useEffect(() => {
    if (error) {
      let errorMessage = "Échec lors de la creation du note. Veuillez réessayer."
      const userNotStudentRegex = /^User with CIN '\d+' is not a student\.$/
      if (userNotStudentRegex.test(error))
        errorMessage = "Échec lors de la creation du note. L'utilisateur avec le CIN spécifié n'est pas un étudiant."
      message.error(errorMessage)
      console.log("Error while creating grade:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La note a ajouté avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = (values: any) => {
    let newValue: number | "ABS" | "DISP" | undefined = undefined
    if (gradeValue === "DISP" || gradeValue === "ABS") {
      newValue = gradeValue
    } else if (gradeNumericalValue !== "--") {
      newValue = gradeNumericalValue
    }
    if (!newValue) {
      return message.error("Vous devez saisir une note.")
    }
    const { cin } = values

    console.log(newValue)
    dispatch(
      createGrade({
        classId: classId!,
        subjectId: subjectId!,
        subjectType: transformedSubjectTypeDictionary[subjectType!],
        subjectContent: transformedSubjectTypeContentDictionary[subjectContent!],
        report,
        cin,
        value: newValue,
      }),
    )
  }

  const loading = status === "loading"

  return (
    <Modal open={open} title="Ajouter une note" closeModal={closeModal} destroyOnClose>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ errors, touched }) => (
          <Form noValidate className="login-form flex flex-col w-full tiny:gap-2 sm:gap-4">
            <Input
              prefixIcon={HiIdentification}
              height="tiny:h-10 sm:h-14"
              touched={touched.cin}
              error={errors.cin}
              type="text"
              name="cin"
              label="CIN"
              placeholder="Entrez le CIN de l'etudiant"
            />

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
                  className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                  type="submit"
                  disabled={loading}
                >
                  <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Ajouter</p>
                  {loading && <Spinner className="white hover dark-blue" />}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateGrade
