import { useEffect, useRef, useState } from "react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { message, notification } from "antd"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Spinner from "@src/components/Spinner"
import Error from "@src/components/Error"
import Input from "@src/components/Input"
import { useAppDispatch, useAppSelector } from "@src/store"
import { register } from "@src/store/slices/shared/auth/thunk/register"
import { restore } from "@src/store/slices/shared/auth/slice"
import registerInputs, { RegisterInput } from "./registerInputs"
import { IUser, UserTypes } from "@src/models/user"
import { IInvitation, InvitationStatus } from "@src/models/invitation"
import { showRedirectNotification } from "@src/utils/redirectNotification"
import { nanoid } from "@reduxjs/toolkit"
import axiosInstance from "@src/utils/axios"

const headerFriendlyNames = {
  [UserTypes.Student]: "étudiant",
  [UserTypes.Teacher]: "enseignant",
  [UserTypes.Admin]: "administrateur",
  [UserTypes.SuperAdmin]: "super administrateur",
}

const invitationTokenRegex = /^[A-Za-z0-9]{64}$/

interface InvitationState {
  status: string
  invitation: IInvitation | null
  error: string | null
}

const invitationInitialState: InvitationState = {
  status: "idle",
  invitation: null,
  error: null,
}

const Register: React.FC = () => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)
  const navigate = useNavigate()
  const { invitationToken } = useParams<{ invitationToken: string }>()
  const [api, contextHolder] = notification.useNotification()
  const notificationKeyRef = useRef<string>(nanoid())
  const { status: authStatus, error: authError } = useAppSelector((state) => state.auth)
  const [invitationState, setInvitationState] = useState<InvitationState>(invitationInitialState)
  const [filteredInputs, setFilteredInputs] = useState<RegisterInput[] | null>(null)
  const [filteredInitialValues, setFilteredInitialValues] = useState<{ [key in keyof IUser]: string } | null>(null)
  const [filteredSchemas, setFilteredSchemas] = useState<Yup.AnyObject | null>(null)

  useEffect(() => {
    dispatch(restore())
    formikRef.current?.resetForm()
  }, [])

  useEffect(() => {
    const fetchInvitation = async () => {
      if (invitationToken) {
        setInvitationState({ status: "loading", invitation: null, error: null })
        try {
          const response = await axiosInstance.get(`invite/${invitationToken}`)
          if (response.status === 200) {
            return setInvitationState({ status: "succeeded", invitation: response.data.data, error: null })
          }
          setInvitationState({ status: "failed", invitation: null, error: response.statusText })
        } catch (err: any) {
          setInvitationState({ status: "failed", invitation: null, error: err.response?.data?.message || "Échec de récupération de l'invitation." })
        }
      }
    }

    fetchInvitation()
  }, [invitationToken, setInvitationState])

  useEffect(() => {
    if (authStatus === "succeeded") {
      message.success({ content: "Votre inscription a été effectuée avec succès.", onClose: openRedirectNotification })
    } else if (authStatus === "failed") {
      message.error(authError)
    }
  }, [authStatus, authError])

  useEffect(() => {
    if (invitationState.invitation) {
      const inputs = registerInputs.filter((input) => {
        return !input.requiredTypes || input.requiredTypes.includes(invitationState.invitation!.type)
      })
      const initialValues = inputs.reduce(
        (acc, { name }) => {
          return { ...acc, [name]: "" }
        },
        {} as { [key in keyof IUser]: string },
      )

      const schemas = Yup.object().shape(
        inputs.reduce(
          (acc, { name, schema }) => {
            return { ...acc, [name]: schema }
          },
          {} as { [key in keyof IUser]: Yup.Schema<any> },
        ),
      )

      setFilteredInputs(inputs)
      setFilteredInitialValues(initialValues)
      setFilteredSchemas(schemas)
    }
  }, [invitationState.invitation])

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
    const { repeatPassword, ...newValues } = values
    const updatedValues = { ...newValues, type: invitationState.invitation!.type, invitation: invitationToken }
    dispatch(register(updatedValues))
  }

  if (!invitationToken) {
    return (
      <Error
        status="404"
        title="Code d'invitation introuvable"
        subTitle="Désolé, nous n'avons pas pu trouver le code d'invitation."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (!invitationTokenRegex.test(invitationToken))
    return (
      <Error
        status="404"
        title="Code d'invitation invalide"
        subTitle="Le code d'invitation que vous avez fourni est invalide."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )

  if (invitationState.status === "loading" || invitationState.status === "idle") {
    return <Spinner fullscreen />
  }

  if (invitationState.error) {
    return (
      <Error
        status="500"
        title="Erreur interne du serveur"
        subTitle={`Désolé, une erreur s'est produite. ${invitationState.error}`}
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (!invitationState.invitation) {
    return (
      <Error
        status="404"
        title="Code d'invitation introuvable"
        subTitle="Désolé, le code d'invitation que vous avez fourni n'existe pas."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (invitationState.invitation.status === InvitationStatus.Accepted) {
    return (
      <Error
        status="403"
        title="Invitation déjà utilisée"
        subTitle="Désolé, le code d'invitation que vous avez fourni a déjà été utilisé."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (invitationState.invitation.status === InvitationStatus.Expired) {
    return (
      <Error
        status="403"
        title="Invitation expirée"
        subTitle="Désolé, le code d'invitation que vous avez fourni a expiré."
        button={{ redirect: "/login", text: "Aller à la page de connexion" }}
      />
    )
  }

  if (filteredInputs === null) {
    return <Spinner fullscreen />
  }

  if (Object.values(UserTypes).includes(invitationState.invitation!.type)) {
    return (
      <>
        {contextHolder}
        <div className="w-screen flex tiny:my-8 md:my-0 min-h-dvh justify-center">
          <div className="tiny:hidden xl:block w-2/6 bg-light-blue">
            <div className="fixed top-0 left-0 w-2/6 flex justify-center items-center h-full">
              <p className="font-semibold lg:text-3xl 2xl:text-4xl text-center select-none">
                Une plateforme <br /> pour tous vos <span className="font-semibold lg:text-3xl 2xl:text-4xl text-dark-blue">résultats</span>
              </p>
            </div>
          </div>
          <div className="tiny:w-full lg:w-4/6 flex justify-center items-center flex-col tiny:gap-6 overflow-auto tiny:py-4">
            <h1 className="tiny:text-xl xs:text-3xl sm:text-4xl text-dark-blue font-semibold text-center select-none">
              Créez un compte {headerFriendlyNames[invitationState.invitation!.type as UserTypes]}
            </h1>
            <div className="tiny:w-4/5 2xl:w-4/5 3xl:w-7/12 flex items-center">
              <Formik
                initialValues={filteredInitialValues!}
                validationSchema={filteredSchemas!}
                onSubmit={(values) => {
                  handleSubmit(values)
                }}
                innerRef={formikRef}
              >
                {({ errors, touched, setFieldTouched, setFieldValue }) => (
                  <Form noValidate className="login-form flex flex-col w-full gap-6">
                    <div className="grid grid-cols-[repeat(2,1fr)] gap-y-2 tiny:gap-x-1 md:gap-x-3 lg:gap-x-4">
                      {filteredInputs.map((field, index) => {
                        const placeholder = field.label.charAt(0).toLowerCase() + field.label.slice(1)
                        return (
                          <div key={index} className={field.span === 2 ? "col-span-2" : "md:col-span-1 tiny:col-span-2"}>
                            <Input
                              prefixIcon={field.icon}
                              height="h-12"
                              labelGap="gap-1"
                              touched={touched[field.name]}
                              error={errors[field.name]}
                              label={field.label}
                              name={field.name}
                              placeholder={field.placeholderEqLabel ? field?.label : `Entrez votre ${placeholder}`}
                              type={field.type}
                              setFieldTouched={setFieldTouched}
                              setFieldValue={setFieldValue}
                              picker={field.picker ? field.picker : undefined}
                              options={field.type === "select" ? field.options : undefined}
                              required
                              validation
                            />
                          </div>
                        )
                      })}
                    </div>

                    <button
                      className={`w-full rounded-lg bg-dark-blue h-12 flex flex-row gap-4 justify-center items-center ${
                        !(authStatus === "loading" || authStatus === "succeeded")
                          ? "hover:brightness-95 focus:brightness-95"
                          : "hover:cursor-not-allowed"
                      }`}
                      type="submit"
                      disabled={authStatus === "loading" || authStatus === "succeeded"}
                    >
                      <p className="text-white font-semibold tiny:text-lg sm:text-base select-none">
                        {authStatus === "loading" ? "Chargement" : "Soumettre"}
                      </p>
                      {authStatus === "loading" && <Spinner className="white" />}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </>
    )
  }

  return <Navigate to="/login" />
}

export default Register
