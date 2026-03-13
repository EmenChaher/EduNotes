import { IoCloseCircleOutline } from "react-icons/io5"

import { Modal as AntdModal } from "antd"

interface ModalPropTypes {
  title: string
  open: boolean
  children: React.ReactNode
  closeDisabled?: boolean
  closeModal: () => void
  maskClosable?: boolean
  destroyOnClose?: boolean
  maxHeight?: string
  onCancel?: () => void
}

const Modal: React.FC<ModalPropTypes> = ({
  title,
  open,
  children,
  closeDisabled = false,
  closeModal,
  destroyOnClose = false,
  maskClosable = true,
  maxHeight = "max-h-[80dvh]",
  onCancel,
}) => {
  const closeModalWrapper = () => {
    if (closeModal) closeModal()
    if (onCancel) onCancel()
  }

  const handleClick = () => {
    if (!closeDisabled) {
      closeModalWrapper()
    }
  }

  return (
    <AntdModal
      open={open}
      centered
      closeIcon={false}
      footer={null}
      maskClosable={maskClosable}
      onCancel={closeModalWrapper}
      destroyOnClose={destroyOnClose}
      classNames={{ content: "!p-0" }}
    >
      <div className="w-full h-full py-6">
        <div className={`flex flex-col gap-10 py-1 px-6 ${maxHeight} overflow-y-scroll overflow-x-hidden`}>
          <div className="flex justify-between">
            <p className="text-xl font-medium text-dark-blue">{title}</p>
            <IoCloseCircleOutline
              className={`size-7 stroke-dark-gray hover:stroke-red-500 hover:${closeDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={handleClick}
            />
          </div>
          {children}
        </div>
      </div>
    </AntdModal>
  )
}
export default Modal
