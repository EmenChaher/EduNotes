import React, { useEffect } from "react"
import Arrow from "./Arrow"

interface PaginatorProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  setCurrentPage: (page: number) => void
  pageLoading?: boolean
  hideOnSinglePage?: boolean
}

const Paginator: React.FC<PaginatorProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  pageLoading = false,
  hideOnSinglePage = true,
}) => {
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1)

  const handlePageChange = (page: number) => {
    if (!pageLoading) {
      setCurrentPage(page)
    }
  }

  const handlePrevious = () => {
    if (!pageLoading && currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleJumpPrevious = () => {
    if (!pageLoading && currentPage > 1) {
      handlePageChange(1)
    }
  }

  const handleNext = () => {
    if (!pageLoading && currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  const handleJumpNext = () => {
    if (!pageLoading && currentPage < totalPages) {
      handlePageChange(totalPages)
    }
  }

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages])

  if (hideOnSinglePage && totalPages <= 1) return <></>

  return (
    <div className="flex justify-center items-center my-16">
      <div className="flex gap-4 justify-center items-center">
        <div className="flex gap-2">
          <Arrow
            type="double"
            direction="left"
            handleClick={handleJumpPrevious}
            currentPage={currentPage}
            totalPages={totalPages}
            pageLoading={pageLoading}
          />
          <Arrow
            type="single"
            direction="left"
            handleClick={handlePrevious}
            currentPage={currentPage}
            totalPages={totalPages}
            pageLoading={pageLoading}
          />
        </div>
        {[...Array(totalPages)].map((_, index) => (
          <div key={index} className="flex justify-center items-center gap-1">
            <button
              className={`flex justify-center items-center rounded-full select-none text-sm size-6 ${
                currentPage === index + 1 ? "bg-dark-blue text-white" : "text-slate-gray hover:border-slate-gray border-transparent border-[1px]"
              } ${pageLoading && "hover:cursor-not-allowed"}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Arrow
            type="single"
            direction="right"
            handleClick={handleNext}
            currentPage={currentPage}
            totalPages={totalPages}
            pageLoading={pageLoading}
          />
          <Arrow
            type="double"
            direction="right"
            handleClick={handleJumpNext}
            currentPage={currentPage}
            totalPages={totalPages}
            pageLoading={pageLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default Paginator
