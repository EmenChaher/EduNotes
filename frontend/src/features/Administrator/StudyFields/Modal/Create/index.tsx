import React, { useEffect, useRef, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import Input from "@src/components/Input"
import { CreateTableItemModalPropTypes } from "@src/components/Table"
import DiplomaAsyncSelect from "../../DiplomaAsyncSelect"
import { IoSchool } from "react-icons/io5"
import { MdShortText } from "react-icons/md"
import { createStudyField } from "@src/store/slices/administrator/studyFields/thunk"
import { restoreCreate } from "@src/store/slices/administrator/studyFields/slice"

const initialValues = {
  diploma: "",
  label: "",
  acronym: "",
}

// Liste des mots interdits pour les noms de filières
const forbiddenWords = [
  "test",
  "abc",
  "exemple",
  "demo",
  "temp",
  "temporaire",
  "essai",
  "brouillon",
  "draft",
  "sample",
  "fake",
  "null",
  "undefined",
  "admin",
  "root",
  "system",
]

// Validation des noms de filières académiques
const isValidStudyFieldName = (name: string) => {
  const lowerName = name.toLowerCase().trim()

  // Vérifier les mots interdits
  const containsForbiddenWord = forbiddenWords.some((word) => lowerName.includes(word))

  if (containsForbiddenWord) {
    return false
  }

  // Vérifier que c'est un nom académique valide (lettres, espaces, apostrophes, tirets)
  const academicNamePattern = /^[a-zA-ZÀ-ÿ\s'\-]+$/
  return academicNamePattern.test(name)
}

const validationSchema = Yup.object().shape({
  diploma: Yup.string().required("Veuillez sélectionner le diplôme."),
  label: Yup.string()
    .required("Veuillez saisir le nom de la filière.")
    .min(3, "Le nom de la filière doit contenir au moins 3 caractères.")
    .max(60, "Le nom de la filière ne peut pas dépasser 60 caractères.")
    .test("is-valid-name", "Le nom de la filière contient des caractères non autorisés ou des mots interdits.", isValidStudyFieldName)
    .test("starts-with-capital", "Le nom de la filière doit commencer par une majuscule.", (value) => {
      return value ? /^[A-ZÀ-Ÿ]/.test(value) : false
    }),
  acronym: Yup.string()
    .required("Veuillez saisir l'acronyme de la filière.")
    .min(2, "L'acronyme doit contenir au moins 2 caractères.")
    .max(10, "L'acronyme ne peut pas dépasser 10 caractères.")
    .matches(/^[A-Z0-9]+$/, "L'acronyme doit contenir uniquement des lettres majuscules et des chiffres."),
})

// Note: Study field names are now free text input instead of predefined options

const CreateStudyField: React.FC<CreateTableItemModalPropTypes> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch()
  const formikRef = useRef<any>(null)

  const { status, error } = useAppSelector((state) => state.administrator.studyFields).create

  useEffect(() => {
    dispatch(restoreCreate())
    formikRef.current?.resetForm()
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la création de la filière : ${error}`)
      console.log("Error while creating study field:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La filière a été créée avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleSubmit = (values: any) => {
    const { diploma, label, acronym } = values
    dispatch(
      createStudyField({
        diploma,
        label,
        acronym,
        page: 1,
      }),
    )
  }

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <Modal open={open} title="Ajouter une filière" closeModal={closeModal} destroyOnClose>
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
              <DiplomaAsyncSelect setFieldTouched={setFieldTouched} setFieldValue={setFieldValue} error={errors.diploma} touched={touched.diploma} />

              <Input
                prefixIcon={IoSchool}
                height="tiny:h-12 sm:h-12"
                type="text"
                name="label"
                touched={touched.label}
                error={errors.label}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                placeholder="Ex: Informatique et Systèmes"
                label="Nom de la filière"
              />
              <p className="text-xs text-gray-500 mt-1 mb-2">
                💡 Le nom doit commencer par une majuscule et contenir uniquement des lettres, espaces, apostrophes et tirets.
              </p>

              <Input
                prefixIcon={MdShortText}
                height="tiny:h-12 sm:h-12"
                type="text"
                name="acronym"
                touched={touched.acronym}
                error={errors.acronym}
                setFieldTouched={setFieldTouched}
                setFieldValue={setFieldValue}
                placeholder="Ex: IS, TIC, GL"
                label="Acronyme"
              />
              <p className="text-xs text-gray-500 mt-1 mb-2">💡 L'acronyme doit être en majuscules (lettres et chiffres uniquement).</p>

              <div className="flex justify-center items-center mt-4">
                <button
                  className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                  type="submit"
                  disabled={loading}
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

export default CreateStudyField
