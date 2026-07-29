"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"

import { clientUpload, javaUrl } from "@/server/services/client-request"
import { cn } from "@/lib/utils"

import { Typography } from "./typography"

/* ── Skeleton item đang upload ────────────────────────────── */

function UploadingSkeleton({ progress }: { progress: number }) {
  return (
    <div className="rounded-8 relative size-20 shrink-0 overflow-hidden border border-white/10 bg-white/5">
      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
        <div
          className="h-full bg-amber-400 transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Percent text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Typography variant="caption" className="text-white/30">
          {progress}%
        </Typography>
      </div>
    </div>
  )
}

/* ── Fake progress hook ───────────────────────────────────── */

function useFakeProgress(active: boolean) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const intervals = [
      { target: 30, delay: 100 },
      { target: 55, delay: 200 },
      { target: 72, delay: 300 },
      { target: 82, delay: 500 },
      { target: 88, delay: 800 },
      { target: 92, delay: 1200 },
    ]
    let i = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    function step() {
      if (i >= intervals.length) return
      const { target, delay } = intervals[i++]
      const t = setTimeout(() => {
        setProgress(target)
        step()
      }, delay)
      timers.push(t)
    }
    step()
    return () => timers.forEach(clearTimeout)
  }, [active])

  return { progress, finish: () => setProgress(100) }
}

/* ── Uploading item wrapper ───────────────────────────────── */

function UploadingItem({ file, onDone }: { file: File; onDone: (url: string) => void }) {
  const { progress, finish } = useFakeProgress(true)

  useEffect(() => {
    const fd = new FormData()
    fd.append("files", file, file.name)
    fd.append("flag", "0")

    clientUpload<{ url: string }>(javaUrl("/app/upload-file"), fd).then((res) => {
      finish()
      setTimeout(() => onDone(res.data?.url ?? URL.createObjectURL(file)), 300)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <UploadingSkeleton progress={progress} />
}

/* ── Props ────────────────────────────────────────────────── */

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  max?: number
  maxSizeMb?: number
  description?: string
  className?: string
}

/* ── Main ─────────────────────────────────────────────────── */

export function ImageUpload({
  value = [],
  onChange,
  multiple = true,
  max,
  maxSizeMb = 2,
  description,
  className,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [uploading, setUploading] = useState<File[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const rejected: string[] = []
    const valid = files.filter((f) => {
      if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
        rejected.push(f.name)
        return false
      }
      return true
    })

    if (rejected.length)
      setWarning(`${rejected.length} ảnh bị từ chối — dung lượng vượt quá ${maxSizeMb}MB cho phép`)
    else setWarning(null)

    const toAdd = multiple
      ? valid.slice(0, max ? max - value.length - uploading.length : valid.length)
      : valid.slice(0, 1)

    if (!multiple && toAdd.length) {
      // Ghi đè: xoá ảnh cũ trước khi upload mới
      onChange([])
      setUploading(toAdd)
    } else if (toAdd.length) {
      setUploading((prev) => [...prev, ...toAdd])
    }
    e.target.value = ""
  }

  function handleUploadDone(file: File, url: string) {
    setUploading((prev) => prev.filter((f) => f !== file))
    onChange([...value, url])
  }

  function handleRemove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  const totalCount = value.length + uploading.length
  const canAdd = !multiple || max === undefined || totalCount < max

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Upload zone */}
      {canAdd && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-8 flex h-24 w-full flex-col items-center justify-center gap-1.5 border border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-white/30 hover:bg-white/5"
          >
            <ImagePlus className="size-5 text-white/30" />
            <Typography variant="caption" className="text-white/40">
              Nhấp để chọn ảnh
            </Typography>
            <Typography variant="caption" className="text-white/20">
              JPG, PNG, WEBP · Tối đa {maxSizeMb}MB{max ? ` · ${max} ảnh` : ""}
            </Typography>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {/* Previews + skeletons */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={src} className="relative shrink-0">
              <div className="rounded-8 size-20 overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-400"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {uploading.map((file, i) => (
            <UploadingItem
              key={`${file.name}-${i}`}
              file={file}
              onDone={(url) => handleUploadDone(file, url)}
            />
          ))}
        </div>
      )}

      {warning && (
        <Typography variant="caption" className="text-amber-400">
          ⚠ {warning}
        </Typography>
      )}

      {description && (
        <Typography variant="caption" className="text-white/30">
          {description}
        </Typography>
      )}
    </div>
  )
}
