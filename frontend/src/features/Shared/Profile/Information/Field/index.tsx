import DateField from "./Types/Date"
import SelectField from "./Types/Select"
import TextField from "./Types/Text"

export type ProfileInformationFieldType = "text" | "email" | "phone" | "date" | "select"

interface InformationFieldPropTypes {
  name: string
  label: string
  value: string
  updateInputValue: (name: string, value: string) => void
  type?: ProfileInformationFieldType
  picker?: "date" | "week" | "month" | "quarter" | "year"
  editable?: boolean
  options?: string[]
}

const Field: React.FC<InformationFieldPropTypes> = ({ name, label, value, updateInputValue, type, options, picker = "date", editable = false }) => {
  switch (type) {
    case "text":
    case "email":
    case "phone":
      return <TextField name={name} label={label} updateInputValue={updateInputValue} value={value} type={type} editable={editable} />
    case "date":
      return <DateField name={name} label={label} picker={picker} updateInputValue={updateInputValue} value={value} editable={editable} />
    case "select":
      return options ? (
        <SelectField name={name} label={label} updateInputValue={updateInputValue} value={value} options={options} editable={editable} />
      ) : null
    default:
      return <TextField name={name} label={label} updateInputValue={updateInputValue} value={value} editable={editable} />
  }
}

export default Field
