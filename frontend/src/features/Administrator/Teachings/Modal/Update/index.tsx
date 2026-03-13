import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { TeachingType } from "@src/models/teaching"
import { MdMergeType } from "react-icons/md"
import { updateTeaching } from "@src/store/slices/administrator/teachings/thunk"
import { restoreUpdate } from "@src/store/slices/administrator/teachings/slice"
import Spinner from "@src/components/Spinner"
import ClassAsyncSelect from "../../ClassAsyncSelect"
import TeacherAsyncSelect from "../../TeacherAsyncSelect"
import SubjectAsyncSelect from "../../SubjectAsyncSelect"

const validationSchema = Yup.object().shape({
  clss: Yup.string().required("Veuillez sélectionner la classe"),
  subject: Yup.string().required("Veuillez sélectionner la matière"),
  type: Yup.string().oneOf(Object.values(TeachingType)).required("Veuillez sélectionner le type"),
  teacher: Yup.string().required("Veuillez sélectionner l'enseignant"),
})

const typeOptions = [
  { key: TeachingType.Lecture, value: "Cours" },
  { key: TeachingType.GuidedSession, value: "TD" },
  { key: TeachingType.PracticalSession, value: "TP" },
]

const UpdateTeaching: React.FC<UpdateTableItemModalPropTypes> = ({ open, setOpen, item }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.teachings).update
  const loading = status === "loading"

  const initialValues = {
    clss: item.class._id,
    subject: item.subject._id,
    type: item.type,
    teacher: item.teacher._id,
  }

  useEffect(() => {
    if (open) {
      dispatch(restoreUpdate())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec de la modification : ${error}`)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("L'enseignement a été modifié avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: typeof initialValues) => {
    // Compare values to initialValues and only include changed fields
    const query: { clss?: string; teacher?: string; subject?: string; type?: TeachingType } = {}

    if (values.clss !== initialValues.clss) {
      query.clss = values.clss
    }

    if (values.teacher !== initialValues.teacher) {
      query.teacher = values.teacher
    }

    if (values.subject !== initialValues.subject) {
      query.subject = values.subject
    }

    if (values.type !== initialValues.type) {
      query.type = values.type as TeachingType
    }

    // Only dispatch if there are changes
    if (Object.keys(query).length > 0) {
      dispatch(updateTeaching({ id: item.id, query }))
    } else {
      message.info("Aucune modification n'a été détectée.")
    }
  }

  return (
    <Modal open={open} title="Modifier l'enseignement" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} innerRef={formikRef}>
        {({ errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="flex flex-col w-full tiny:gap-2 sm:gap-4">
            <ClassAsyncSelect
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              error={errors.clss}
              touched={touched.clss}
              defaultValue={initialValues.clss}
            />

            <SubjectAsyncSelect
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              error={errors.subject}
              touched={touched.subject}
              defaultValue={initialValues.subject}
            />

            <Input
              prefixIcon={MdMergeType}
              height="tiny:h-12 sm:h-12"
              type="select"
              name="type"
              touched={touched.type}
              error={errors.type}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              options={typeOptions}
              placeholder="Sélectionner le type"
              label="Type d'enseignement"
            />

            <TeacherAsyncSelect
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              error={errors.teacher}
              touched={touched.teacher}
              defaultValue={initialValues.teacher}
            />

            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Modifier</p>
                {loading && <Spinner className="text-white group-hover:text-dark-blue" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default UpdateTeaching
