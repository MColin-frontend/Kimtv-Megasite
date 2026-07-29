"use client"

import { toast as reactToast, ToastContainer } from "react-toastify"
import Image from "next/image"
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react"

import { Typography } from "@/components/ui/typography"

import "react-toastify/dist/ReactToastify.css"

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
      toastStyle={{ background: "transparent", boxShadow: "none", padding: 0, marginBottom: 6 }}
      style={{ width: "360px" }}
    />
  )
}

const VARIANTS = {
  success: {
    border: "rgba(34,197,94,0.35)",
    icon: "rgba(34,197,94,1)",
    dot: "rgba(34,197,94,0.9)",
    Icon: CheckCircle,
  },
  error: {
    border: "rgba(239,68,68,0.35)",
    icon: "rgba(239,68,68,1)",
    dot: "rgba(239,68,68,0.9)",
    Icon: XCircle,
  },
  info: {
    border: "rgba(59,130,246,0.35)",
    icon: "rgba(59,130,246,1)",
    dot: "rgba(59,130,246,0.9)",
    Icon: Info,
  },
  warning: {
    border: "rgba(234,179,8,0.35)",
    icon: "rgba(234,179,8,1)",
    dot: "rgba(234,179,8,0.9)",
    Icon: AlertTriangle,
  },
} as const

type Variant = keyof typeof VARIANTS

function ToastContent({
  id,
  title,
  description,
  variant,
  image,
}: {
  id: string | number
  title: string
  description?: string
  variant: Variant
  image?: string
}) {
  const { border, icon, dot, Icon } = VARIANTS[variant]
  return (
    <div
      style={{
        background: "rgba(15,17,26,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 10,
        border: `1px solid ${border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        width: "100%",
      }}
      className="flex w-full items-start gap-3 px-4 py-3"
    >
      {image ? (
        <Image
          src={image}
          alt={title}
          width={32}
          height={32}
          className="mt-0.5 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="mt-0.5 shrink-0" style={{ color: icon }}>
          <Icon size={18} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ background: dot }}
          />
          <Typography variant="body-sm" weight="600" className="leading-snug text-white/95">
            {title}
          </Typography>
        </div>
        {description && (
          <Typography variant="caption" className="mt-0.5 leading-relaxed text-white/55">
            {description}
          </Typography>
        )}
      </div>

      <button
        onClick={() => reactToast.dismiss(id)}
        className="mt-0.5 shrink-0 text-white/30 transition-colors hover:text-white/70"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function show(variant: Variant, title: string, description?: string, image?: string) {
  const id = crypto.randomUUID()
  reactToast(
    <ToastContent
      id={id}
      title={title}
      description={description}
      variant={variant}
      image={image}
    />,
    { toastId: id }
  )
}

export const toast = {
  success: (title: string, description?: string, image?: string) =>
    show("success", title, description, image),
  error: (title: string, description?: string, image?: string) =>
    show("error", title, description, image),
  info: (title: string, description?: string, image?: string) =>
    show("info", title, description, image),
  warning: (title: string, description?: string, image?: string) =>
    show("warning", title, description, image),
}
