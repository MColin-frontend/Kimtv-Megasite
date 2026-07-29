"use client"

import { useEffect } from "react"

import { signinSilentCallback } from "@/lib/oidc"

export default function SilentCallbackPage() {
  useEffect(() => {
    signinSilentCallback().catch(console.error)
  }, [])

  return null
}
