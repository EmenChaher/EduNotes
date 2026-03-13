interface LayoutHeaderPropTypes {
  title: string
}

const LayoutHeader: React.FC<LayoutHeaderPropTypes> = ({ title }) => {
  return (
    <div className="tiny:mb-4 sm:mb-6 lg:mb-8">
      <p className="text-dark-blue text-2xl font-semibold select-none">{title}</p>
    </div>
  )
}

export default LayoutHeader
