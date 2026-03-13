import Modal from "@src/components/Modal"
import { message } from "antd"
import { useEffect } from "react"
import { TableData } from "@src/components/Table"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import { restorePromote } from "@src/store/slices/administrator/users/slice"
import { promoteUser } from "@src/store/slices/administrator/users/thunk"

export interface PromoteUserModalPropTypes {
  open: boolean
  item: TableData
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PromoteUser: React.FC<PromoteUserModalPropTypes> = ({ open, item, setOpen }) => {
  const user = useAppSelector((state) => state.auth.user)
  const {
    promote: { status, error },
  } = useAppSelector((state) => state.administrator.users)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restorePromote())
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la promotion de l'utilisateur. Veuillez réessayer.`)
      console.log("Error while promoting user:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("L'utilisateur a été promu avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = () => {
    dispatch(promoteUser({ previousSuperAdminId: (user! as any)._id, id: item.id }))
  }

  return (
    <Modal open={open} title="Promouvoir votre utilisateur" closeModal={closeModal} destroyOnClose>
      <p className="text-sm font-normal text-slate-gray">
        Êtes-vous certain de vouloir promouvoir l'utilisateur{" "}
        <span className="font-bold">
          {item.name} {item.surname}{" "}
        </span>{" "}
        ? Cette action est irréversible.
      </p>

      <div className="flex justify-center items-center">
        <button
          className="rounded-lg border-2 border-[#FFD700] bg-[#FFD700] tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:bg-white group flex justify-center items-center gap-4 focus:brightness-95"
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
        >
          <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-[#FFD700]">Promouvoir</p>
          {loading && <Spinner className="white hover golden" />}
        </button>
      </div>
    </Modal>
  )
}

export default PromoteUser
