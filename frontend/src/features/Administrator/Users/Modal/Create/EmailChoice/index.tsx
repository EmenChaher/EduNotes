import { RxCross1, RxDividerVertical } from "react-icons/rx"

interface EmailChoicePropTypes {
  email: string
  removeEmail: (emailToRemove: string) => void
}

const EmailChoice: React.FC<EmailChoicePropTypes> = ({ email, removeEmail }) => {
  const onRemoveClick = (event: any) => {
    event.preventDefault()
    removeEmail(email)
  }

  return (
    <div className="flex flex-row flex-nowrap gap-1 leading-5 w-fit justify-center items-center border text-[#5F6368] break-all box-border px-2.5 py-1 rounded-[50vh] border-solid border-[#5F6368]">
      <p className="text-xs font-medium">{email}</p>
      <RxDividerVertical />
      <button className="hover:text-red-500 select-none" onClick={onRemoveClick}>
        <RxCross1 />
      </button>
    </div>
  )
}
export default EmailChoice
