import React, { useEffect } from "react"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Modal from "@src/components/Modal"
import { DeleteTableItemModalPropTypes } from "@src/components/Table"
import { deleteDiploma } from "@src/store/slices/administrator/diplomas/thunk"
import { restoreDelete } from "@src/store/slices/administrator/diplomas/slice"
import Spinner from "@src/components/Spinner"

const DeleteDiploma: React.FC<DeleteTableItemModalPropTypes> = ({ open, setOpen, item, page }) => {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.administrator.diplomas).delete
  const loading = status === "loading"

  useEffect(() => {
    if (open) {
      dispatch(restoreDelete())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec de la suppression : ${error}`)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("Le diplôme a été supprimé avec succès")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleDelete = () => {
    dispatch(deleteDiploma({ id: item.id, page }))
  }

  return (
    <Modal open={open} title="Supprimer le diplôme" closeModal={() => setOpen(false)} destroyOnClose>
      <div className="flex flex-col items-center gap-8">
        <p className="text-center">
          Êtes-vous sûr de vouloir supprimer le diplôme <b>{item.label}</b> ?<br />
          Cette action est irréversible.
        </p>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border-2 border-dark-blue bg-white hover:bg-gray-50 tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/3 flex justify-center items-center"
          >
            <p className="text-dark-blue font-semibold tiny:text-sm xs:text-base sm:text-lg select-none">Annuler</p>
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 tiny:h-10 sm:h-12 tiny:w-2/5 sm:w-1/3 flex justify-center items-center gap-4"
          >
            <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none">Supprimer</p>
            {loading && <Spinner />}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteDiploma 