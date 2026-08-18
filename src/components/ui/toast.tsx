"use client"

import "react-toastify/dist/ReactToastify.css"

import { toast as reactToast, ToastContainer } from "react-toastify"
import Image from "next/image"
import { X } from "lucide-react"

import icToastError from "@assets/images/common/ic-toast-error.webp"
import icToastSuccess from "@assets/images/common/ic-toast-success.webp"
import icToastWarning from "@assets/images/common/ic-toast-warning.webp"

export function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar
      closeOnClick={false}
      pauseOnHover
      draggable={false}
      closeButton={false}
      toastStyle={{ background: "transparent", boxShadow: "none", padding: 0, marginBottom: 8 }}
      style={{ width: "240px" }}
    />
  )
}

const VARIANTS = {
  success: {
    bg: "#e8f5e9",
    border: "#a5d6a7",
    titleColor: "#1b5e20",
    msgColor: "#33691e",
    closeColor: "#1b5e20",
    icon: icToastSuccess,
    label: "Thành công",
  },
  error: {
    bg: "#fce4ec",
    border: "#f48fb1",
    titleColor: "#880e4f",
    msgColor: "#ad1457",
    closeColor: "#880e4f",
    icon: icToastError,
    label: "Lỗi",
  },
  warning: {
    bg: "#fff8e1",
    border: "#ffe082",
    titleColor: "#e65100",
    msgColor: "#bf360c",
    closeColor: "#e65100",
    icon: icToastWarning,
    label: "Cảnh báo",
  },
  info: {
    bg: "#e3f2fd",
    border: "#90caf9",
    titleColor: "#0d47a1",
    msgColor: "#1565c0",
    closeColor: "#0d47a1",
    icon: icToastWarning,
    label: "Thông báo",
  },
} as const

type Variant = keyof typeof VARIANTS

function ToastContent({
  id,
  message,
  variant,
  image,
}: {
  id: string | number
  message: string
  variant: Variant
  image?: string
}) {
  const v = VARIANTS[variant]

  return (
    <div
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 14,
        boxShadow:
          "0 2px 0 rgba(0,0,0,0.12), 0 6px 20px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.7)",
        overflow: "visible",
      }}
      className="absolute flex w-full max-w-[250px] items-end gap-2.5 py-2 pr-3 pl-2 max-sm:top-[65px] max-sm:right-[10px]"
    >
      {/* 3D icon — bottom-aligned, slightly overflows */}
      <div className="shrink-0 self-end">
        {image ? (
          <Image
            src={image}
            alt={v.label}
            width={64}
            height={64}
            className="object-contain"
            style={{
              filter:
                "drop-shadow(0 6px 10px rgba(0,0,0,0.25)) drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
            }}
          />
        ) : (
          <Image
            src={v.icon}
            alt={v.label}
            width={64}
            height={64}
            className="object-contain"
            style={{
              filter:
                "drop-shadow(0 6px 10px rgba(0,0,0,0.25)) drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
            }}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 pb-0.5">
        <p className="text-14 font-700 leading-tight" style={{ color: v.titleColor }}>
          {v.label}
        </p>
        <p className="text-12 font-400 mt-0.5 leading-relaxed" style={{ color: v.msgColor }}>
          {message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => reactToast.dismiss(id)}
        className="mt-0.5 shrink-0 self-start rounded-full transition-opacity hover:opacity-60"
        style={{ color: v.closeColor }}
      >
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  )
}

function show(variant: Variant, message: string, image?: string) {
  const id = crypto.randomUUID()
  reactToast(<ToastContent id={id} message={message} variant={variant} image={image} />, {
    toastId: id,
  })
}

export const toast = {
  success: (message: string, image?: string) => show("success", message, image),
  error: (message: string, image?: string) => show("error", message, image),
  info: (message: string, image?: string) => show("info", message, image),
  warning: (message: string, image?: string) => show("warning", message, image),
}
