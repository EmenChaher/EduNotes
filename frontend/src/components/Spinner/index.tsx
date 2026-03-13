import { Spin } from "antd"
import { SpinProps } from "antd"
import { Fragment } from "react"

interface CustomSpinProps extends SpinProps {
  fullcontainer?: boolean
}

const Spinner: React.FC<CustomSpinProps> = ({ fullcontainer, ...props }) => {
  const Wrapper = fullcontainer ? "div" : Fragment
  const wrapperProps = fullcontainer ? { className: "flex-1 flex justify-center items-center" } : {}

  return (
    <Wrapper {...wrapperProps}>
      <Spin {...props} />
    </Wrapper>
  )
}

export default Spinner
