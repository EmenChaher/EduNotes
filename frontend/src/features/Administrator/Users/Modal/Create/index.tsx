import React, { useEffect, useRef, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import { Popover, message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import ClassAsyncSelect from "../../ClassAsyncSelect"
import { MdMergeType } from "react-icons/md"
import { IoAdd } from "react-icons/io5"
import { IoInformationCircle } from "react-icons/io5"
import { UserTypes, userTypeDictionary } from "@src/models/user"
import EmailChoice from "./EmailChoice"
import { MdDelete } from "react-icons/md"
import { sendInvitation } from "@src/store/slices/administrator/users/thunk"
import { restoreInvite } from "@src/store/slices/administrator/users/slice"

const initialValues = {
  type: "",
  clss: "",
  email: "",
}

const emailRegex: RegExp = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}(?:[ ,;|\n]+[\w.-]+@([\w-]+\.)+[\w-]{2,4})*$/

const validationSchema = Yup.object().shape({
  type: Yup.string().oneOf(Object.values(UserTypes)).required("Veuillez sélectionner le type d'utilisateur."),
  clss: Yup.string().when("type", {
    is: (type: any) => type === UserTypes.Student,
    then: (schema) => schema.required("Veuillez sélectionner la classe."),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const InviteUser: React.FC<CreateTableItemModalPropTypes> = ({ open, setOpen }) => {
  const user = useAppSelector((state) => state.auth.user)
  const [currentEmails, setCurrentEmails] = useState<string[]>([])
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.users).invite
  useEffect(() => {
    dispatch(restoreInvite())
    formikRef.current?.resetForm()
    setCurrentEmails([])
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      let errorMessage =
        currentEmails.length > 1 ? `Échec lors de l'envoi des invitations : ${error}` : `Échec lors de l'envoi de l'invitation : ${error}`
      errorMessage = errorMessage.replace("is already invited", "est déjà invité")
      message.error(errorMessage)
      console.log("Error while sending invitations :", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      let successMessage = currentEmails.length > 1 ? "Les utilisateurs ont été invités avec succès." : "L'utilisateur a été invité avec succès."
      message.success(successMessage)
      setOpen(false)
    }
  }, [status, setOpen, currentEmails])

  const handleSubmit = (values: any) => {
    const { type, clss } = values
    if (currentEmails.length === 0) return message.error("Veuillez insérer au moins une adresse e-mail pour envoyer une invitation.")
    const queryData = {
      type,
      emails: currentEmails,
      ...(clss !== "" && { clss }),
    }
    dispatch(sendInvitation(queryData))
  }

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const addEmail = (e: any, emailInput: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    e.preventDefault()
    const emailsArray = emailInput.split(/[ ,;|\n]+/)
    const uniqueEmailsSet = new Set(emailsArray)
    if (uniqueEmailsSet.size !== emailsArray.length) {
      message.error("Des adresses e-mail en double ont été détectées. Veuillez saisir des adresses e-mail uniques.")
      return
    }
    uniqueEmailsSet.forEach((email) => {
      if (currentEmails.includes(email)) {
        message.error("Email déjà ajouté ! Veuillez entrer une adresse email différente.")
      } else {
        setCurrentEmails((prevState) => [...prevState, email])
      }
    })
    setFieldValue("email", "")
  }

  const removeEmail = (emailToRemove: string) => {
    setCurrentEmails((prevState) => prevState.filter((email) => email !== emailToRemove))
  }

  return (
    <Modal open={open} title="Inviter" closeModal={closeModal} destroyOnClose>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldTouched, setFieldValue }) => {
          const validEmail = emailRegex.test(values.email)
          return (
            <Form noValidate className="login-form flex flex-col w-full tiny:gap-2 sm:gap-4">
              <Input
                prefixIcon={MdMergeType}
                height="tiny:h-12 sm:h-12"
                type="select"
                name="type"
                touched={touched.type}
                error={errors.type}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                options={Object.values(UserTypes)
                  .filter((userType) => userType !== UserTypes.SuperAdmin && !(user!.type !== UserTypes.SuperAdmin && userType === UserTypes.Admin))
                  .map((userType) => ({
                    key: userType,
                    value: userTypeDictionary[userType],
                  }))}
                placeholder="Selectionner le type"
                label="Type d'utilisateur"
              />
              {values.type && values.type !== "" && values.type === UserTypes.Student && (
                <div className="flex flex-col lg:gap-2 tiny:gap-1">
                  <ClassAsyncSelect setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} error={errors.clss} touched={touched.clss} />
                </div>
              )}
              <div className="flex flex-col flex-1 mb-5">
                <div className={`flex flex-col tiny:gap-1 lg:gap-3`}>
                  <div className="text-slate-gray tiny:text-xs sm:text-base font-medium select-none">
                    <div className="flex gap-1 items-center">
                      <p className="text-[0.8rem]">E-mail</p>
                      <Popover
                        content={
                          <div className="sm:max-w-[20vw]">
                            <p>
                              Lors de la saisie des adresses e-mail, vous pouvez insérer plusieurs e-mails séparés par des espaces, des virgules, des
                              points-virgules ou des barres verticales (|) pour une saisie précise et rapide.
                            </p>
                          </div>
                        }
                        title="Aide sur la saisie des adresses e-mail"
                        trigger="hover"
                      >
                        <IoInformationCircle className="tiny:size-4 sm:size-5 fill-dark-blue" />
                      </Popover>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={` flex-1 flex flex-col items-center rounded-lg tiny:min-h-10 sm:min-h-12 box-border px-3 border-2 py-2 border-dark-blue`}
                    >
                      <div className="flex flex-col gap-1 w-full flex-1">
                        {currentEmails.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {currentEmails.map((email, index) => (
                              <EmailChoice key={index} email={email} removeEmail={removeEmail} />
                            ))}
                          </div>
                        )}
                        <Field
                          as="textarea"
                          type="text"
                          name="email"
                          rows={4}
                          placeholder={`${currentEmails && currentEmails.length === 0 ? "Enter un e-mail" : ""}`}
                          className="text-slate-gray font-normal tiny:text-xs sm:text-base flex-1 bg-transparent w-full resize-none"
                          onKeyDown={(e: any) => {
                            if (e.key === "Enter") {
                              if (values.email && validEmail) {
                                addEmail(e, values.email, setFieldValue)
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        disabled={!validEmail}
                        onClick={(e) => {
                          e.preventDefault()
                          if (values.email && validEmail) {
                            addEmail(e, values.email, setFieldValue)
                          }
                        }}
                        className={`rounded-lg border-2 ${
                          !validEmail
                            ? "border-gray-400 bg-gray-400 hover:cursor-not-allowed"
                            : "hover:bg-white hover:brightness-95 bg-dark-blue border-dark-blue"
                        } 
                         group tiny:size-6 sm:size-8 flex justify-center items-center gap-4 focus:brightness-95`}
                      >
                        <IoAdd className={`size-full stroke-white ${validEmail ? `group-hover:stroke-dark-blue` : ""}`} />
                      </button>
                      <button
                        disabled={currentEmails.length === 0}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentEmails([])
                        }}
                        className={`rounded-lg border-2 ${
                          currentEmails.length === 0
                            ? "border-gray-400 bg-gray-400 hover:cursor-not-allowed"
                            : "hover:bg-white hover:brightness-95 bg-red-500 border-red-500"
                        } 
                         group tiny:size-6 sm:size-8 flex justify-center items-center gap-4 focus:brightness-95`}
                      >
                        <MdDelete className={`size-full fill-white ${currentEmails.length !== 0 ? `group-hover:fill-red-400` : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <button
                  className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                  type="submit"
                  disabled={loading}
                >
                  <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Inviter</p>
                  {loading && <Spinner className="white hover dark-blue" />}
                </button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}

export default InviteUser
