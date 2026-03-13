import { FaRegEnvelope } from "react-icons/fa6"
import Input from "@src/components/Input"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import visual from "@src/assets/images/login/visual.png"
import Spinner from "@src/components/Spinner"
import { message, notification } from "antd"
import { VscKey } from "react-icons/vsc"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import Error from "@src/components/Error"
import { IPasswordReset, PasswordResetStatus } from "@src/models/passwordReset"
import { showRedirectNotification } from "@src/utils/redirectNotification"
import { nanoid } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

type InitialValuesType = {
  email: string
  password: string
  repeatPassword: string
}

const initialValues: InitialValuesType = {
  email: "",
  password: "",
  repeatPassword: "",
}

interface PasswordResetRequestState {
  status: string
  request: IPasswordReset | null
  error: string | null
}

const passwordResetRequestInitialState: PasswordResetRequestState = {
  status: "idle",
  request: null,
  error: null,
}

const passwordResetTokenRegex = /^[A-Za-z0-9]{64}$/

const validationSchema = Yup.object().shape({
  password: Yup.string().required("Veuillez saisir votre nouveau mot de passe.").min(8, "Le mot de passe doit comporter au moins 8 caractères."),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Les mots de passe doivent correspondre.")
    .required("Veuillez confirmer votre nouveau mot de passe."),
})

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const { passwordResetToken } = useParams<{ passwordResetToken: string }>()
  const [api, contextHolder] = notification.useNotification()
  const notificationKeyRef = useRef<string>(nanoid())
  const [passwordResetRequestState, setPasswordResetRequestState] = useState<PasswordResetRequestState>(passwordResetRequestInitialState)
  const [resetStatus, setResetStatus] = useState<string>("idle")

  useEffect(() => {
    const fetchResetRequest = async () => {
      if (passwordResetToken) {
        setPasswordResetRequestState({ status: "loading", request: null, error: null })
        try {
          const response = await axiosInstance.get(`resetPassword/${passwordResetToken}`)
          if (response.status === 200) {
            return setPasswordResetRequestState({ status: "succeeded", request: response.data.data, error: null })
          }
          setPasswordResetRequestState({ status: "failed", request: null, error: response.statusText })
        } catch (err: any) {
          setPasswordResetRequestState({
            status: "failed",
            request: null,
            error: err.response?.data?.message || "Échec de récupération de la demande de réinitialisation.",
          })
        }
      }
    }
    fetchResetRequest()
  }, [passwordResetToken, setPasswordResetRequestState])

  if (!passwordResetToken) {
    return (
      <Error
        status="404"
        title="Code de réinitialisation non fourni"
        subTitle="Désolé, le code de réinitialisation du mot de passe n'a pas été fourni."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (!passwordResetTokenRegex.test(passwordResetToken))
    return (
      <Error
        status="404"
        title="Code de réinitialisation invalide"
        subTitle="Le code de réinitialisation que vous avez fourni est invalide."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )

  if (passwordResetRequestState.status === "loading" || passwordResetRequestState.status === "idle") {
    return <Spinner fullscreen />
  }

  if (passwordResetRequestState.error) {
    let customError = `Désolé, une erreur s'est produite. ${passwordResetRequestState.error}`
    if (passwordResetRequestState.error === "Reset password request not found.")
      customError = "La demande de réinitialisation du mot de passe n'a pas été trouvée."
    return (
      <Error
        status="500"
        title="Erreur interne du serveur"
        subTitle={customError}
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (!passwordResetRequestState.request) {
    return (
      <Error
        status="404"
        title="Code d'invitation non fourni"
        subTitle="Désolé, le code d'invitation que vous avez fourni n'existe pas."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (passwordResetRequestState.request.status === PasswordResetStatus.Completed) {
    return (
      <Error
        status="403"
        title="Réinitialisation du mot de passe déjà effectuée"
        subTitle="Désolé, le code d'invitation que vous avez fourni a déjà été utilisé."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }
  const currentDateTime = new Date()
  const expiresAtDateTime = new Date(passwordResetRequestState.request.expiresAt)

  if (currentDateTime > expiresAtDateTime) {
    return (
      <Error
        status="403"
        title="Réinitialisation du mot de passe expirée"
        subTitle="Désolé, le code d'invitation que vous avez fourni a expiré."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  const openRedirectNotification = () => {
    showRedirectNotification({
      api,
      key: notificationKeyRef,
      redirectTo: "la page de connexion",
      onClose: () => {
        navigate("/login")
      },
    })
  }

  const handleSubmit = async (values: any) => {
    const query = { token: passwordResetToken, password: values.password }
    try {
      setResetStatus("loading")
      const response = await axiosInstance.post(`resetPassword`, query)
      if (response.status === 200) {
        message.success({ content: "Votre mot de passe a éte réinitialisé avec succès.", onClose: openRedirectNotification })
        return setResetStatus("succeeded")
      }
      message.error(response.statusText)
      setResetStatus("fail")
    } catch (err: any) {
      message.error(err.response?.data?.message || "Échec de réinitialisation du mot de passe.")
      setResetStatus("fail")
    }
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-dvh w-screen flex">
        <div className="tiny:w-full lg:w-3/5 flex justify-center flex-col items-center gap-16 my-8">
          <h1 className="tiny:text-xl xs:text-3xl sm:text-5xl	text-dark-blue font-semibold text-center select-none">Mot de passe oublié? </h1>
          <div className="tiny:w-4/5 lg:w-4/5 xl:w-4/6 2xl:w-7/12 flex items-center ">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleSubmit(values)
              }}
            >
              {({ errors, touched }) => (
                <Form noValidate className="login-form flex flex-col w-full tiny:gap-8 lg:gap-16">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-3">
                      <Input
                        prefixIcon={FaRegEnvelope}
                        height="h-12"
                        label="E-mail"
                        name="email"
                        disabled={true}
                        placeholder={passwordResetRequestState.request!.email}
                      />
                      <Input
                        prefixIcon={VscKey}
                        touched={touched.password}
                        height="h-12"
                        type="password"
                        error={errors.password}
                        label="Nouveau mot de passe"
                        name="password"
                        validation
                        placeholder="Entrez votre mot de passe"
                        required
                      />
                      <Input
                        prefixIcon={VscKey}
                        touched={touched.repeatPassword}
                        height="h-12"
                        type="password"
                        error={errors.repeatPassword}
                        label="Confirmez le nouveau mot de passe"
                        name="repeatPassword"
                        placeholder="Confirmez le nouveau mot de passe"
                        validation
                        required
                      />
                    </div>
                  </div>

                  <button
                    className={`w-full rounded-lg bg-dark-blue h-12 flex flex-row gap-4 justify-center items-center ${
                      !(resetStatus === "loading" || resetStatus === "succeeded")
                        ? "hover:brightness-95 focus:brightness-95"
                        : "hover:cursor-not-allowed"
                    }`}
                    type="submit"
                    disabled={resetStatus === "loading" || resetStatus === "succeeded"}
                  >
                    <p className="text-white font-semibold tiny:text-lg sm:text-base select-none">
                      {resetStatus === "loading" ? "Chargement" : "Réinitialiser"}
                    </p>
                    {resetStatus === "loading" && <Spinner className="white" />}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="tiny:hidden lg:block w-2/5	bg-light-blue min-h-screen">
          <div className="fixed top-0 right-0 w-2/5 h-screen flex justify-center items-center select-none">
            <img src={visual} alt="visual" className="lg:w-3/5 2xl:w-auto" />
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
