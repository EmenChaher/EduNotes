import React, { useState, useRef, useEffect } from "react"
import { SlCalender } from "react-icons/sl"
import { IoIosCheckmarkCircle } from "react-icons/io"
import { DatePicker } from "antd"
import type { DatePickerProps } from "antd"

interface DatePropTypes {
  name: string
  error?: string
  picker: "date" | "week" | "month" | "quarter" | "year"
  touched?: boolean
  placeholder: string
  validation?: boolean
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}

const Datepicker: React.FC<DatePropTypes> = ({
  name,
  placeholder,
  error,
  touched,
  validation,
  picker,
  setFieldTouched,
  setFieldValue,
}) => {
  const [selectingDate, setSelectingDate] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(placeholder)
  const [wasSelectFocused, setWasSelectFocused] = useState(false)
  const isInvalid = touched && error

  const onDatePick: DatePickerProps["onChange"] = (_, dateString) => {
    if (typeof dateString === "string") {
      setTimeout(() => {
        setSelectingDate(false)
        setValue(dateString)
        setFieldValue(name, dateString)
      }, 200)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setSelectingDate(false)
      }
    }

    if (selectingDate) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
      if (wasSelectFocused && !touched) setFieldTouched(name, true)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectingDate])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      setSelectingDate(false)
    }
  }

  const handleFocus = () => {
    setSelectingDate(true)
  }

  const handleOpenDateSelector = () => {
    setSelectingDate(true)
  }

  const handleCloseDateSelector = () => {
    setSelectingDate(false)
  }

  return (
    <div className="flex gap-3 w-full items-center h-full" ref={selectRef}>
      <div className="w-full flex" tabIndex={0} onFocus={handleFocus} onKeyDown={handleKeyDown}>
        {selectingDate ? (
          <div className="relative inline-block w-full flex-1">
            <DatePicker
              style={{ position: "absolute", width: "100%", border: "none", backgroundColor: "transparent" }}
              open={selectingDate}
              picker={picker}
              autoFocus
              placement="bottomRight"
              variant="borderless"
              placeholder="Sélectionner une date"
              onChange={onDatePick}
              onFocus={() => {
                if (!wasSelectFocused) setWasSelectFocused(true)
              }}
              suffixIcon={<></>}
              getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
            />
          </div>
        ) : (
          <p
            className={`text-slate-gray font-normal tiny:text-xs ${
              placeholder === value ? "sm:text-sm" : "sm:text-base"
            } flex-1 bg-transparent w-1 h-full`}
          >
            {value}
          </p>
        )}
      </div>
      <div className="flex items-center">
        {validation && touched && !isInvalid && <IoIosCheckmarkCircle className="size-6 fill-success-green" />}
      </div>
      <div className="flex justify-center items-center h-full">
        <SlCalender
          className="size-6 fill-dark-blue hover:cursor-pointer h-full"
          onClick={selectingDate ? handleCloseDateSelector : handleOpenDateSelector}
        />
      </div>
    </div>
  )
}

export default Datepicker
