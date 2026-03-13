import { useState } from "react"
import { MdOutlineModeEdit } from "react-icons/md"
import { ImCheckmark } from "react-icons/im"
import { ImCross } from "react-icons/im"
import * as Yup from "yup"

interface TextFieldPropTypes {
  name: string
  label: string
  value: string
  updateInputValue: (name: string, value: string) => void
  type?: "text" | "email" | "phone"
  editable: boolean
}

const validationSchema = {
  text: Yup.string()
    .matches(/^[a-zA-Z\s]*$/, "Champ invalide.")
    .max(30, "Le champ ne doit pas dépasser 30 caractères.")
    .required("Champ requis."),
  email: Yup.string()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Veuillez saisir une adresse email valide.")
    .required("Veuillez saisir votre adresse email."),
  phone: Yup.string()
    .required("Veuillez saisir votre numéro de téléphone.")
    .matches(/^\d{8}$/, "Veuillez saisir un numéro de téléphone valide."),
}

const TextField: React.FC<TextFieldPropTypes> = ({ name, label, value, type = "text", editable, updateInputValue }) => {
  const [editing, setEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)
  const [pendingInputValue, setPendingInputValue] = useState(value)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingInputValue(event.target.value)
  }

  const handleEditClick = () => {
    setEditing(true)
  }
  const cancelEditClick = () => {
    setEditing(false)
    setError(null)
    setPendingInputValue(editedValue)
  }

  const handleSaveClick = () => {
    const validate = validationSchema[type]
    if (validate) {
      try {
        validate.validateSync(pendingInputValue)
        setError(null)
        setEditing(false)
        setEditedValue(pendingInputValue)
        updateInputValue(name, pendingInputValue)
      } catch (err: any) {
        setError(err.message)
      }
    }
  }

  return (
    <div>
      <div className="flex flex-1 h-12 border-l-4 border-dark-blue shadow-[0px_0px_15px_0px_#D2D1D199] rounded-md px-3">
        <div className="flex flex-col flex-1 h-full">
          <p className="text-xs flex items-center font-semibold h-1/2 flex-1 text-slate-gray select-none">{label}</p>
          {editing ? (
            <input
              type="text"
              value={pendingInputValue}
              onChange={handleInputChange}
              className="text-sm flex items-center font-normal h-1/2 flex-1 text-slate-gray outline-none border-b border-slate-gray bg-transparent tiny:w-[35vw] xs:w-[50vw] sm:w-auto"
            />
          ) : (
            <p className="tiny:text-xs sm:text-sm flex items-center font-normal h-1/2 flex-1 text-slate-gray">{value}</p>
          )}
        </div>
        {editable && (
          <div className="flex justify-center items-center gap-2">
            {editing ? (
              <>
                <ImCheckmark className="size-6 fill-success-green hover:cursor-pointer " onClick={handleSaveClick} />
                <ImCross className="size-6 fill-red-500 hover:cursor-pointer hover:brightness-90" onClick={cancelEditClick} />
              </>
            ) : (
              <MdOutlineModeEdit className="h-full size-6 fill-dark-blue hover:cursor-pointer hover:brightness-90" onClick={handleEditClick} />
            )}
          </div>
        )}
      </div>
      <p className={`${error ? "block" : "hidden"} text-red-500 font-bold`}>{error || "Error placeholder"}</p>
    </div>
  )
}

export default TextField
