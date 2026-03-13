import Modal from "@src/components/Modal"
import { InputNumber, Slider } from "antd"
import { Cropper, ReactCropperElement } from "react-cropper"
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai"
import { useEffect, useRef, useState } from "react"
import "cropperjs/dist/cropper.css"
import Spinner from "@src/components/Spinner"

interface ICropperModal {
  image: string
  open: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  confirmCroppedData: (width: number, height: number, url: string) => void
  onCancel?: () => void
}

const CropperModal: React.FC<ICropperModal> = ({ image, open, setVisible, confirmCroppedData, onCancel }) => {
  const [rotationValue, setRotationValue] = useState<number>(0)
  const [initialRotation, setInitialRotation] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  const cropperRef = useRef<ReactCropperElement>(null)

  const setCropperModalVisible = (visible: boolean) => {
    setVisible(visible)
  }

  const useCropData = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setLoading(true)
      const canvasData = cropperRef.current?.cropper.getCroppedCanvas()
      setTimeout(() => {
        confirmCroppedData(canvasData.width, canvasData.height, canvasData.toDataURL())
        setCropperModalVisible(false)
        setLoading(false)
      }, 100)
    }
  }

  const onSliderRotationChange = (value: number | number[]) => {
    const cropper = cropperRef.current?.cropper
    if (cropper && typeof value === "number") {
      setRotationValue(value)
    }
  }

  function rotateSmoothly(cropper: Cropper, angle: number, duration: number = 300) {
    const initialAngle = cropper.getData().rotate % 360
    const startTime = performance.now()

    function animateRotate(timestamp: number) {
      const elapsedTime = timestamp - startTime
      let progress = elapsedTime / duration
      progress = 1 - Math.pow(1 - progress, 3)
      const currentAngle = initialAngle + (angle - initialAngle) * progress
      cropper.rotateTo(currentAngle)
      if (progress < 1) {
        requestAnimationFrame(animateRotate)
      } else {
        cropper.rotateTo(angle)
      }
    }
    requestAnimationFrame(animateRotate)
  }

  useEffect(() => {
    const cropper = cropperRef.current?.cropper
    if (cropper) {
      setRotationValue(cropper.getData().rotate)
      setInitialRotation(cropper.getData().rotate)
    }
  }, [])

  useEffect(() => {
    const cropper = cropperRef.current?.cropper
    if (cropper) rotateSmoothly(cropper, rotationValue)
  }, [rotationValue])

  const roundToNearest90 = (angle: number, direction: "left" | "right") => {
    const remainder = angle % 90
    if (remainder === 0) {
      return direction === "right" ? angle + 90 : angle - 90
    }

    return direction === "right" ? Math.ceil(angle / 90) * 90 : Math.floor(angle / 90) * 90
  }

  const cropperRotateLeft = () => {
    const cropper = cropperRef.current?.cropper
    if (cropper) {
      let currentRotation = cropper.getData().rotate
      if (currentRotation > -180) {
        currentRotation = roundToNearest90(currentRotation, "left")
        if (currentRotation < -180) currentRotation = -180
        setRotationValue(currentRotation)
      }
    }
  }

  const cropperRotateRight = () => {
    const cropper = cropperRef.current?.cropper
    if (cropper) {
      let currentRotation = cropper.getData().rotate
      if (currentRotation < 180) {
        currentRotation = roundToNearest90(currentRotation, "right")
        if (currentRotation > 180) currentRotation = 180
        setRotationValue(currentRotation)
      }
    }
  }

  const displayedRotationValue = rotationValue - initialRotation

  return (
    <Modal
      title="Modifier l'image"
      closeModal={() => {
        setCropperModalVisible(false)
      }}
      open={open}
      maskClosable={false}
      maxHeight="max-h-[90dvh]"
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-3 items-center">
        <Cropper
          ref={cropperRef}
          className="max-h-[60dvh]"
          src={image}
          viewMode={0}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          rotatable
          scalable
          movable
          zoomable
          responsive={true}
          autoCropArea={1}
          checkOrientation={true}
        />
        <div className="w-1/2 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-1">
            <AiOutlineRotateLeft
              className={`fill-dark-blue size-6 ${displayedRotationValue === -180 ? "cursor-not-allowed" : "hover:cursor-pointer"}`}
              onClick={cropperRotateLeft}
            />
            <Slider className="flex-1" value={displayedRotationValue} step={1} min={-180} max={180} onChange={onSliderRotationChange} />
            <AiOutlineRotateRight
              className={`fill-dark-blue size-6 ${displayedRotationValue === 180 ? "cursor-not-allowed" : "hover:cursor-pointer"}`}
              onClick={cropperRotateRight}
            />
          </div>
          <InputNumber
            min={-180}
            max={180}
            step={1}
            value={displayedRotationValue}
            onChange={(newValue: any) => {
              setRotationValue(newValue as number)
            }}
            precision={0}
            className="text-slate-gray hover:border-dark-blue focus:border-dark-blue w-16 self-center"
            suffix="°"
          />
        </div>
      </div>
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => {
            cropperRef.current?.cropper.reset()
          }}
          className="tiny:flex-1 sm:flex-0 rounded-lg border-2 border-slate-gray bg-white hover:bg-slate-gray group h-10 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
          type="submit"
        >
          <p className="text-slate-gray font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-white">Réinitialiser</p>
        </button>

        <button
          onClick={() => {
            useCropData()
          }}
          className="tiny:flex-1 sm:flex-0 rounded-lg border-2 border-dark-blue bg-dark-blue hover:bg-white group h-10 tiny:w-2/5 sm:w-1/2 hover:brightness-95 flex justify-center items-center gap-4 focus:brightness-95"
          type="submit"
        >
          <p className="text-white font-semibold tiny:text-sm xs:text-base sm:text-lg select-none group-hover:text-dark-blue">Confirmer</p>
          {loading && <Spinner className="white hover dark-blue" />}
        </button>
      </div>
    </Modal>
  )
}
export default CropperModal
