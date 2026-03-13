import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { updateUnit } from "@src/store/slices/administrator/units/thunk"
import { restoreUpdate } from "@src/store/slices/administrator/units/slice"
import Spinner from "@src/components/Spinner"
import { FaRegFileAlt } from "react-icons/fa"

const validationSchema = Yup.object().shape({
  label: Yup.string().min(3, "Le label doit contenir au moins 3 caractères").max(100, "Le label ne peut pas dépasser 100 caractères").required("Veuillez saisir le label de l'unité"),
})

const UpdateUnit: React.FC<UpdateTableItemModalPropTypes> = ({ open, setOpen, item }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.units).update
  const loading = status === "loading"

  const initialValues = {
    label: item?.label || "",
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
      message.success("L'unité a été modifiée avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  return (
    <Modal open={open} title="Modifier l'unité" closeModal={() => setOpen(false)} destroyOnClose>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => dispatch(updateUnit({ id: item.id, label: values.label }))}
        innerRef={formikRef}
        enableReinitialize
      >
        {({ errors, touched, setFieldTouched }) => (
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

export default UpdateUnit
