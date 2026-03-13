import React, { useEffect } from "react"
import { message } from "antd"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import Modal from "@src/components/Modal"
import { DeleteTableItemModalPropTypes } from "@src/components/Table"
import { deleteStudyField, fetchStudyFieldRelatedData } from "@src/store/slices/administrator/studyFields/thunk"
import { restoreDelete } from "@src/store/slices/administrator/studyFields/slice"
import { CgDanger } from "react-icons/cg"

const DeleteStudyField: React.FC<DeleteTableItemModalPropTypes> = ({ open, setOpen, item, page }) => {
  const dispatch = useAppDispatch()
  const {
    delete: { status, error, relatedData },
  } = useAppSelector((state) => state.administrator.studyFields)

  useEffect(() => {
    dispatch(fetchStudyFieldRelatedData(item.id))
    dispatch(restoreDelete())
  }, [dispatch, item.id])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la suppression de la filière : ${error}`)
      console.log("Error while deleting study field:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La filière a été supprimée avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const handleDelete = () => {
    dispatch(deleteStudyField({ id: item.id, page }))
  }

  const loading = status === "loading"
  const disabled = loading || relatedData?.levels.length > 0

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <Modal open={open} title="Supprimer la filière" closeModal={closeModal} destroyOnClose>
      <div className="flex flex-col gap-5 items-center">
        <p className="text-center text-slate-gray font-medium">
          Êtes-vous sûr de vouloir supprimer la filière <span className="text-dark-blue font-semibold">{item.label}</span> ?
        </p>
        {relatedData && relatedData.levels.length > 0 && (
          <div className="flex items-center gap-2 bg-red-100 rounded-lg p-4 text-red-600 w-full">
            <CgDanger className="size-5" />
            <p className="text-red-600">
              Cette filière ne peut pas être supprimée car elle est utilisée par {relatedData.levels.length} niveau(x).
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

export default DeleteStudyField 