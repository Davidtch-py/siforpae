"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { X } from "lucide-react"

interface SignaturePadProps {
  onSave: (signatureData: string) => void
  onCancel: () => void
  initialValue?: string
}

export function SignaturePad({ onSave, onCancel, initialValue = "" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isEmpty, setIsEmpty] = useState(!initialValue)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    setCtx(context)
    context.lineWidth = 2
    context.lineCap = "round"
    context.strokeStyle = "#000"

    // Set canvas dimensions
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Redraw if there was an initial value
      if (initialValue) {
        const img = new Image()
        img.crossOrigin = "anonymous" // Prevent CORS issues
        img.onload = () => {
          context.drawImage(img, 0, 0)
        }
        img.src = initialValue
      }
    }

    resize()
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [initialValue])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return

    setIsDrawing(true)
    setIsEmpty(false)

    // Get position
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return

    // Get position
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!ctx) return
    setIsDrawing(false)
    ctx.closePath()
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setIsEmpty(true)
  }

  const saveSignature = () => {
    if (!canvasRef.current) return
    const signatureData = canvasRef.current.toDataURL("image/png")
    onSave(signatureData)
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">Firma Digital</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-2 border-gray-300 dark:border-gray-700 rounded-md mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none bg-white dark:bg-gray-900"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Área de firma digital"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Limpiar firma"
        >
          Limpiar
        </button>
        <div>
          <button
            onClick={onCancel}
            className="px-4 py-2 mr-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#f8f3e0] dark:hover:bg-gray-700"
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={saveSignature}
            disabled={isEmpty}
            className={`px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md ${
              isEmpty ? "opacity-50 cursor-not-allowed" : "hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
            }`}
            aria-label="Guardar firma"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
