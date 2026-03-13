import React, { useEffect, useRef, useMemo } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import { IDiplomaTypes } from "@src/models/diploma"
import { createDiploma } from "@src/store/slices/administrator/diplomas/thunk"
import { restoreCreate } from "@src/store/slices/administrator/diplomas/slice"
import Spinner from "@src/components/Spinner"
import { MdOutlineSchool } from "react-icons/md"
import { FaRegFileAlt } from "react-icons/fa"

const labelOptions = [
  { key: "Diplôme National d'Ingénieur", value: "Diplôme National d'Ingénieur" },
  { key: "Licence Fondamentale", value: "Licence Fondamentale" },
  { key: "Master Pro", value: "Master Pro" },
  { key: "Master de Recherche", value: "Master de Recherche" },
  { key: "Doctorat", value: "Doctorat" },
]

const initialValues = {
  label: "",
  type: "",
}

const validationSchema = Yup.object().shape({
  label: Yup.string()
    .oneOf(labelOptions.map((o) => o.key))
    .required("Veuillez sélectionner le label du diplôme"),
  type: Yup.string().oneOf(Object.values(IDiplomaTypes)).required("Veuillez sélectionner le type du diplôme"),
})

const CreateDiploma: React.FC<CreateTableItemModalPropTypes> = ({ open, setOpen, page }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.diplomas).create
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
      message.success("Le diplôme a été créé avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  // Dynamically set type options based on label
  const getTypeOptions = (label: string) => {
    if (label === "Diplôme National d'Ingénieur") {
      return [{ key: IDiplomaTypes.Engineering, value: IDiplomaTypes.Engineering }]
    } else if (["Licence Fondamentale", "Master Pro", "Master de Recherche", "Doctorat"].includes(label)) {
      return [{ key: IDiplomaTypes.LMD, value: IDiplomaTypes.LMD }]
    }
    return []
  }

  return (
    <Modal open={open} title="Créer un diplôme" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => dispatch(createDiploma({ label: values.label, type: values.type as IDiplomaTypes, page }))}
        innerRef={formikRef}
      >
        {({ errors, touched, setFieldTouched, setFieldValue, values }) => {
          const typeOptions = getTypeOptions(values.label)
          // If label changes, reset type if not valid
          useEffect(() => {
            if (values.label && typeOptions.length > 0 && !typeOptions.some((opt) => opt.key === values.type)) {
              setFieldValue("type", "")
            }
          }, [values.label])
          return (
            <Form noValidate className="flex flex-col w-full tiny:gap-2 sm:gap-4">
              <Input
                prefixIcon={FaRegFileAlt}
                height="tiny:h-12 sm:h-12"
                type="select"
                name="label"
                touched={touched.label}
                error={errors.label}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                options={labelOptions}
                placeholder="Sélectionner le label"
                label="Label"
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
                disabled={!values.label}
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
          )
        }}
      </Formik>
    </Modal>
  )
}

export default CreateDiploma
