import { Fragment } from "react"
import { Skeleton } from "antd"
import { Link } from "react-router-dom"

interface CardPropTypes {
  id?: string | number
  title: string
  subTitle?: string | string[]
  to?: string
  loading?: boolean
}

const cardWrapperClassname =
  "hover:cursor-pointer hover:-translate-y-0.5 transition-all duration-50 hover:shadow-lg ease-in tiny:col-span-12 sm:col-span-6 xl:col-span-4 2xl:col-span-3 flex-1 h-36 bg-[#E8E8E8] py-3 px-5 flex flex-col justify-between items-center rounded-xl box-border"

const Card: React.FC<CardPropTypes> = ({ id, title, subTitle, to, loading = false }) => {
  const cardElement = (
    <Skeleton active loading={loading}>
      <div className="flex flex-col gap-3 w-full">
        <p className="text-slate-gray text-xl font-semibold">{title}</p>
        {subTitle !== undefined && Array.isArray(subTitle) ? (
          <div className="flex flex-col">
            {subTitle.map((subTitleItem, index) => (
              <p key={index} className="text-slate-gray text-sm font-normal">
                {subTitleItem}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-slate-gray text-sm font-normal">{subTitle}</p>
        )}
      </div>
      <button className="w-28 h-7 text-sm flex justify-center select-none items-center bg-dark-blue border-dark-blue border-2 text-white hover:text-dark-blue hover:bg-white rounded-lg">
        Sélectionner
      </button>
    </Skeleton>
  )

  return (
    <Fragment key={id}>
      {to ? (
        <Link className={cardWrapperClassname} to={to}>
          {cardElement}
        </Link>
      ) : (
        <div className={cardWrapperClassname}>{cardElement}</div>
      )}
    </Fragment>
  )
}

export default Card
