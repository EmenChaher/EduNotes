import React, { useState, useRef, useEffect } from "react"
import { IoIosCheckmarkCircle } from "react-icons/io"
import { SlArrowUp } from "react-icons/sl"
import { Select as AntdSelect } from "antd"
import { SelectOptionType } from ".."

const { Option } = AntdSelect

interface SelectPropTypes {
  name: string
  error?: string
  touched?: boolean
  placeholder: string
  validation?: boolean
  defaultValue?: string
  onPopupScroll?: React.UIEventHandler<HTMLDivElement>
  onChange?: (value: string, option: { label: string; value: string }[]) => void
  options: SelectOptionType[]
  disabled?: boolean
  setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
}

const Select: React.FC<SelectPropTypes> = ({
  name,
  placeholder,
  error,
  touched,
  validation,
  options,
  defaultValue,
  onPopupScroll,
  onChange,
  disabled = false,
  setFieldTouched,
  setFieldValue,
}) => {
  const [selecting, setSelecting] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const actualSelectRef = useRef(null)
  const [wasSelectFocused, setWasSelectFocused] = useState(false)
  const isInvalid = touched && error

  const [value, setValue] = useState(placeholder)

  const handleOpenSelector = () => {
    if (disabled) return
    setSelecting(true)
  }

  const handleCloseSelector = () => {
    if (disabled) return
    setSelecting(false)
  }

  const handleSelectChange = (label: string, option: any) => {
    if (disabled) return
    setTimeout(() => {
      setSelecting(false)
      setValue(option.label)
      setFieldValue(name, option.key)
    }, 200)
    if (onChange) onChange(label, option)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === "Tab") {
      setSelecting(false)
    }
  }

  const handleFocus = () => {
    if (disabled) return
    setSelecting(true)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setSelecting(false)
      }
    }

    if (selecting) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
      if (wasSelectFocused && !touched) setFieldTouched(name, true)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selecting])

  const filterOption = (input: string, option?: { label: string; value: string }) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())

  return (
    <div className={`flex gap-3 w-full ${disabled ? "hover:cursor-not-allowed" : ""}`} ref={selectRef}>
      <div className="w-full flex" tabIndex={0} onFocus={handleFocus} onKeyDown={handleKeyDown}>
        {selecting ? (
          <div className="relative inline-block w-full flex-1">
            <AntdSelect
              style={{ position: "absolute", width: "100%", border: "none", backgroundColor: "transparent" }}
              open={selecting}
              autoFocus
              ref={actualSelectRef}
              onPopupScroll={onPopupScroll && ((e) => onPopupScroll(e))}
              defaultValue={defaultValue}
              showSearch
              placement="bottomRight"
              variant="borderless"
              disabled={disabled}
              placeholder={placeholder}
              onChange={handleSelectChange}
              listHeight={128}
              suffixIcon={<></>}
              optionFilterProp="label"
              filterOption={filterOption}
              onFocus={() => {
                if (!wasSelectFocused) setWasSelectFocused(true)
              }}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
              labelRender={(selectLabel) => (
                <p className="text-slate-gray font-normal tiny:text-xs sm:text-base flex-1 bg-transparent w-1 h-full">{selectLabel.label}</p>
              )}
            >
              {options.map((option) => {
                const key = typeof option === "string" ? option : option.key
                const value = typeof option === "string" ? option : option.value

                return (
                  <Option key={key} value={key} label={value} ref={selectRef}>
                    {value}
                  </Option>
                )
              })}
            </AntdSelect>
          </div>
        ) : (
          <p className="text-slate-gray font-normal tiny:text-xs sm:text-base flex-1 bg-transparent w-1 h-full">{value}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {validation && touched && !isInvalid && <IoIosCheckmarkCircle className="size-6 fill-success-green" />}
      </div>
      {!disabled && (
        <div className="flex justify-center items-center">
          <SlArrowUp
            className={`size-4 fill-dark-blue hover:cursor-pointer transition-transform transform ${selecting ? "rotate-180" : "rotate-0"}`}
            onClick={selecting ? handleCloseSelector : handleOpenSelector}
          />
        </div>
      )}
    </div>
  )
}

export default Select
