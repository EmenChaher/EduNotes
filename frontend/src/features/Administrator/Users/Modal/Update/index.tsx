import Modal from "@src/components/Modal"
import { message } from "antd"
import { Fragment, useEffect, useRef, useState } from "react"
import { UpdateTableItemModalPropTypes } from "@src/components/Table"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import { restoreUpdate } from "@src/store/slices/administrator/users/slice"
import { Form, Formik } from "formik"
import Input from "@src/components/Input"
import { IUser, UserTypes, userTypeDictionary } from "@src/models/user"
import * as Yup from "yup"
import updateUserInputs, { UserInput } from "./Inputs"
import { updateUser } from "@src/store/slices/administrator/users/thunk"
import ClassAsyncSelect from "../../ClassAsyncSelect"

const UpdateUser: React.FC<UpdateTableItemModalPropTypes> = ({ open, item, setOpen }) => {
  const [filteredInputs, setFilteredInputs] = useState<UserInput[] | null>(null)
  const [filteredInitialValues, setFilteredInitialValues] = useState<{ [key in keyof IUser]: string } | null>(null)
  const [filteredSchemas, setFilteredSchemas] = useState<Yup.AnyObject | null>(null)
  const formikRef = useRef<any>(null)

  useEffect(() => {
    if (item.type) {
      const inputs = updateUserInputs.filter((input) => {
        return !input.requiredTypes || input.requiredTypes.includes(item.type)
      })
      const initialValues = inputs.reduce(
        (acc, { name }) => {
          if (name === "type") {
            return {
              ...acc,
              [name]: userTypeDictionary[item[name] as UserTypes] || "",
            }
          }
          return {
            ...acc,
            [name]: item[name] || "",
          }
        },
        {} as { [key in keyof IUser]: string },
      )

      if (item.type === UserTypes.Student && item.class) {
        initialValues.class = item.class._id
      }

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
  }, [item])

  const compareObjects = (obj1: any, obj2: any) => {
    for (let key in obj1) {
      if (obj1[key] !== obj2[key]) {
        return false
      }
    }
    return true
  }

  const {
    update: { status, error },
  } = useAppSelector((state) => state.administrator.users)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restoreUpdate())
    formikRef.current?.resetForm()
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la mise à jour de l'utilisateur. Veuillez réessayer.`)
      console.log("Error while updating user:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("L'utilisateur a été mis à jour avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = (values: typeof filteredInitialValues) => {
    if (compareObjects(filteredInitialValues, values)) return message.error("Vous n'avez apporté aucune modification.")
    const query: typeof filteredInitialValues = {} as typeof filteredInitialValues

    for (const key in values) {
      const valueKey = key as keyof IUser
      if (values[valueKey] !== filteredInitialValues![valueKey]) {
        query![valueKey] = values[valueKey]!
      }
    }
    dispatch(updateUser({ id: item.id, query: query! }))
  }

  if (filteredInputs === null) {
    return <Spinner fullscreen />
  }

  return (
    <Modal open={open} title="Mettre à jour un utilisateur" closeModal={closeModal} destroyOnClose>
      <Formik
        initialValues={filteredInitialValues!}
        validationSchema={filteredSchemas!}
        onSubmit={(values) => {
          handleSubmit(values)
        }}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldTouched, setFieldValue }) => (
          <Form noValidate className="login-form flex flex-col w-full gap-6">
            <div className="flex flex-col gap-y-2 tiny:gap-x-1 md:gap-x-3 lg:gap-x-4">
              {filteredInputs.map((field) => {
                const placeholder = field.label.charAt(0).toLowerCase() + field.label.slice(1)
                if (field.name === "type") {
                  field.options = Object.values(UserTypes)
                    .filter((userType) => userType !== UserTypes.SuperAdmin)
                    .map((userType) => ({
                      key: userType,
                      value: userTypeDictionary[userType],
                    }))
                }
                return (
                  <Fragment key={field.name}>
                    <Input
                      prefixIcon={field.icon}
                      height="tiny:h-10 sm:h-12"
                      labelGap="gap-1"
                      touched={touched[field.name]}
                      error={errors[field.name]}
                      label={field.label}
                      name={field.name}
                      defaultValue={values[field.name]}
                      placeholder={values[field.name] || `Entrez le ${placeholder}`}
                      type={field.type}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      disabled={field.disabled}
                      picker={field.picker ? field.picker : undefined}
                      options={field.type === "select" ? field.options : undefined}
                    />
                    {item.type === UserTypes.Student && field.name === "type" && (
                      <ClassAsyncSelect
                        setFieldTouched={setFieldTouched}
                        setFieldValue={setFieldValue}
                        error={errors.class}
                        touched={touched.class}
                        defaultValue={values.class}
                        placeholder={`${item?.class?.level?.label || ""} ${item?.class?.level?.studyField?.acronym || ""} ${item?.class?.label || ""}`}
                        name="class"
                      />
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div className="flex justify-center items-center gap-3">
              <button
                className="rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group tiny:h-10 sm:h-12 tiny:w-3/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
                type="submit"
                disabled={loading}
              >
                <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Mettre à jour</p>
                {loading && <Spinner className="white hover dark-blue" />}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default UpdateUser
