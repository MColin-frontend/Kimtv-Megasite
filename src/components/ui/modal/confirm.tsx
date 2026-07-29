"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { CircleAlert, CircleCheck, Loader2, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

type ModalType = "confirm" | "warning" | "destructive"

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: React.ReactNode
  type?: ModalType
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  image?: string
  isConfirming?: boolean
}

const TYPE_CONFIG: Record<
  ModalType,
  { Icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  confirm: {
    Icon: CircleCheck,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  warning: {
    Icon: TriangleAlert,
    iconClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  destructive: {
    Icon: CircleAlert,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10",
  },
}

function ConfirmModal({
  open,
  onOpenChange,
  title,
  content,
  type = "confirm",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  image,
  isConfirming = false,
}: ConfirmModalProps) {
  const { Icon, iconClass, bgClass } = TYPE_CONFIG[type]

  function handleConfirm() {
    onConfirm?.()
    if (!isConfirming) onOpenChange(false)
  }

  function handleCancel() {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup
            className={cn(
              "w-full max-w-sm rounded-2xl bg-[#0d1829]",
              "shadow-[0_24px_64px_rgba(0,0,0,0.7)]",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
            )}
          >
            <div className="flex flex-col items-center px-6 pt-9 pb-7 text-center">
              {/* Image hoặc Icon */}
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="mb-5 h-[100px] w-auto object-contain" />
              ) : (
                <div
                  className={cn(
                    "mb-5 flex size-18 items-center justify-center rounded-full",
                    bgClass
                  )}
                >
                  <Icon className={cn("size-9", iconClass)} strokeWidth={1.6} />
                </div>
              )}

              <AlertDialog.Title className="text-24 font-700 text-white">{title}</AlertDialog.Title>
              <AlertDialog.Description className="text-16 text-muted mt-2.5 leading-relaxed">
                {content}
              </AlertDialog.Description>
            </div>

            <div className="flex gap-3 px-6 pb-7">
              <AlertDialog.Close
                render={
                  <Button
                    variant="cancel"
                    size="lg"
                    className="text-15 flex-1"
                    disabled={isConfirming}
                    onClick={handleCancel}
                  >
                    {cancelLabel}
                  </Button>
                }
              />
              {isConfirming ? (
                <Button variant="gradient" size="lg" className="text-15 flex-1 text-black" disabled>
                  <Loader2 className="size-4 animate-spin" />
                </Button>
              ) : (
                <AlertDialog.Close
                  render={
                    <Button
                      variant="gradient"
                      size="lg"
                      className="text-15 flex-1 text-black"
                      onClick={handleConfirm}
                    >
                      {confirmLabel}
                    </Button>
                  }
                />
              )}
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export { ConfirmModal }
export type { ConfirmModalProps, ModalType }
