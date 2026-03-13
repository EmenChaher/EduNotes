import securityLogo from "@src/assets/images/profile/security.png"
import { useState } from "react"
import ChangePasswordModal from "./ChangePasswordModal/ChangePasswordModal"

const Security: React.FC = () => {
  const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false)
  return (
    <div className="flex-1 h-fit shadow-[0px_0px_18px_0px_#33333333] rounded-2xl box-border py-5 px-6 flex flex-col gap-8">
      <p className="tiny:text-base sm:text-lg md:text-xl font-semibold text-dark-blue w-full select-none">Sécurité et authentification</p>
      <img className="h-52 object-contain select-none" src={securityLogo} alt="sécurité et authentification" />
      <button
        className="bg-white text-base border-red-500 border-2 text-red-500 rounded-lg h-12 hover:bg-red-500 hover:text-white select-none"
        onClick={() => setPasswordChangeModalOpen(true)}
      >
        Modifier mot de passe
      </button>
      <ChangePasswordModal open={passwordChangeModalOpen} setOpen={setPasswordChangeModalOpen} />
    </div>
  )
}

export default Security
