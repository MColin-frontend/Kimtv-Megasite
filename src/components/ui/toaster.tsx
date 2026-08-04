"use client"

import { ToastContainer } from "react-toastify"

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
