import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { restoreUpdate } from "@src/store/slices/administrator/subjects/slice"
import { MdDriveFileRenameOutline } from "react-icons/md"
import Input from "@src/components/Input"
import { GoNumber } from "react-icons/go"
import { updateSubject } from "@src/store/slices/administrator/subjects/thunk"
import GradingSlider from "../../GradingSlider"
import SubjectContent from "../../SubjectContent"

const validationSchema = Yup.object().shape({
  coefficient: Yup.number()
    .required("Veuillez saisir le coefficient.")
    .min(0, "Le coefficient doit être supérieur ou égal à 0.")
    .max(10, "Le coefficient doit être inférieur ou égal à 10.")
    .typeError("Veuillez saisir un coefficient valide."),
  lecture: Yup.boolean(),
  guidedSession: Yup.boolean(),
  practicalSession: Yup.boolean(),
  supervisedAssessment1: Yup.number().test("sum", "La somme du régime doit être égale à 100.", function (value) {
    const { supervisedAssessment2, practical, exam, other } = this.parent
    const sum = (value || 0) + (supervisedAssessment2 || 0) + (exam || 0) + (other || 0) + (practical || 0)
    return sum === 100
  }),
  supervisedAssessment2: Yup.number().test("sum", "La somme du régime doit être égale à 100.", function (value) {
    const { supervisedAssessment1, practical, exam, other } = this.parent
    const sum = (supervisedAssessment1 || 0) + (value || 0) + (exam || 0) + (other || 0) + (practical || 0)
    return sum === 100
  }),
  exam: Yup.number().test("sum", "La somme du régime doit être égale à 100.", function (value) {
    const { supervisedAssessment1, supervisedAssessment2, practical, other } = this.parent
    const sum = (supervisedAssessment1 || 0) + (supervisedAssessment2 || 0) + (value || 0) + (other || 0) + (practical || 0)
    return sum === 100
  }),
  practical: Yup.number().test("sum", "La somme du régime doit être égale à 100.", function (value) {
    const { supervisedAssessment1, supervisedAssessment2, exam, other } = this.parent
    const sum = (supervisedAssessment1 || 0) + (supervisedAssessment2 || 0) + (value || 0) + (other || 0) + (exam || 0)
    return sum === 100
  }),
  other: Yup.number().test("sum", "La somme du régime doit être égale à 100.", function (value) {
    const { supervisedAssessment1, supervisedAssessment2, practical, exam } = this.parent
    const sum = (supervisedAssessment1 || 0) + (supervisedAssessment2 || 0) + (exam || 0) + (value || 0) + (practical || 0)
    return sum === 100
  }),
})

const UpdateSubject: React.FC<UpdateTableItemModalPropTypes> = ({ open, item, setOpen }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  // Safety check - if item is null, don't render the modal content
  if (!item) {
    return null
  }

  const { status, error } = useAppSelector((state) => state.administrator.subjects).update
  useEffect(() => {
    dispatch(restoreUpdate())
    formikRef.current?.resetForm()
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la mise à jour de la matière. ${error}`)
      console.log("Error while updating subject:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La matière a été mis a jour avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: any) => {
    const { label, coefficient, lecture, guidedSession, practicalSession, supervisedAssessment1, supervisedAssessment2, practical, exam, other } =
      values

    if (
      label === item.subject &&
      coefficient === item.coefficient &&
      lecture === item.lecture &&
      guidedSession === item.guidedSession &&
      practicalSession === item.practicalSession &&
      supervisedAssessment1 === item.supervisedAssessment1 &&
      supervisedAssessment2 === item.supervisedAssessment2 &&
      practical === item.practical &&
      exam === item.exam &&
      other === item.other
    )
      return message.error("Vous n'avez apporté aucune modification.")

    const queryData = {
      id: item.id,
      label,
      coefficient,
      lecture,
      guidedSession,
      practicalSession,
      ...(supervisedAssessment1 !== 0 && { supervisedAssessment1 }),
      ...(supervisedAssessment2 !== 0 && { supervisedAssessment2 }),
      ...(practical !== 0 && { practical }),
      ...(exam !== 0 && { exam }),
      ...(other !== 0 && { other }),
    }
    dispatch(updateSubject(queryData))
  }

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <Modal open={open} title="Mettre à jour une matière" closeModal={closeModal} destroyOnClose>
      <Formik
        enableReinitialize={true}
        initialValues={{
          label: item.subject as string,
          coefficient: item.coefficient as string,
          lecture: item.lecture as boolean,
          guidedSession: item.guidedSession as boolean,
          practicalSession: item.practicalSession as boolean,
          supervisedAssessment1: item.supervisedAssessment1 as number,
          supervisedAssessment2: item.supervisedAssessment2 as number,
          practical: item.practical as number,
          exam: item.exam as number,
          other: item.other as number,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="login-form flex flex-col w-full gap-3">
            <div className="flex flex-col gap-1">
              <Input
                prefixIcon={MdDriveFileRenameOutline}
                height="h-10"
                touched={touched.label}
                error={errors.label}
                type="text"
                name="label"
                label="Nom du matière"
                placeholder="Entrez le nom du matière"
              />
              <Input
                prefixIcon={GoNumber}
                height="h-10"
                touched={touched.coefficient}
                error={errors.coefficient}
                type="number"
                name="coefficient"
                label="Coefficient du matière"
                placeholder="Entrez le coefficient du matière"
              />
              <div className="flex flex-col flex-1 mb-5">
                <div className={`flex flex-col tiny:gap-1 lg:gap-3`}>
                  <div className="text-slate-gray tiny:text-xs sm:text-base font-medium select-none">
                    <div className="flex gap-1">
                      <p className="text-[0.8rem]">Contenu</p>
                    </div>
                  </div>
                  <div className={`flex flex-col rounded-lg box-border px-3 border-2 py-2 border-dark-blue`}>
                    <SubjectContent
                      label="Cours"
                      name="lecture"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.lecture}
                    />
                    <SubjectContent
                      label="Travaux dirigés"
                      name="guidedSession"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.guidedSession}
                    />
                    <SubjectContent
                      label="Travaux pratiques"
                      name="practicalSession"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.practicalSession}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <div className={`flex flex-col tiny:gap-1 lg:gap-3`}>
                  <div className="text-slate-gray tiny:text-xs sm:text-base font-medium select-none">
                    <div className="flex gap-1">
                      <p className="text-[0.8rem]">Régime</p>
                    </div>
                  </div>
                  <div
                    className={`flex flex-col rounded-lg box-border px-3 border-2 py-2 ${
                      (errors.supervisedAssessment1 || errors.supervisedAssessment2 || errors.exam || errors.other) &&
                      (touched.supervisedAssessment1 || touched.supervisedAssessment2 || touched.exam || touched.other)
                        ? "border-red-500"
                        : "border-dark-blue"
                    }`}
                  >
                    <GradingSlider
                      label="DS1"
                      name="supervisedAssessment1"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.supervisedAssessment1 > 0}
                      defaultValue={values.supervisedAssessment1}
                    />
                    <GradingSlider
                      label="DS2"
                      name="supervisedAssessment2"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.supervisedAssessment2 > 0}
                      defaultValue={values.supervisedAssessment2}
                    />
                    <GradingSlider
                      label="TP"
                      name="practical"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.practical > 0}
                      defaultValue={values.practical}
                    />
                    <GradingSlider
                      label="Examen"
                      name="exam"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.exam > 0}
                      defaultValue={values.exam}
                    />
                    <GradingSlider
                      label="Autre"
                      name="other"
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      defaultChecked={values.other > 0}
                      defaultValue={values.other}
                    />
                  </div>
                </div>
                <p
                  className={`${
                    (errors.supervisedAssessment1 || errors.supervisedAssessment2 || errors.exam || errors.other) &&
                    (touched.supervisedAssessment1 || touched.supervisedAssessment2 || touched.exam || touched.other)
                      ? "block"
                      : "invisible"
                  } text-red-500 font-bold select-none text-[0.8rem]`}
                >
                  La somme du régime doit être égale à 100.
                </p>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <button
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                type="submit"
                disabled={loading}
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Mettre à jour</p>
                {loading && <Spinner className="white hover dark-blue" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default UpdateSubject
