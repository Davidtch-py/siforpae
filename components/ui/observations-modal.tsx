"use client"

import * as React from "react"
import { X } from "lucide-react"

interface ObservationsModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onChange: (value: string) => void
}

export function ObservationsModal({ isOpen, onClose, value, onChange }: ObservationsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-black dark:text-white">Observaciones</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escriba sus observaciones aquí..."
            className="w-full h-40 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:focus:ring-[#4e8c57]"
          />
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
