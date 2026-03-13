import { IUser, UserTypes, userTypeDictionary } from "@src/models/user"
import { IconType } from "react-icons"
import * as Yup from "yup"
import StudentStatus from "@src/constants/StudentStatus"
import { PiStudent } from "react-icons/pi"
import { HiIdentification } from "react-icons/hi"
import { FaRankingStar, FaRegEnvelope } from "react-icons/fa6"
import { SlCalender, SlLocationPin } from "react-icons/sl"
import { MdOutlineFolderSpecial, MdOutlineModeEdit, MdWorkOutline } from "react-icons/md"
import { BsCalendarDate } from "react-icons/bs"
import { MdMergeType } from "react-icons/md"
import { BsGenderNeuter } from "react-icons/bs"
import TeacherRank from "@src/constants/TeacherRank"
import TeacherSpecialization from "@src/constants/TeacherSpecialization"
import AdministratorStatus from "@src/constants/AdministratorStatus"
import Regions from "@src/constants/Regions"
import tunisianFlag from "@assets/images/Register/tunisia.svg"
import Genders from "@src/constants/Genders"
import { SelectOptionType } from "@src/components/Input"

export type UserInput = {
  name: keyof IUser
  label: string
  type: string
  options?: SelectOptionType[]
  picker?: "date" | "week" | "month" | "quarter" | "year" | undefined
  icon: IconType | string
  schema?: Yup.Schema
  requiredTypes?: UserTypes[]
  disabled?: boolean
}

const currentDate = new Date()
const updateUserInputs: UserInput[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    icon: MdMergeType,
    schema: Yup.string().oneOf(Object.values(userTypeDictionary)),
    disabled: true,
    requiredTypes: [UserTypes.Student, UserTypes.Teacher, UserTypes.Admin],
  },
  {
    name: "cin",
    label: "Numéro de CIN",
    type: "text",
    icon: HiIdentification,
    schema: Yup.string().matches(/^\d{8}$/, "Veuillez saisir un numéro de CIN valide."),
  },
  {
    name: "email",
    label: "E-mail",
    type: "text",
    icon: FaRegEnvelope,
    schema: Yup.string()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Veuillez saisir une adresse email valide.")
      .lowercase(),
  },
  {
    name: "name",
    label: "Nom",
    type: "text",
    icon: MdOutlineModeEdit,
    schema: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Nom invalide.")
      .max(30, "Votre nom ne doit pas dépasser 40 caractères."),
  },
  {
    name: "surname",
    label: "Prénom",
    type: "text",
    icon: MdOutlineModeEdit,
    schema: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Prénom invalide.")
      .max(30, "Votre prénom ne doit pas dépasser 40 caractères."),
  },
  {
    name: "gender",
    label: "Genre",
    type: "select",
    options: Genders,
    icon: BsGenderNeuter,
    schema: Yup.string(),
  },
  {
    name: "phone",
    label: "Numéro de téléphone",
    type: "text",
    icon: tunisianFlag,
    schema: Yup.string().matches(/^\d{8}$/, "Veuillez saisir un numéro de téléphone valide."),
  },
  {
    name: "birthdate",
    label: "Date de naissance",
    type: "date",
    icon: BsCalendarDate,
    schema: Yup.date()
      .min(
        new Date(currentDate.getFullYear() - 80, currentDate.getMonth(), currentDate.getDate()),
        "Veuillez saisir une date de naissance antérieure à 80 ans par rapport à aujourd'hui"
      )
      .max(
        new Date(currentDate.getFullYear() - 16, currentDate.getMonth(), currentDate.getDate()),
        "Veuillez saisir une date de naissance postérieure à 16 ans par rapport à aujourd'hui"
      ),
  },
  {
    name: "region",
    label: "Gouvernorat",
    type: "select",
    options: Regions,
    icon: SlLocationPin,
    schema: Yup.string(),
  },
  {
    name: "enrollmentYear",
    label: "Année de première inscription",
    type: "date",
    picker: "year",
    icon: SlCalender,
    schema: Yup.number()
      .integer()
      .min(currentDate.getFullYear() - 6, "Veuillez saisir une année antérieure à 6 ans par rapport à l'année en cours")
      .max(currentDate.getFullYear(), "Veuillez saisir une année postérieure à l'année en cours"),
    requiredTypes: [UserTypes.Student],
  },
  {
    name: "studyStatus",
    label: "Etat",
    type: "select",
    options: StudentStatus,
    icon: PiStudent,
    schema: Yup.string(),
    requiredTypes: [UserTypes.Student],
  },
  {
    name: "rank",
    label: "Grade",
    type: "select",
    options: TeacherRank,
    icon: FaRankingStar,
    schema: Yup.string(),
    requiredTypes: [UserTypes.Teacher],
  },
  {
    name: "specialization",
    label: "Specialité",
    type: "select",
    options: TeacherSpecialization,
    icon: MdOutlineFolderSpecial,
    schema: Yup.string(),
    requiredTypes: [UserTypes.Teacher],
  },
  {
    name: "recruitmentYear",
    label: "Année de recruitement",
    type: "date",
    picker: "year",
    icon: BsCalendarDate,
    schema: Yup.number()
      .integer()
      .min(currentDate.getFullYear() - 60, "Veuillez saisir une année de recruitement antérieure à 60 ans par rapport à l'année en cours")
      .max(currentDate.getFullYear(), "Veuillez saisir une année de recruitement postérieure à l'année en cours"),
    requiredTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    name: "jobStatus",
    label: "État",
    type: "select",
    options: AdministratorStatus,
    icon: MdWorkOutline,
    schema: Yup.string(),
    requiredTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    name: "mission",
    label: "Mission",
    type: "text",
    options: AdministratorStatus,
    icon: MdOutlineModeEdit,
    schema: Yup.string(),
    requiredTypes: [UserTypes.SuperAdmin],
  },
]

export default updateUserInputs
