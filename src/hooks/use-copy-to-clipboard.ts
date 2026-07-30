import { useCallback, useState } from "react"

export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    (text: string) => {
      function markCopied() {
        setCopied(true)
        setTimeout(() => setCopied(false), resetMs)
      }

      function execFallback() {
        const input = document.createElement("input")
        input.value = text
        document.body.appendChild(input)
        input.select()
        document.execCommand("Copy")
        document.body.removeChild(input)
        markCopied()
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(markCopied).catch(execFallback)
      } else {
        execFallback()
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
