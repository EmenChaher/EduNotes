import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import { TeachingType, teachingTypeDictionary } from "@src/models/teaching"
import { MdMergeType } from "react-icons/md"
import { createTeaching } from "@src/store/slices/administrator/teachings/thunk"
import { restoreCreate } from "@src/store/slices/administrator/teachings/slice"
import Spinner from "@src/components/Spinner"
import ClassAsyncSelect from "@features/Administrator/Teachings/ClassAsyncSelect"
import TeacherAsyncSelect from "@features/Administrator/Teachings/TeacherAsyncSelect"
import SubjectAsyncSelect from "@features/Administrator/Teachings/SubjectAsyncSelect"

const initialValues = {
  clss: "",
  subject: "",
  type: "",
  teacher: "",
}

const validationSchema = Yup.object().shape({
  clss: Yup.string().required("Veuillez sélectionner la classe"),
  subject: Yup.string().required("Veuillez sélectionner la matière"),
  type: Yup.string().oneOf(Object.values(TeachingType)).required("Veuillez sélectionner le type"),
  teacher: Yup.string().required("Veuillez sélectionner l'enseignant"),
})

const typeOptions = Object.values(TeachingType).map((type) => ({
  key: type,
  value: teachingTypeDictionary[type],
}))

const CreateTeaching: React.FC<CreateTableItemModalPropTypes> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.teachings).create
  const loading = status === "loading"

  useEffect(() => {
    if (open) {
      dispatch(restoreCreate())
      formikRef.current?.resetForm()
    }
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec de la création : ${error}`)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("L'enseignement a été créé avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: typeof initialValues) => {
    dispatch(
      createTeaching({
        clss: values.clss,
        teacher: values.teacher,
        subject: values.subject,
        type: values.type as TeachingType,
        page: 1,
      }),
    )
  }

  return (
    <Modal open={open} title="Créer un enseignement" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} innerRef={formikRef}>
        {({ errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="flex flex-col w-full tiny:gap-2 sm:gap-4">
            <ClassAsyncSelect setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} error={errors.clss} touched={touched.clss} />

            <SubjectAsyncSelect setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} error={errors.subject} touched={touched.subject} />

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

            <TeacherAsyncSelect setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} error={errors.teacher} touched={touched.teacher} />

            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Créer</p>
                {loading && <Spinner className="text-white group-hover:text-dark-blue" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateTeaching
