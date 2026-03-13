import Modal from "@src/components/Modal"
import { message } from "antd"
import { useEffect } from "react"
import { DeleteTableItemModalPropTypes } from "@src/components/Table"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import { restoreDelete } from "@src/store/slices/administrator/subjects/slice"
import { deleteSubject } from "@src/store/slices/administrator/subjects/thunk"

const DeleteSubject: React.FC<DeleteTableItemModalPropTypes> = ({ open, page, item, setOpen }) => {
  const {
    delete: { status, error },
  } = useAppSelector((state) => state.administrator.subjects)
  const dispatch = useAppDispatch()

  // Safety check - if item is null, don't render the modal content
  if (!item) {
    return null
  }

  useEffect(() => {
    dispatch(restoreDelete())
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la suppression du matière. Veuillez réessayer.`)
      console.log("Error while deleting subject:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La matière a été supprimé avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = () => {
    dispatch(deleteSubject({ id: item.id, page }))
  }

  return (
    <Modal open={open} title="Supprimer votre matière" closeModal={closeModal} destroyOnClose>
      <p className="text-sm font-normal text-slate-gray">
        Êtes-vous certain de vouloir supprimer la matière <span className="font-bold">{item.subject}</span> ? Veuillez noter que cette action est
        irréversible.
      </p>

      <div className="flex justify-center items-center">
        <button
          className="rounded-lg border-2 border-danger-red bg-danger-red tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/2 hover:bg-white group flex justify-center items-center gap-4 focus:brightness-95"
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
        >
          <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-danger-red">Supprimer</p>
          {loading && <Spinner className="white hover danger-red" />}
        </button>
      </div>
    </Modal>
  )
}

export default DeleteSubject
