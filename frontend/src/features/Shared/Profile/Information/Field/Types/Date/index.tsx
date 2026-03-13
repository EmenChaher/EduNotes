import { useEffect, useRef, useState } from "react"
import { SlCalender } from "react-icons/sl"
import type { DatePickerProps } from "antd"
import { DatePicker } from "antd"

interface DataFieldPropTypes {
  name: string
  label: string
  value: string
  picker: "date" | "week" | "month" | "quarter" | "year"
  updateInputValue: (name: string, value: string) => void
  editable: boolean
}

const DateField: React.FC<DataFieldPropTypes> = ({ name, label, value, picker, updateInputValue, editable }) => {
  const [selectingDate, setSelectingDate] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const handleEditClick = () => {
    setSelectingDate(!selectingDate)
  }

  const onDatePick: DatePickerProps["onChange"] = (_, dateString) => {
    if (typeof dateString === "string") {
      setTimeout(() => {
        setSelectingDate(false)
        updateInputValue(name, dateString)
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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectingDate])

  return (
    <div className="flex w-full h-12 border-l-4 border-dark-blue shadow-[0px_0px_15px_0px_#D2D1D199] rounded-md px-3" ref={selectRef}>
      <div className="flex flex-col flex-1 h-full">
        <p className="text-xs flex items-center font-semibold h-1/2 flex-1 text-slate-gray select-none">{label}</p>
        {selectingDate ? (
          <div className="relative inline-block w-full flex-1">
            <DatePicker
              style={{ position: "absolute", width: "100%", border: "none", backgroundColor: "transparent" }}
              open={selectingDate}
              picker={picker}
              autoFocus
              placement="bottomRight"
              variant="borderless"
              placeholder="Select date"
              onChange={onDatePick}
              suffixIcon={<></>}
              getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
            />
          </div>
        ) : (
          <p className="tiny:text-xs sm:text-sm flex items-center font-normal h-1/2 flex-1 text-slate-gray">{value}</p>
        )}
      </div>
      {editable && (
        <div className="flex justify-center items-center">
          <SlCalender className="size-6 fill-dark-blue hover:cursor-pointer h-full" onClick={handleEditClick} />
        </div>
      )}
    </div>
  )
}

export default DateField
