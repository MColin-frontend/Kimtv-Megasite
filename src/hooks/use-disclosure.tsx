import { useCallback, useState } from "react"

type DisclosureState<T extends string> = Record<T, boolean>

/**
 * Quản lý nhiều open/close state bằng key string.
 * Dùng cho modal, drawer, dropdown, panel, tooltip,...
 *
 * @example
 * const { state, open, close } = useDisclosure("login", "register")
 * open("login")  // → state.login = true
 */
export function useDisclosure<T extends string>(...keys: T[]) {
  const [state, setState] = useState<DisclosureState<T>>(
    () => Object.fromEntries(keys.map((k) => [k, false])) as DisclosureState<T>
  )

  const open = useCallback((key: T) => {
    setState((prev) => ({ ...prev, [key]: true }))
  }, [])

  const close = useCallback((key: T) => {
    setState((prev) => ({ ...prev, [key]: false }))
  }, [])

  const toggle = useCallback((key: T) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const setOpen = useCallback((key: T, value: boolean) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  return { state, open, close, toggle, setOpen }
}
