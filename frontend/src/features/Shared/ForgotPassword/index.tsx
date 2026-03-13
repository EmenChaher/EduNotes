import { FaRegEnvelope } from "react-icons/fa6"
import Input from "@src/components/Input"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import visual from "@src/assets/images/login/visual.png"
import Spinner from "@src/components/Spinner"
import { message } from "antd"
import axiosInstance from "@src/utils/axios"
import { useState } from "react"
import { Link } from "react-router-dom"

type InitialValuesType = {
  email: string
}

const initialValues: InitialValuesType = {
  email: "",
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Veuillez saisir une adresse email valide.")
    .required("Veuillez saisir votre adresse email."),
})

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = async (
    values: any,
    setFieldError: (field: string, message: string | undefined) => void,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post("/forgotPassword", values)
      setLoading(false)
      if (response.status === 200) {
        message.success("Les instructions de réinitialisation du mot de passe ont été envoyées à l'adresse e-mail indiquée.")
      }
    } catch (error: any) {
      switch (error?.response?.data?.message) {
        case "No account found for this email.":
          setFieldError("email", "Aucun compte associé à cette adresse e-mail n'a été trouvé.")
          break
        case "Password recovery request already exists. Please check your email or try again later.":
          message.error("Une demande de récupération du mot de passe existe déjà. Veuillez vérifier votre e-mail ou réessayer ultérieurement.")
          break
        default:
          message.error("Une erreur est survenue lors de la demande de récupération de votre mot de passe.")
      }
      console.error("An error occurred while changing password:", error)
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh w-screen flex">
      <div className="tiny:w-full lg:w-3/5 flex justify-center flex-col items-center gap-16 my-8">
        <h1 className="tiny:text-xl xs:text-3xl sm:text-5xl	text-dark-blue font-semibold text-center select-none">Mot de passe oublié? </h1>
        <div className="tiny:w-4/5 lg:w-4/5 xl:w-4/6 2xl:w-7/12 flex items-center ">
          <div className="w-full flex flex-col gap-10">
            <p className="font-medium text-base text-slate-gray text-center">Veuillez entrer votre e-mail pour réinitialiser votre mot de passe.</p>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values, { setFieldError, setSubmitting }) => {
                handleSubmit(values, setFieldError, setSubmitting)
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form noValidate className="login-form flex flex-col w-full tiny:gap-8 lg:gap-16">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-5">
                      <Input
                        prefixIcon={FaRegEnvelope}
                        touched={touched.email}
                        height="h-12"
                        error={errors.email}
                        label="E-mail"
                        name="email"
                        placeholder="Entrez votre e-mail"
                      />
                    </div>
                    <div className="flex justify-end items-center">
                      <Link to="/login">
                        <button tabIndex={-1} type="button" className="font-normal tiny:text-xs sm:text-base text-sky-blue select-none">
                          Aller à la page de connexion
                        </button>
                      </Link>
                    </div>
                  </div>

                  <button
                    className={`w-full rounded-lg bg-dark-blue h-12 flex flex-row gap-4 justify-center items-center ${
                      !isSubmitting ? "hover:brightness-95 focus:brightness-95" : "hover:cursor-not-allowed"
                    }`}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <p className="text-white font-semibold tiny:text-lg sm:text-base select-none">{loading ? "Chargement" : "Réinitialiser"}</p>
                    {loading && <Spinner className="white" />}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <div className="tiny:hidden lg:block w-2/5	bg-light-blue min-h-screen">
        <div className="fixed top-0 right-0 w-2/5 h-screen flex justify-center items-center select-none">
          <img src={visual} alt="visual" className="lg:w-3/5 2xl:w-auto" />
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
