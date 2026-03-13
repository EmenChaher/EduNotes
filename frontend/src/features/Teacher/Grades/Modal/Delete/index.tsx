import Modal from "@src/components/Modal"
import { message } from "antd"
import { useEffect } from "react"
import { TableData } from "@src/components/Table"
import { useAppDispatch, useAppSelector } from "@src/store"
import Spinner from "@src/components/Spinner"
import { deleteGrade } from "@src/store/slices/teacher/grades/thunk"
import { useParams } from "react-router-dom"
import { restoreDelete } from "@src/store/slices/teacher/grades/slice"
import { transformedSubjectTypeContentDictionary, transformedSubjectTypeDictionary } from "@src/models/subject"

interface IDeleteGrade {
  open: boolean
  item: TableData
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DeleteGrade: React.FC<IDeleteGrade> = ({ open, item, setOpen }) => {
  const { status, error } = useAppSelector((state) => state.teacher.grades.delete)
  const { classId, subjectId, subjectType, subjectContent } = useParams()

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restoreDelete())
  }, [open, dispatch])

  useEffect(() => {
    if (error) {
      message.error(`Échec lors de la suppression du note. Veuillez réessayer.`)
      console.log("Error while deleting grade:", error)
    }
  }, [error])

  useEffect(() => {
    if (status === "succeeded") {
      message.success("La note a été supprimé avec succès.")
      setOpen(false)
    }
  }, [status, setOpen])

  const loading = status === "loading"

  const closeModal = () => {
    setOpen(false)
  }

  const handleSubmit = () => {
    dispatch(
      deleteGrade({
        gradeId: item.id,
        classId: classId!,
        subjectId: subjectId!,
        subjectType: transformedSubjectTypeDictionary[subjectType!],
        subjectContent: transformedSubjectTypeContentDictionary[subjectContent!],
      }),
    )
  }

  return (
    <Modal open={open} title="Supprimer une note" closeModal={closeModal} destroyOnClose>
      <p className="text-sm font-normal text-slate-gray">
        Êtes-vous certain de vouloir supprimer cette note? Veuillez noter que cette action est irréversible.
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

export default DeleteGrade
