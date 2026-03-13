import React, { useState } from "react"
import { Checkbox, CheckboxProps, InputNumber, Slider } from "antd"

interface GradingSliderPropTypes {
  label: string
  name: string
  defaultChecked?: boolean
  defaultValue?: number
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}

const GradingSlider: React.FC<GradingSliderPropTypes> = ({ label, name, defaultChecked = false, defaultValue = 0, setFieldTouched, setFieldValue }) => {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [checked, setChecked] = useState(defaultChecked)

  const handleSliderChange = (newValue: any) => {
    setInputValue(newValue as number)
    setFieldTouched(name, true)
    setFieldValue(name, newValue)
  }

  const onCheckboxChange: CheckboxProps["onChange"] = (e) => {
    setChecked(e.target.checked)
  }

  return (
    <div className="flex flex-1 gap-3 items-center min-h-[34px]">
      <Checkbox checked={checked} onChange={onCheckboxChange} className="min-w-24">
        <p className="text-slate-gray text-sm font-medium select-none">{label}</p>
      </Checkbox>
      {checked && (
        <>
          <Slider
            value={typeof inputValue === "number" ? inputValue : 0}
            min={0}
            max={100}
            step={1}
            onChange={handleSliderChange}
            className="flex-1"
          />
          <InputNumber
            min={1}
            max={100}
            step={1}
            value={inputValue}
            onChange={handleSliderChange}
            precision={0}
            className="text-slate-gray hover:border-dark-blue focus:border-dark-blue w-14"
            suffix="%"
          />
        </>
      )}
    </div>
  )
}

export default GradingSlider
