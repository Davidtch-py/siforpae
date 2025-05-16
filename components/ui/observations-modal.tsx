"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/theme-provider"

interface ObservationsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (observations: string) => void
  initialValue?: string
}

export function ObservationsModal({ isOpen, onClose, onSave, initialValue = "" }: ObservationsModalProps) {
  const [observations, setObservations] = useState(initialValue)
  const { theme } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">Observaciones</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ingrese sus observaciones aquí..."
            className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:focus:ring-[#4e8c57] dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#f8f3e0] dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(observations)
              onClose()
            }}
            className="px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
