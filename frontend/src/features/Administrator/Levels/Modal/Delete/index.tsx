import React, { useEffect } from "react"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { DeleteTableItemModalPropTypes } from "@src/components/Table"
import { deleteLevel, fetchLevelRelatedData } from "@src/store/slices/administrator/levels/thunk"
import { restoreDelete } from "@src/store/slices/administrator/levels/slice"
import { CgDanger } from "react-icons/cg"

const DeleteLevel: React.FC<DeleteTableItemModalPropTypes> = ({ open, setOpen, item, page }) => {
  const dispatch = useAppDispatch()
  const {
    delete: { status, error, relatedData },
  } = useAppSelector((state) => state.administrator.levels)

  useEffect(() => {
    dispatch(fetchLevelRelatedData(item.id))
    dispatch(restoreDelete())
  }, [dispatch, item.id])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la suppression du niveau : ${error}`)
      console.log("Error while deleting level:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("Le niveau a été supprimé avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleDelete = () => {
    dispatch(deleteLevel({ id: item.id, page }))
  }

  const loading = status === "loading"
  const hasClasses = relatedData?.classes && relatedData.classes.length > 0
  const hasUnits = relatedData?.units && relatedData.units.length > 0
  const disabled = loading || hasClasses || hasUnits

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <Modal open={open} title="Supprimer le niveau" closeModal={closeModal} destroyOnClose>
      <div className="flex flex-col gap-5 items-center">
        <p className="text-center text-slate-gray font-medium">
          Êtes-vous sûr de vouloir supprimer le niveau <span className="text-dark-blue font-semibold">{item.label}</span> ?
        </p>
        {hasClasses && (
          <div className="flex items-center gap-2 bg-red-100 rounded-lg p-4 text-red-600 w-full">
            <CgDanger className="size-5" />
            <p className="text-red-600">
              Ce niveau ne peut pas être supprimé car il est utilisé par {relatedData?.classes?.length || 0} classe(s).
            </p>
          </div>
        )}
        {hasUnits && (
          <div className="flex items-center gap-2 bg-red-100 rounded-lg p-4 text-red-600 w-full">
            <CgDanger className="size-5" />
            <p className="text-red-600">
              Ce niveau ne peut pas être supprimé car il est associé à {relatedData?.units?.length || 0} unité(s) d'enseignement.
            </p>
          </div>
        )}
        <div className="flex justify-center items-center gap-4 w-full">
          <button
            className="rounded-lg border-2 border-dark-blue bg-white hover:brightness-95 group h-12 w-1/3 flex justify-center items-center"
            onClick={closeModal}
          >
            <p className="text-dark-blue font-semibold">Annuler</p>
          </button>
          <button
            className={`rounded-lg border-2 ${
              disabled ? "bg-gray-400 border-gray-400 hover:cursor-not-allowed" : "bg-red-500 border-red-500 hover:bg-white"
            }  group h-12 w-1/3 hover:brightness-95 flex justify-center items-center gap-2`}
            onClick={handleDelete}
            disabled={disabled}
          >
            <p className={`${disabled ? "text-white" : "text-white group-hover:text-red-500"} font-semibold`}>Supprimer</p>
            {loading && <Spinner />}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteLevel 