import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { IDiplomaTypes } from "@src/models/diploma"
import { updateDiploma } from "@src/store/slices/administrator/diplomas/thunk"
import { restoreUpdate } from "@src/store/slices/administrator/diplomas/slice"
import Spinner from "@src/components/Spinner"
import { MdOutlineSchool } from "react-icons/md"
import { FaRegFileAlt } from "react-icons/fa"

const validationSchema = Yup.object().shape({
  label: Yup.string().required("Veuillez entrer le nom du diplôme"),
  type: Yup.string().oneOf(Object.values(IDiplomaTypes)).required("Veuillez sélectionner le type du diplôme"),
})

const typeOptions = Object.values(IDiplomaTypes).map((type) => ({
  key: type,
  value: type,
}))

const UpdateDiploma: React.FC<UpdateTableItemModalPropTypes> = ({ open, setOpen, item }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.diplomas).update
  const loading = status === "loading"

  const initialValues = {
    label: item.label,
    type: item.type,
  }

  useEffect(() => {
    if (open) {
      dispatch(restoreUpdate())
      formikRef.current?.resetForm()
    }
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec de la modification : ${error}`)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("Le diplôme a été modifié avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: typeof initialValues) => {
    // Only dispatch if there are changes
    if (values.label === initialValues.label && values.type === initialValues.type) {
      message.info("Aucune modification n'a été détectée.")
      return
    }
    dispatch(updateDiploma({ id: item.id, label: values.label, type: values.type as IDiplomaTypes }))
  }

  return (
    <Modal open={open} title="Modifier le diplôme" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
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
              setFieldValue={setFieldValue}
              placeholder="Nom du diplôme"
              label="Nom"
            />

            <Input
              prefixIcon={MdOutlineSchool}
              height="tiny:h-12 sm:h-12"
              type="select"
              name="type"
              touched={touched.type}
              error={errors.type}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue}
              options={typeOptions}
              placeholder="Sélectionner le type"
              label="Type"
            />

            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Modifier</p>
                {loading && <Spinner />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default UpdateDiploma 