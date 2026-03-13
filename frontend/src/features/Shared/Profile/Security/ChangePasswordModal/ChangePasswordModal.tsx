import React from "react"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { Form, Formik } from "formik"
import Input from "@src/components/Input"
import { VscKey } from "react-icons/vsc"
import * as Yup from "yup"
import { message } from "antd"
import axiosInstance from "@src/utils/axios"

interface ChangePasswordModalPropTypes {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const initialValues = {
  currentPassword: "",
  newPassword: "",
  repeatNewPassword: "",
}

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Veuillez saisir votre mot de passe.").min(8, "Le mot de passe doit comporter au moins 8 caractères."),
  newPassword: Yup.string()
    .required("Veuillez saisir votre nouveau mot de passe.")
    .min(8, "Le mot de passe doit comporter au moins 8 caractères.")
    .notOneOf([Yup.ref("currentPassword")], "Le nouveau mot de passe ne peut pas être identique au mot de passe actuel."),
  repeatNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), ""], "Les mots de passe doivent correspondre.")
    .required("Veuillez confirmer votre nouveau mot de passe."),
})

const ChangePasswordModal: React.FC<ChangePasswordModalPropTypes> = ({ open, setOpen }) => {
  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = async (
    values: any,
    setSubmitting: (isSubmitting: boolean) => void,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    try {
      const query = { currentPassword: values.currentPassword, newPassword: values.newPassword }
      const response = await axiosInstance.post("/changePassword", query)
      if (response.status === 200) {
        closeModal()
        message.success("Votre mot de passe a été modifié avec succès.")
        setSubmitting(false)
      }
    } catch (error: any) {
      if (error?.response?.data?.message === "Invalid current password.") setFieldError("currentPassword", "Mot de passe actuel invalide.")
      else {
        message.error("Une erreur est survenue lors de la tentative de modification de votre mot de passe.")
        console.error("An error occurred while changing password:", error)
      }
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Modifier mot de passe" open={open} closeModal={closeModal}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, setFieldError }) => {
          handleSubmit(values, setSubmitting, setFieldError)
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form noValidate className="login-form flex flex-col w-full gap-4">
            <div className="flex flex-col lg:gap-2 tiny:gap-1">
              <Input
                prefixIcon={VscKey}
                height="tiny:h-10 sm:h-12"
                touched={touched.currentPassword}
                error={errors.currentPassword}
                type="password"
                name="currentPassword"
                label="Mot de passe actuel"
                placeholder="********"
                required
                validation
              />
              <Input
                prefixIcon={VscKey}
                height="tiny:h-10 sm:h-12"
                touched={touched.newPassword}
                error={errors.newPassword}
                type="password"
                name="newPassword"
                label="Nouveau mot de passe"
                placeholder="********"
                required
                validation
              />
              <Input
                prefixIcon={VscKey}
                height="tiny:h-10 sm:h-12"
                touched={touched.repeatNewPassword}
                error={errors.repeatNewPassword}
                type="password"
                name="repeatNewPassword"
                label="Confirmez le nouveau mot de passe"
                placeholder="********"
                required
                validation
              />
            </div>

            <div className="flex justify-center items-center">
              <button
                className="rounded-lg border-2 border-dark-blue bg-dark-blue tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                type="submit"
                disabled={isSubmitting}
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none">Modifier</p>
                {isSubmitting && <Spinner className="white" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default ChangePasswordModal
