import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import { createUnit } from "@src/store/slices/administrator/units/thunk"
import { restoreCreate } from "@src/store/slices/administrator/units/slice"
import Spinner from "@src/components/Spinner"
import { FaRegFileAlt } from "react-icons/fa"
import CurriculumAsyncSelect from "../../CurriculumAsyncSelect"

const initialValues = {
  label: "",
  curriculum: "",
}

const validationSchema = Yup.object().shape({
  label: Yup.string().min(3, "Le label doit contenir au moins 3 caractères").max(100, "Le label ne peut pas dépasser 100 caractères").required("Veuillez saisir le label de l'unité"),
  curriculum: Yup.string().required("Veuillez sélectionner le cursus"),
})

const CreateUnit: React.FC<CreateTableItemModalPropTypes> = ({ open, setOpen, page }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.units).create
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
      message.success("L'unité a été créée avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  return (
    <Modal open={open} title="Créer une unité" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => dispatch(createUnit({ label: values.label, level: values.curriculum, page }))}
        innerRef={formikRef}
      >
        {({ errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="flex flex-col w-full tiny:gap-2 sm:gap-4">
            <Input
              prefixIcon={FaRegFileAlt}
              height="tiny:h-12 sm:h-12"
              type="text"
              name="label"
              touched={touched.label}
              error={errors.label}
              setFieldTouched={setFieldTouched}
              placeholder="Saisir le label de l'unité"
              label="Label"
            />

            <CurriculumAsyncSelect
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              touched={touched.curriculum}
              error={errors.curriculum}
            />

            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Créer</p>
                {loading && <Spinner />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateUnit
