"use client"

import { useEffect } from "react"
import { ToastContainer } from "react-toastify"

export function Toaster() {
  useEffect(() => {
    if (!document.getElementById("react-toastify-css")) {
      const link = document.createElement("link")
      link.id = "react-toastify-css"
      link.rel = "stylesheet"
      link.href = "/react-toastify.css"
      document.head.appendChild(link)
    }
  }, [])
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
