import { Result, ResultProps } from "antd"
import { Link } from "react-router-dom"

interface ErrorPropTypes extends ResultProps {
  button?: { redirect: string; text: string }
  fullcontainer?: boolean
}

const Error: React.FC<ErrorPropTypes> = ({ title, subTitle, status, button, fullcontainer = false }) => {
  return (
    <div className={`${fullcontainer ? "min-h-full" : "min-h-dvh "} flex justify-center items-center`}>
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={
          button && (
            <Link to={button.redirect}>
              <button className="mt-6 border-2 p-2 rounded-lg border-dark-blue bg-dark-blue text-white hover:text-dark-blue hover:bg-white">
                {button.text}
              </button>
            </Link>
          )
        }
      />
    </div>
  )
}

export default Error
