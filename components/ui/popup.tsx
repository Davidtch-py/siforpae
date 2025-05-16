"use client"

import { Check, AlertCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

interface PopupProps {
  type: "success" | "error"
  message: string
  duration?: number
  onClose?: () => void
}

export function Popup({ type, message, duration = 3000, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <div
        className={`flex items-center p-4 rounded-md shadow-md ${
          type === "success" ? "bg-[#3e6b47] dark:bg-[#4e8c57]" : "bg-[#c9a55a] dark:bg-[#d9b56a]"
        } text-white`}
      >
        <div className="mr-3">
          {type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="ml-4 text-white hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
