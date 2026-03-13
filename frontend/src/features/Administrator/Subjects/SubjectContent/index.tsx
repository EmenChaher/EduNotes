import React, { useState } from "react"
import { Checkbox, CheckboxProps } from "antd"

interface SubjectContentPropTypes {
  label: string
  name: string
  defaultChecked?: boolean
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}

const SubjectContent: React.FC<SubjectContentPropTypes> = ({ label, name, defaultChecked = false, setFieldTouched, setFieldValue }) => {
  const [checked, setChecked] = useState(defaultChecked)

  const onCheckboxChange: CheckboxProps["onChange"] = (e) => {
    setChecked(e.target.checked)
    setFieldTouched(name, true)
    setFieldValue(name, e.target.checked)
  }

  return (
    <div className="flex flex-1 gap-3 items-center min-h-[34px]">
      <Checkbox checked={checked} onChange={onCheckboxChange} className="min-w-24">
        <p className="text-slate-gray text-sm font-medium select-none">{label}</p>
      </Checkbox>
    </div>
  )
}

export default SubjectContent
