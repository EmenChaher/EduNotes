import React, { useState, useRef, useEffect } from "react"
import { SlArrowUp } from "react-icons/sl"
import { Select } from "antd"

interface SelectFieldPropTypes {
  name: string
  label: string
  value: string
  updateInputValue: (name: string, value: string) => void
  options: string[]
  editable: boolean
}

const { Option } = Select

const SelectField: React.FC<SelectFieldPropTypes> = ({ name, label, value, options, updateInputValue, editable }) => {
  const [selecting, setSelecting] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const handleOpenSelector = () => {
    setSelecting(true)
  }

  const handleCloseSelector = () => {
    setSelecting(false)
  }

  const handleSelectChange = (newValue: string) => {
    setTimeout(() => {
      setSelecting(false)
      updateInputValue(name, newValue)
    }, 200)
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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selecting])

  return (
    <div className="flex w-full h-12 border-l-4 border-dark-blue shadow-[0px_0px_15px_0px_#D2D1D199] rounded-md px-3" ref={selectRef}>
      <div className="flex flex-col flex-1 h-full">
        <p className="text-xs flex items-center font-semibold h-1/2 flex-1 text-slate-gray select-none">{label}</p>
        {selecting ? (
          <div className="relative inline-block w-full flex-1">
            <Select
              style={{ position: "absolute", width: "100%", border: "none", backgroundColor: "transparent" }}
              open={selecting}
              autoFocus
              showSearch
              placement="bottomRight"
              variant="borderless"
              placeholder="Select region"
              onChange={handleSelectChange}
              value={value}
              listHeight={128}
              suffixIcon={<></>}
              getPopupContainer={(triggerNode) => triggerNode.parentElement}
            >
              {options.map((option) => (
                <Option key={option} value={option} ref={selectRef}>
                  {option}
                </Option>
              ))}
            </Select>
          </div>
        ) : (
          <p className="tiny:text-xs sm:text-sm flex items-center font-normal h-1/2 flex-1 text-slate-gray">{value}</p>
        )}
      </div>
      {editable && (
        <div className="flex justify-center items-center">
          <SlArrowUp
            className={`h-full size-4 fill-dark-blue hover:cursor-pointer transition-transform transform ${selecting ? "rotate-180" : "rotate-0"}`}
            onClick={selecting ? handleCloseSelector : handleOpenSelector}
          />
        </div>
      )}
    </div>
  )
}

export default SelectField
