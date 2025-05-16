"use client"

import { HelpCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface HelpTooltipProps {
  text: string
  className?: string
  position?: "left" | "right" | "auto"
}

export function HelpTooltip({ text, className, position = "auto" }: HelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<"left" | "right">("right")
  const tooltipRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  // Determinar la posición del tooltip basado en el espacio disponible
  useEffect(() => {
    if (showTooltip && tooltipRef.current && iconRef.current && position === "auto") {
      const iconRect = iconRef.current.getBoundingClientRect()
      const spaceOnRight = window.innerWidth - iconRect.right

      // Si hay menos de 270px a la derecha, mostrar el tooltip a la izquierda
      if (spaceOnRight < 270) {
        setTooltipPosition("left")
      } else {
        setTooltipPosition("right")
      }
    } else if (position !== "auto") {
      setTooltipPosition(position)
    }
  }, [showTooltip, position])

  // Cerrar el tooltip cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={iconRef}>
      <HelpCircle
        size={16}
        className={`text-[#c9a55a] dark:text-[#d9b56a] cursor-help ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      />
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg ${
            tooltipPosition === "left" ? "-top-2 right-6" : "-top-2 left-6"
          }`}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
              tooltipPosition === "left" ? "-right-1 top-3" : "-left-1 top-3"
            }`}
          ></div>
        </div>
      )}
    </div>
  )
}
