import React, { useEffect, useMemo, useRef, useState } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import { restoreCreate } from "@src/store/slices/administrator/subjects/slice"
import { MdDriveFileRenameOutline } from "react-icons/md"
import Input from "@src/components/Input"
import axiosInstance from "@src/utils/axios"
import { flattenPaginatedData } from "@src/utils/paginations"
import { IDiplomaTypes } from "@src/models/diploma"
import CurriculumAsyncSelect from "../../CurriculumAsyncSelect"
import { IUnit } from "@src/models/unit"
import { PiPathBold } from "react-icons/pi"
import { GoNumber } from "react-icons/go"
import { createSubject } from "@src/store/slices/administrator/subjects/thunk"
import GradingSlider from "../../GradingSlider"
import SubjectContent from "../../SubjectContent"

const initialValues = {
  curriculum: "",
  label: "",
  unit: "",
  coefficient: "",
  lecture: true,
  guidedSession: true,
  practicalSession: true,
  supervisedAssessment1: 0,
  supervisedAssessment2: 0,
  practical: 0,
  exam: 0,
  other: 0,
}

const validationSchema = Yup.object().shape({
  curriculum: Yup.string().required("Veuillez sélectionner le cursus."),
  label: Yup.string()
    .required("Veuillez saisir le nom de la matière.")
    .min(3, "Le nom de la matière doit comporter au moins 3 caractères.")
    .max(50, "Le nom de la matière ne doit pas dépasser 50 caractères."),
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

const CreateSubject: React.FC<CreateTableItemModalPropTypes> = ({ open, page, setOpen }) => {
  const dispatch = useAppDispatch()
  const [levelUnits, setLevelUnits] = useState<any>(null)
  const [levelUnitsLoading, setLevelUnitsLoading] = useState<any>(null)
  const formikRef = useRef<any>(null)

  const { levels } = useAppSelector((state) => state.administrator.levels)
  const { status, error } = useAppSelector((state) => state.administrator.subjects).create
  useEffect(() => {
    dispatch(restoreCreate())
    setLevelUnits(null)
    formikRef.current?.resetForm()
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de l'ajout de la matière. ${error}`)
      console.log("Error while adding subject:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La matière a été ajouté avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: any) => {
    const {
      label,
      curriculum,
      unit,
      coefficient,
      lecture,
      guidedSession,
      practicalSession,
      supervisedAssessment1,
      supervisedAssessment2,
      practical,
      exam,
      other,
    } = values

    const queryData = {
      label,
      level: curriculum,
      unit,
      coefficient,
      lecture,
      guidedSession,
      practicalSession,
      page,
      ...(supervisedAssessment1 !== 0 && { supervisedAssessment1 }),
      ...(supervisedAssessment2 !== 0 && { supervisedAssessment2 }),
      ...(exam !== 0 && { exam }),
      ...(practical !== 0 && { practical }),
      ...(other !== 0 && { other }),
    }
    if (levels) {
      const flattenedLevels = flattenPaginatedData(levels)
      const filteredLevel = flattenedLevels.filter((level) => {
        return level._id === curriculum
      })
      if (filteredLevel && filteredLevel[0] && filteredLevel[0]?.studyField?.diploma?.type === IDiplomaTypes.LMD) {
        if (unit === "") {
          return message.error("Veuillez selectionner une unité.")
        } else {
          delete queryData.level
        }
      } else {
        delete queryData.unit
      }
    }
    dispatch(createSubject(queryData))
  }

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const levelUnitsData = useMemo(() => {
    if (!levelUnits) return []
    return levelUnits.map((unit: IUnit) => ({
      key: unit._id,
      value: `${unit.label}`,
    }))
  }, [levelUnits])

  const onCurriculumSelectChange = (
    key: string,
    setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    setFieldTouched("unit", false)
    setFieldValue("unit", "")
    setLevelUnits(null)
    if (levels) {
      const flattenedLevels = flattenPaginatedData(levels)
      const filteredLevel = flattenedLevels.filter((level) => {
        return level._id === key
      })
      if (filteredLevel && filteredLevel[0] && filteredLevel[0]?.studyField?.diploma?.type === IDiplomaTypes.LMD) {
        setLevelUnitsLoading(true)
        axiosInstance
          .get(`/administrator/levelUnits/${key}`)
          .then((response) => {
            setLevelUnits(response?.data?.data)
          })
          .catch((error) => {
            console.error("Error fetching level units:", error)
          })
          .finally(() => {
            setLevelUnitsLoading(false)
          })
      }
    }
  }

  return (
    <Modal open={open} title="Ajouter une matière" closeModal={closeModal} destroyOnClose maskClosable={false}>
      {levelUnitsLoading && <Spinner fullscreen />}
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="login-form flex flex-col w-full gap-3">
            <div className="flex flex-col gap-1">
              <CurriculumAsyncSelect
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                error={errors.curriculum}
                touched={touched.curriculum}
                onChange={(key) => {
                  onCurriculumSelectChange(key, setFieldTouched, setFieldValue)
                }}
              />
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
              {levelUnits && (
                <Input
                  prefixIcon={PiPathBold}
                  height="h-10"
                  touched={touched.unit}
                  error={errors.unit}
                  type="select"
                  setFieldTouched={setFieldTouched}
                  setFieldValue={setFieldValue}
                  options={levelUnitsData}
                  name="unit"
                  label="Unité"
                  placeholder="Selectionner l'unité"
                />
              )}

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
                      defaultChecked
                    />
                    <GradingSlider label="DS2" name="supervisedAssessment2" setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} />
                    <GradingSlider label="TP" name="practical" setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} defaultChecked />
                    <GradingSlider label="Examen" name="exam" setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} defaultChecked />
                    <GradingSlider label="Autre" name="other" setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} />
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
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Ajouter</p>
                {loading && <Spinner className="white hover dark-blue" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateSubject
