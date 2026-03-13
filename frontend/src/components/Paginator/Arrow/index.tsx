import React from "react"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

interface ArrowProps {
  type: "single" | "double"
  direction: "left" | "right"
  handleClick: () => void
  currentPage: number
  totalPages: number
  pageLoading: boolean
}

const Arrow: React.FC<ArrowProps> = ({ type, direction, handleClick, currentPage, totalPages, pageLoading }) => {
  const IconComponent = direction === "left" ? IoIosArrowBack : IoIosArrowForward

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  const canBeClicked = (!pageLoading && direction === "left" && !isFirstPage) || (direction === "right" && !isLastPage)

  const handleArrowClick = () => {
    if (canBeClicked) {
      handleClick()
    }
  }

  return type === "single" ? (
    <IconComponent
      className={`size-4 fill-slate-gray ${canBeClicked ? "hover:fill-black hover:cursor-pointer" : "hover:cursor-not-allowed"}`}
      onClick={handleArrowClick}
    />
  ) : (
    <div className="flex group" onClick={handleArrowClick}>
      <IconComponent
        className={`size-4 fill-slate-gray ${direction === "left" && "-mx-3"} ${
          canBeClicked ? "group-hover:fill-black group-hover:cursor-pointer" : "group-hover:cursor-not-allowed"
        }`}
      />
      <IconComponent
        className={`size-4 fill-slate-gray ${direction === "right" && "-mx-3"} ${
          canBeClicked ? "group-hover:fill-black group-hover:cursor-pointer" : "group-hover:cursor-not-allowed"
        }`}
      />
    </div>
  )
}

export default Arrow
