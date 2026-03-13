import { IoIosCheckmarkCircle } from "react-icons/io"
import { Field } from "formik"

interface TextPropTypes {
  name: string
  error?: string
  touched?: boolean
  placeholder: string
  validation?: boolean
  disabled: boolean
}

const Text: React.FC<TextPropTypes> = ({ name, placeholder, error, touched, validation, disabled }) => {
  const isInvalid = touched && error

  return (
    <div className="flex gap-3 w-full">
      <Field
        type="text"
        name={name}
        disabled={disabled}
        placeholder={placeholder}
        className="text-slate-gray font-normal tiny:text-xs sm:text-base flex-1 bg-transparent w-1 h-full"
      />
      <div className="flex items-center gap-2">
        {validation && touched && !isInvalid && <IoIosCheckmarkCircle className="size-6 fill-success-green" />}
      </div>
    </div>
  )
}

export default Text
