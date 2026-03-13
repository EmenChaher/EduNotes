import React, { useEffect, useRef } from "react"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import StudyFieldAsyncSelect from "../../StudyFieldAsyncSelect"
import { updateLevel } from "@src/store/slices/administrator/levels/thunk"
import { restoreUpdate } from "@src/store/slices/administrator/levels/slice"

const validationSchema = Yup.object().shape({
  studyField: Yup.string().required("Veuillez sélectionner la filière."),
})

const UpdateLevel: React.FC<UpdateTableItemModalPropTypes> = ({ open, setOpen, item }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)
  const { status, error } = useAppSelector((state) => state.administrator.levels).update
  
  useEffect(() => {
    dispatch(restoreUpdate())
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la mise à jour du niveau : ${error}`)
      console.log("Error while updating level:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("Le niveau a été mis à jour avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const initialValues = {
    studyField: item.studyField._id,
  }

  const handleSubmit = (values: any) => {
    const { studyField } = values
    dispatch(updateLevel({ 
      id: item.id, 
      studyField, 
      page: 1  // You might want to pass the current page from props
    }))
  }

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <Modal open={open} title="Modifier un niveau" closeModal={closeModal} destroyOnClose>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ errors, touched, setFieldTouched, setFieldValue }) => {
          return (
            <Form noValidate className="login-form flex flex-col w-full tiny:gap-2 sm:gap-4">
              <StudyFieldAsyncSelect 
                setFieldTouched={setFieldTouched} 
                setFieldValue={setFieldValue} 
                error={errors.studyField as string} 
                touched={touched.studyField as boolean}
                defaultValue={item.studyField._id}
              />
              
              <p className="text-blue-500 italic mt-2">
                Note: Le nom du niveau sera automatiquement mis à jour en fonction de la filière sélectionnée.
              </p>
              
              <div className="flex justify-center items-center mt-4">
                <button
                  className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                  type="submit"
                  disabled={loading}
                >
                  <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Modifier</p>
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

export default UpdateLevel 