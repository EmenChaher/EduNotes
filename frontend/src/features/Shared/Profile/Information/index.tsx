import { useEffect, useState } from "react"
import { message } from "antd"
import Field, { ProfileInformationFieldType } from "./Field"
import { IUser, UserTypes } from "@src/models/user"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Regions from "@src/constants/Regions"
import StudentStatus from "@src/constants/StudentStatus"
import TeacherRank from "@src/constants/TeacherRank"
import TeacherSpecialization from "@src/constants/TeacherSpecialization"
import AdministratorStatus from "@src/constants/AdministratorStatus"
import axiosInstance from "@src/utils/axios"
import { initialise } from "@src/store/slices/shared/auth/slice"
import Genders from "@src/constants/Genders"

type Field = {
  label: string
  name: keyof IUser
  type: ProfileInformationFieldType
  editable?: boolean
  picker?: "date" | "week" | "month" | "quarter" | "year"
  options?: string[]
}

const fieldsArray: Field[] = [
  { label: "Nom", name: "name", type: "text" },
  { label: "Prénom", name: "surname", type: "text" },
  { label: "E-mail", name: "email", type: "email", editable: true },
  { label: "Genre", name: "gender", type: "select", options : Genders },
  { label: "Numéro de téléphone", name: "phone", type: "phone", editable: true },
  { label: "Date de naissance", name: "birthdate", type: "date" },
  { label: "Gouvernorat", name: "region", type: "select", options: Regions },
  { label: "Etat", name: "studyStatus", type: "select", options: StudentStatus },
  { label: "Année de première inscription", name: "enrollmentYear", type: "date", picker: "year" },
  { label: "Grade", name: "rank", type: "select", options: TeacherRank },
  { label: "Specialité", name: "specialization", type: "select", options: TeacherSpecialization },
  { label: "Etat", name: "jobStatus", type: "select", options: AdministratorStatus },
  { label: "Année de recruitement", name: "recruitmentYear", type: "date", picker: "year" },
  { label: "Mission", name: "mission", type: "text" },
]

const Information: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const exportInformationValues = (user: IUser, fields: Field[]): Partial<Record<keyof IUser, any>> => {
    const exportedValues: Partial<Record<keyof IUser, any>> = {}
    fields.forEach((field) => {
      if (field.name in user) {
        exportedValues[field.name] = user[field.name]
      }
    })
    return exportedValues
  }

  const compareObjects = (obj1: any, obj2: any) => {
    for (let key in obj1) {
      if (obj1[key] !== obj2[key]) {
        return false
      }
    }
    return true
  }

  const saveChanges = async () => {
    try {
      const differences: Partial<IUser> = {}
      for (const key in initialValues) {
        const keyName = key as keyof IUser
        if (initialValues[keyName] !== inputValues[keyName]) {
          differences[keyName] = inputValues[keyName]
        }
      }

      const response = await axiosInstance.patch("/profile", differences)
      if (response.status === 200) {
        const mergedUser = { ...user, ...differences }
        message.success("Les modifications de profil ont été enregistrées.")
        return dispatch(initialise({ isAuthenticated: true, user: mergedUser }))
      }
    } catch (error) {
      setInitialValues(exportInformationValues(user!, fieldsArray))
      setInputValues(exportInformationValues(user!, fieldsArray))
      message.error("Une erreur s'est produite lors de l'enregistrement du profil. Impossible d'enregistrer vos modifications.")
      console.error("An error occurred while saving profile:", error)
    }
  }

  const cancelChanges = () => {
    setInputValues(exportInformationValues(user!, fieldsArray))
  }

  const onInputValueChange = (name: string, value: string) => {
    setInputValues((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const [initialValues, setInitialValues] = useState<Partial<Record<keyof IUser, any>>>(exportInformationValues(user!, fieldsArray))
  const [inputValues, setInputValues] = useState<Partial<Record<keyof IUser, any>>>(exportInformationValues(user!, fieldsArray))
  const [valuesMatch, setValuesMatch] = useState<boolean>(true)

  useEffect(() => {
    setInitialValues(exportInformationValues(user!, fieldsArray))
    setInputValues(exportInformationValues(user!, fieldsArray))
  }, [user])

  useEffect(() => {
    setValuesMatch(compareObjects(initialValues, inputValues))
  }, [inputValues])

  if (user === null) return <Spinner fullcontainer />

  return (
    <div className="flex-1 shadow-[0px_0px_18px_0px_#33333333] rounded-2xl box-border tiny:py-4 tiny:px-4 sm:py-5 sm:px-6 flex flex-col gap-6">
      <p className="tiny:text-base sm:text-lg md:text-xl font-semibold text-dark-blue w-full select-none">Informations personnelles</p>
      <div className="flex flex-col gap-5">
        {fieldsArray.map(
          (field, index) =>
            typeof user[field.name] === "string" && (
              <Field
                key={index}
                label={field.label}
                name={field.name}
                value={inputValues![field.name]!}
                type={field.type}
                picker={field.picker}
                editable={user?.type === UserTypes.Admin || user?.type === UserTypes.SuperAdmin ? true : field.editable}
                options={field.options}
                updateInputValue={(name, value) => onInputValueChange(name, value)}
              />
            )
        )}
      </div>
      {!valuesMatch && (
        <div className="flex tiny:flex-col sm:flex-row justify-center items-center tiny:gap-2 sm:gap-6">
          <button
            className="rounded-lg text-base h-12 w-48 border-2 bg-slate-gray border-slate-gray text-white hover:bg-white hover:text-slate-gray"
            onClick={cancelChanges}
          >
            Réinitialiser
          </button>
          <button
            className="rounded-lg text-base h-12 w-48 border-2 bg-dark-blue border-dark-blue text-white hover:bg-white hover:text-dark-blue"
            onClick={saveChanges}
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  )
}

export default Information
