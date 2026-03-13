import { useState } from "react"
import { IoIosCheckmarkCircle } from "react-icons/io"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { Field } from "formik"

interface PasswordPropTypes {
  name: string
  error?: string
  touched?: boolean
  placeholder: string
  validation?: boolean
}

const Password: React.FC<PasswordPropTypes> = ({ name, placeholder, error, touched, validation }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState)
  }

  const isInvalid = touched && error

  return (
    <div className="flex gap-3 w-full">
      <Field
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="text-slate-gray font-normal tiny:text-xs sm:text-base flex-1 bg-transparent w-1 h-full"
      />
      <div className="flex items-center gap-2">
        {validation && touched && !isInvalid && <IoIosCheckmarkCircle className="size-6 fill-success-green" />}
      </div>
      <div className="flex items-center gap-2">
        <div>
          {showPassword ? (
            <FiEyeOff className="size-4 stroke-black opacity-70 hover:opacity-100 hover:cursor-pointer" onClick={handleTogglePasswordVisibility} />
          ) : (
            <FiEye className="size-4 stroke-black opacity-70 hover:opacity-100 hover:cursor-pointer" onClick={handleTogglePasswordVisibility} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Password
