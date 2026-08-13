"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/use-router"

import { useTranslation } from "@/i18n"

import { Input } from "@/components/ui/input"

import {
  SEARCH_ANCHOR_PAGE_KEY,
  SEARCH_FINISHED_PAGE_KEY,
  SEARCH_MATCH_PAGE_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_QUERY_KEY,
  SEARCH_UPCOMING_PAGE_KEY,
  SEARCH_USERS_PAGE_KEY,
} from "../search.constants"

const PAGE_KEYS = [
  SEARCH_MATCH_PAGE_KEY,
  SEARCH_UPCOMING_PAGE_KEY,
  SEARCH_FINISHED_PAGE_KEY,
  SEARCH_NEWS_PAGE_KEY,
  SEARCH_USERS_PAGE_KEY,
  SEARCH_ANCHOR_PAGE_KEY,
]

interface SearchFormProps {
  onSearch?: (q: string) => void
  placeholder?: string
  nameKey?: string
  size?: "sm" | "default" | "lg"
}

interface SearchFormValues {
  query: string
}

export function SearchForm({
  onSearch,
  placeholder: placeholderProp,
  nameKey = SEARCH_QUERY_KEY,
  size = "lg",
}: SearchFormProps) {
  const { t } = useTranslation()
  const { setParams, removeParams, getParam } = useRouter()
  const urlQuery = getParam(nameKey) ?? ""

  const { control, handleSubmit, reset } = useForm<SearchFormValues>({
    defaultValues: { query: urlQuery },
  })

  // Sync khi URL thay đổi từ bên ngoài (back/forward, external clear)
  useEffect(() => {
    reset({ query: urlQuery })
  }, [urlQuery, reset])

  const onSubmit = ({ query }: SearchFormValues) => {
    const q = query.trim()
    const pageReset = Object.fromEntries(PAGE_KEYS.map((k) => [k, null]))
    setParams({ [nameKey]: q || null, ...pageReset }, { replace: true })
    if (q) onSearch?.(q)
    // input giữ focus vì form không re-mount
  }

  const handleClear = () => {
    reset({ query: "" })
    const pageReset = Object.fromEntries(PAGE_KEYS.map((k) => [k, null]))
    setParams({ [nameKey]: null, ...pageReset }, { replace: true, scroll: false })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex w-full max-w-[900px]! items-center border border-white/15 bg-[#0d1829]",
        "shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        "rounded-full max-sm:max-w-full"
      )}
    >
      <Controller
        name="query"
        control={control}
        render={({ field }) => (
          <Input
            variant="ghost"
            inputSize={size}
            wrapperClassName={cn(
              "flex-1 rounded-full",
              size === "sm" ? "px-3" : "px-5 max-sm:px-3.5"
            )}
            leftIcon={
              <Search
                className={
                  size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px] max-sm:h-4 max-sm:w-4"
                }
              />
            }
            name={nameKey}
            type="text"
            value={field.value}
            onChange={(e) => {
              field.onChange(e)
              if (!e.target.value) {
                const pageReset = Object.fromEntries(PAGE_KEYS.map((k) => [k, null]))
                setParams({ [nameKey]: null, ...pageReset }, { replace: true, scroll: false })
              }
            }}
            autoComplete="off"
            placeholder={placeholderProp ?? t("search.form.placeholder")}
            className="placeholder:text-white/30 placeholder:italic"
            onKeyDown={(e) => e.key === "Escape" && handleClear()}
            rightIcon={
              field.value ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label={t("search.form.clear")}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white",
                    size === "sm" ? "size-[15px]" : "size-6"
                  )}
                >
                  <X className={size === "sm" ? "size-2.5" : "size-3"} />
                </button>
              ) : undefined
            }
          />
        )}
      />
    </form>
  )
}
