import Text from "./Text"
import Password from "./Password"
import Select from "./Select"
import Datepicker from "./Datepicker"
import { IconType } from "react-icons"
import { FaStarOfLife } from "react-icons/fa"

export type SelectOptionType = string | { key: string; value: string }

interface FormInputPropTypes {
  label: string
  type?: string
  picker?: "date" | "week" | "month" | "quarter" | "year"
  name: string
  error?: string
  touched?: boolean
  placeholder: string
  disabled?: boolean
  prefixIcon?: IconType | string
  options?: SelectOptionType[]
  required?: boolean
  validation?: boolean
  defaultValue?: string
  labelGap?: string
  height?: string
  onPopupScroll?: React.UIEventHandler<HTMLDivElement>
  onChange?: (value: string, option: { label: string; value: string }[]) => void
  setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void
}

const Input: React.FC<FormInputPropTypes> = ({
  label,
  type = "text",
  picker = "date",
  name,
  labelGap = "tiny:gap-1 lg:gap-3",
  height = "h-14",
  placeholder,
  disabled = false,
  error,
  touched,
  prefixIcon,
  defaultValue,
  options,
  required,
  validation,
  setFieldValue,
  onPopupScroll,
  onChange,
  setFieldTouched,
}) => {
  const getInputField = () => {
    switch (type) {
      case "password":
        return <Password name={name} placeholder={placeholder} error={error} touched={touched} validation={validation} />
      case "select":
        return (
          setFieldTouched &&
          setFieldValue && (
            <Select
              name={name}
              placeholder={placeholder}
              error={error}
              touched={touched}
              disabled={disabled}
              validation={validation}
              onPopupScroll={onPopupScroll}
              onChange={onChange}
              defaultValue={defaultValue}
              options={options!}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue!}
            />
          )
        )
      case "date":
        return (
          setFieldTouched &&
          setFieldValue && (
            <Datepicker
              name={name}
              placeholder={placeholder}
              error={error}
              picker={picker}
              touched={touched}
              validation={validation}
              setFieldTouched={setFieldTouched}
              setFieldValue={setFieldValue!}
            />
          )
        )
      default:
        return <Text name={name} disabled={disabled} placeholder={placeholder} error={error} touched={touched} validation={validation} />
    }
  }

  const Icon = prefixIcon
  const isInvalid = touched && error

  return (
    <div className="flex flex-col flex-1">
      <div className={`flex flex-col ${labelGap}`}>
        <div className="text-slate-gray tiny:text-xs sm:text-base font-medium select-none">
          <div className="flex gap-1">
            <p className="text-[0.8rem]">{label}</p> {required && <FaStarOfLife className="size-2 fill-red-500 text-lg" />}
          </div>
        </div>
        <div className={`flex gap-3 items-center ${height} rounded-lg box-border px-3 border-2 ${isInvalid ? "border-red-500" : "border-dark-blue"}`}>
          {Icon && (typeof Icon === "string" ? <img src={Icon} alt="input icon" /> : <Icon className="size-6 fill-slate-gray" />)}
          {getInputField()}
        </div>
      </div>
      <p className={`${isInvalid ? "block" : "invisible"} text-red-500 font-bold select-none text-[0.8rem]`}>{isInvalid || "Error placeholder"}</p>
    </div>
  )
}

export default Input
