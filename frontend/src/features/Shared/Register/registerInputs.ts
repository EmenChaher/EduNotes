import { IUser, UserTypes } from "@src/models/user"
import { IconType } from "react-icons"
import * as Yup from "yup"
import StudentStatus from "@src/constants/StudentStatus"
import { PiStudent } from "react-icons/pi"
import { HiIdentification } from "react-icons/hi"
import { FaRankingStar, FaRegEnvelope } from "react-icons/fa6"
import { VscKey } from "react-icons/vsc"
import { SlCalender, SlLocationPin } from "react-icons/sl"
import { MdOutlineFolderSpecial, MdOutlineModeEdit, MdWorkOutline } from "react-icons/md"
import { BsCalendarDate } from "react-icons/bs"
import { BsGenderNeuter } from "react-icons/bs"
import TeacherRank from "@src/constants/TeacherRank"
import TeacherSpecialization from "@src/constants/TeacherSpecialization"
import AdministratorStatus from "@src/constants/AdministratorStatus"
import Regions from "@src/constants/Regions"
import tunisianFlag from "@src/assets/images/Register/tunisia.svg"
import Genders from "@src/constants/Genders"

export type RegisterInput = {
  name: keyof IUser
  label: string
  type: string
  options?: string[]
  picker?: "date" | "week" | "month" | "quarter" | "year" | undefined
  icon: IconType | string
  span: number
  schema?: Yup.Schema
  requiredTypes?: UserTypes[]
  placeholderEqLabel?: boolean
}

const currentDate = new Date()
const registerInputs: RegisterInput[] = [
  {
    name: "cin",
    label: "Numéro de CIN",
    type: "text",
    icon: HiIdentification,
    span: 2,
    schema: Yup.string()
      .required("Veuillez saisir votre numéro de CIN.")
      .matches(/^\d{8}$/, "Veuillez saisir un numéro de CIN valide."),
  },
  {
    name: "email",
    label: "E-mail",
    type: "text",
    icon: FaRegEnvelope,
    span: 2,
    schema: Yup.string()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Veuillez saisir une adresse email valide.")
      .lowercase()
      .required("Veuillez saisir votre adresse email."),
  },
  {
    name: "name",
    label: "Nom",
    type: "text",
    icon: MdOutlineModeEdit,
    span: 1,
    schema: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Nom invalide.")
      .max(30, "Votre nom ne doit pas dépasser 40 caractères.")
      .required("Veuillez saisir votre nom."),
  },
  {
    name: "surname",
    label: "Prénom",
    type: "text",
    icon: MdOutlineModeEdit,
    span: 1,
    schema: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Prénom invalide.")
      .max(30, "Votre prénom ne doit pas dépasser 40 caractères.")
      .required("Veuillez saisir votre prénom."),
  },
  {
    name: "gender",
    label: "Genre",
    type: "select",
    options: Genders,
    icon: BsGenderNeuter,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre genre."),
  },
  {
    name: "phone",
    label: "Numéro de téléphone",
    type: "text",
    icon: tunisianFlag,
    span: 1,
    schema: Yup.string()
      .required("Veuillez saisir votre numéro de téléphone.")
      .matches(/^\d{8}$/, "Veuillez saisir un numéro de téléphone valide."),
  },
  {
    name: "password",
    label: "Mot de passe",
    type: "password",
    icon: VscKey,
    span: 1,
    schema: Yup.string().required("Veuillez saisir votre mot de passe.").min(8, "Password must be 8 characters long"),
  },
  {
    name: "repeatPassword",
    label: "Répéter mot de passe",
    type: "password",
    icon: VscKey,
    span: 1,
    placeholderEqLabel: true,
    schema: Yup.string()
      .oneOf([Yup.ref("password"), ""], "Les mots de passe doivent correspondre.")
      .required("Veuillez répéter votre mot de passe."),
  },
  {
    name: "birthdate",
    label: "Date de naissance",
    type: "date",
    icon: BsCalendarDate,
    span: 1,
    schema: Yup.date()
      .min(
        new Date(currentDate.getFullYear() - 80, currentDate.getMonth(), currentDate.getDate()),
        "Veuillez saisir une date de naissance antérieure à 80 ans par rapport à aujourd'hui"
      )
      .max(
        new Date(currentDate.getFullYear() - 16, currentDate.getMonth(), currentDate.getDate()),
        "Veuillez saisir une date de naissance postérieure à 16 ans par rapport à aujourd'hui"
      )
      .required("Veuillez sélectionner votre date de naissance."),
  },
  {
    name: "region",
    label: "Gouvernorat",
    type: "select",
    options: Regions,
    icon: SlLocationPin,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre gouvernorat."),
  },
  {
    name: "enrollmentYear",
    label: "Année de première inscription",
    type: "date",
    picker: "year",
    icon: SlCalender,
    span: 1,
    schema: Yup.number()
      .integer()
      .min(currentDate.getFullYear() - 6, "Veuillez saisir une année antérieure à 6 ans par rapport à l'année en cours")
      .max(currentDate.getFullYear(), "Veuillez saisir une année postérieure à l'année en cours")
      .required("Veuillez sélectionner votre année d'inscription."),
    requiredTypes: [UserTypes.Student],
  },
  {
    name: "studyStatus",
    label: "Etat",
    type: "select",
    options: StudentStatus,
    icon: PiStudent,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre état."),
    requiredTypes: [UserTypes.Student],
  },
  {
    name: "rank",
    label: "Grade",
    type: "select",
    options: TeacherRank,
    icon: FaRankingStar,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre état."),
    requiredTypes: [UserTypes.Teacher],
  },
  {
    name: "specialization",
    label: "Specialité",
    type: "select",
    options: TeacherSpecialization,
    icon: MdOutlineFolderSpecial,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre année d'inscription."),
    requiredTypes: [UserTypes.Teacher],
  },
  {
    name: "recruitmentYear",
    label: "Année de recruitement",
    type: "date",
    picker: "year",
    icon: BsCalendarDate,
    span: 1,
    schema: Yup.number()
      .integer()
      .min(currentDate.getFullYear() - 60, "Veuillez saisir une année de recruitement antérieure à 60 ans par rapport à l'année en cours")
      .max(currentDate.getFullYear(), "Veuillez saisir une année de recruitement postérieure à l'année en cours")
      .required("Veuillez sélectionner votre date de recruitement."),
    requiredTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    name: "jobStatus",
    label: "État",
    type: "select",
    options: AdministratorStatus,
    icon: MdWorkOutline,
    span: 1,
    schema: Yup.string().required("Veuillez sélectionner votre état."),
    requiredTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    name: "mission",
    label: "Mission",
    type: "text",
    options: AdministratorStatus,
    icon: MdOutlineModeEdit,
    span: 2,
    schema: Yup.string().required("Veuillez saisir votre mission."),
    requiredTypes: [UserTypes.SuperAdmin],
  },
]

export default registerInputs
