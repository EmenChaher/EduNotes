import React, { useState } from "react"
import Spinner from "@src/components/Spinner"
import { Image, Upload, message } from "antd"
import { MdDocumentScanner } from "react-icons/md"
import type { UploadFile, UploadProps } from "antd"
import { MdDelete } from "react-icons/md"
import { PaperClipOutlined } from "@ant-design/icons"
import { TbSwitchVertical } from "react-icons/tb"
import { FaHand } from "react-icons/fa6"
import CropperModal from "./CropperModal"
import axiosInstance from "@src/utils/axios"
import DataTable from "./DataTable"

const maxUploadSize = import.meta.env.VITE_APP_MAX_GRADING_FILE_SIZE as number
const { Dragger } = Upload

const GradeReportCreator: React.FC = () => {
  const [cropModalVisible, setCropModalVisible] = useState<boolean>(false)
  const [image, setImage] = useState<{ name: string; url: string } | null | undefined>(null)
  const [cropData, setCropData] = useState<{ width: number; height: number; url: string } | null>(null)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [reportGrades, setReportGrades] = useState<{ id: string; grade: string | number }[] | null>(null)

  const extractGrades = async (imageUrl: string) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post("teacher/extractGrades", { imageUrl })

      if (response.status === 200) {
        console.log("Extracted grades", response.data.data)
        const filteredGrades = response.data.data.filter((item: any) => {
          const grade = item.grade
          return !isNaN(grade) || grade === "DISP" || grade === "ABS"
        })
        setReportGrades(filteredGrades)
        message.success("Les notes ont été extraites avec succès. Veuillez les vérifier.")
        return
      }
    } catch (err: any) {
      let errorMessage = "Impossible d'extraire les notes. Veuillez réessayer."
      if (err.response?.data?.message)
        switch (err.response?.data?.message) {
          case "Unable to extract the grades from this image. Please check the quality of the image or try with another image.":
            errorMessage = "Impossible d'extraire les notes de cette image. Veuillez vérifier la qualité de l'image ou essayer avec une autre image."
            break
          case "Invalid image format.":
            errorMessage = "Format d'image invalide. . Veuillez réessayer avec une autre image."
            break
          default:
            errorMessage = "Une erreur est survenue lors de l'extraction des notes. Veuillez réessayer."
            break
        }
      return message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setFileList([])
    setImage(null)
  }

  const uploadProps: UploadProps = {
    onChange: (info) => {
      setFileList([info.file])
    },
    beforeUpload: async (file) => {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
      const isValidFile = validImageTypes.includes(file.type.toLowerCase())
      if (!isValidFile) {
        message.error(`${file.name} n'est pas une image valide. Les formats acceptés sont: JPEG, PNG, JPG et GIF.`)
        return Upload.LIST_IGNORE
      }
      const isValidSize = file.size / 1024 / 1024 <= maxUploadSize
      if (!isValidSize) {
        message.error(`La taille de l'image ${file.name} dépasse la limite de ${maxUploadSize}MB.`)
        return Upload.LIST_IGNORE
      }
      const reader = new FileReader()
      reader.onload = () => {
        setImage({ name: file.name, url: reader.result as any })
        setCropModalVisible(true)
      }
      reader.readAsDataURL(file)

      return false
    },
  }

  return (
    <>
      {loading && <Spinner fullscreen />}
      <div className="flex flex-1 justify-around flex-col gap-4">
        {reportGrades === null ? (
          <>
            {image && typeof image === "object" && (
              <CropperModal
                image={image?.url}
                open={cropModalVisible}
                setVisible={setCropModalVisible}
                confirmCroppedData={(width, height, url) => setCropData({ width, height, url })}
                onCancel={() => {
                  if (cropData === null) setTimeout(() => removeImage(), 100)
                }}
              />
            )}
            {cropData === null ? (
              <div className="flex gap-4 flex-col items-center flex-1">
                <div
                  className="w-full flex justify-center text-center max-h-[32dvh] items-center p-4 flex-col gap-4 flex-1 border-[1px] mt-2 rounded-lg border-dashed border-[#d9d9d9] bg-[rgba(0,0,0,0.02)] hover:cursor-pointer hover:border-dark-blue transition-[border-color] duration-[300ms] "
                  onClick={() => {
                    setReportGrades([])
                  }}
                >
                  <FaHand className="fill-dark-blue tiny:size-7 sm:size-11" />
                  <p className="text-black text-sm box-border leading-6">Ajouter des notes manuellement</p>
                  <p className="text-gray-400 tiny:text-xs sm:text-sm box-border leading-6">
                    Support pour l'ajout manuel des notes. Assurez-vous d'entrer les données correctes.
                  </p>
                </div>
                <TbSwitchVertical className="size-8" />
                <Dragger
                  {...uploadProps}
                  fileList={fileList}
                  className="flex flex-1 max-h-[32dvh] flex-col-reverse gap-2 min-h-52 w-full"
                  accept="image/*"
                  maxCount={1}
                >
                  <div className="flex items-center justify-center m-4">
                    <MdDocumentScanner className="fill-dark-blue tiny:size-8 sm:size-12" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-black text-sm box-border leading-6">Numériser une fiche de notes</p>
                    <p className="text-gray-400 tiny:text-xs sm:text-sm box-border leading-6">
                      Cliquez ou faites glisser un fichier dans cette zone pour le télécharger.
                      <br /> Support pour le téléchargement d'une seule fiche de notes. Les fichiers acceptés sont les images uniquement, avec une
                      limite de taille maximale de {maxUploadSize} Mo.
                    </p>
                  </div>
                </Dragger>
              </div>
            ) : (
              <>
                <div className="flex sm:items-center tiny:flex-col tiny:gap-2 sm:gap-0 sm:flex-row justify-between">
                  <div className="flex gap-2 items-center">
                    <PaperClipOutlined className="text-[#000000a6]" />
                    <p className="text-sm text-black">{image?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        extractGrades(cropData.url)
                      }}
                      className="tiny:flex-1 sm:flex-[0] bg-dark-blue border-2 border-dark-blue hover:bg-white px-2 rounded-md flex justify-center items-center group"
                    >
                      <p className=" text-white group-hover:text-dark-blue text-sm">Valider</p>
                    </button>
                    <button
                      className="bg-red-500 border-2 border-red-500 hover:bg-white size-7 rounded-md flex justify-center items-center group"
                      onClick={() => {
                        removeImage()
                        setCropData(null)
                      }}
                    >
                      <MdDelete className="size-5 fill-white group-hover:fill-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex">
                  <div className="flex-1 max-w-full max-h-[70dvh] flex items-center justify-center overflow-hidden flex-col">
                    <div className={`max-h-full border-dashed p-1 box-border border-dark-blue border-[1px]`}>
                      <Image
                        height="100%"
                        src={cropData.url}
                        fallback="data:image/png;base64,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"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <DataTable
            data={reportGrades}
            scanned={cropData !== null}
            removeTable={() => {
              removeImage()
              setCropData(null)
              setReportGrades(null)
            }}
          />
        )}
      </div>
    </>
  )
}

export default GradeReportCreator
