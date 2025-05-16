"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export interface TourStep {
  target: string
  title: string
  content: string
  position?: "top" | "right" | "bottom" | "left"
}

interface TourGuideProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function TourGuide({ steps, isOpen, onClose, onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
  })
  const [highlightStyle, setHighlightStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })
  const [position, setPosition] = useState<"top" | "right" | "bottom" | "left">("bottom")
  const popupRef = useRef<HTMLDivElement>(null)
  const tourRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const step = steps[currentStep]
      if (!step) return

      const targetElement = document.querySelector(step.target)
      if (!targetElement) return

      const targetRect = targetElement.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft

      // Set highlight position
      setHighlightStyle({
        top: targetRect.top + scrollTop,
        left: targetRect.left + scrollLeft,
        width: targetRect.width,
        height: targetRect.height,
      })

      // Determine best position for the popup
      const pos = step.position || determinePosition(targetRect)
      setPosition(pos)

      // Calculate popup position based on target and popup size
      setTimeout(() => {
        if (!popupRef.current) return
        const popupRect = popupRef.current.getBoundingClientRect()

        let top = 0
        let left = 0

        // Ajustar para dispositivos móviles
        const isMobile = window.innerWidth < 768
        const mobileOffset = isMobile ? 60 : 0 // Mayor offset para móviles

        switch (pos) {
          case "top":
            top = targetRect.top + scrollTop - popupRect.height - 10
            left = targetRect.left + scrollLeft + targetRect.width / 2 - popupRect.width / 2
            break
          case "right":
            top = targetRect.top + scrollTop + targetRect.height / 2 - popupRect.height / 2
            left = targetRect.left + scrollLeft + targetRect.width + 10
            break
          case "bottom":
            top = targetRect.top + scrollTop + targetRect.height + 10
            left = targetRect.left + scrollLeft + targetRect.width / 2 - popupRect.width / 2
            break
          case "left":
            top = targetRect.top + scrollTop + targetRect.height / 2 - popupRect.height / 2
            left = targetRect.left + scrollLeft - popupRect.width - 10
            break
        }

        // Ensure popup stays within viewport
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        if (left < 10) left = 10
        if (left + popupRect.width > viewportWidth - 10) left = viewportWidth - popupRect.width - 10

        // Ajuste especial para móviles
        if (isMobile) {
          // En móviles, asegurarse de que el popup no quede oculto por la parte superior
          if (top < mobileOffset) {
            // Si no hay espacio arriba, ponerlo debajo del elemento
            if (pos === "top") {
              top = targetRect.top + scrollTop + targetRect.height + 10
            } else {
              top = mobileOffset
            }
          }

          // Centrar horizontalmente en móviles si es necesario
          if (viewportWidth < 400 && popupRect.width > viewportWidth * 0.8) {
            left = (viewportWidth - popupRect.width) / 2
          }
        } else {
          if (top < 10) top = 10
        }

        if (top + popupRect.height > viewportHeight + scrollTop - 10)
          top = viewportHeight + scrollTop - popupRect.height - 10

        setPopupStyle({ top, left })
      }, 0)
    }

    // Determine the best position based on available space
    const determinePosition = (targetRect: DOMRect): "top" | "right" | "bottom" | "left" => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const minSpace = 150 // Minimum space needed for the popup

      const spaceTop = targetRect.top
      const spaceRight = viewportWidth - (targetRect.left + targetRect.width)
      const spaceBottom = viewportHeight - (targetRect.top + targetRect.height)
      const spaceLeft = targetRect.left

      // En móviles, preferir posiciones que no sean laterales
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        if (spaceBottom >= minSpace) return "bottom"
        if (spaceTop >= minSpace) return "top"
        return spaceRight > spaceLeft ? "right" : "left"
      }

      // Find the direction with the most space
      const spaces = [
        { dir: "bottom", space: spaceBottom },
        { dir: "right", space: spaceRight },
        { dir: "top", space: spaceTop },
        { dir: "left", space: spaceLeft },
      ]

      // Sort by available space
      spaces.sort((a, b) => b.space - a.space)

      // Return the direction with the most space, if it has enough space
      for (const { dir, space } of spaces) {
        if (space >= minSpace) {
          return dir as "top" | "right" | "bottom" | "left"
        }
      }

      // Default to bottom if no direction has enough space
      return "bottom"
    }

    // Scroll target element into view
    const scrollToTarget = () => {
      const step = steps[currentStep]
      if (!step) return

      const targetElement = document.querySelector(step.target)
      if (!targetElement) return

      const targetRect = targetElement.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      // Calculate the center position of the target
      const targetCenterY = targetRect.top + scrollTop + targetRect.height / 2

      // Calculate the center of the viewport
      const viewportHeight = window.innerHeight
      const viewportCenterY = viewportHeight / 2

      // Calculate the scroll position to center the target
      const scrollTo = targetCenterY - viewportCenterY

      // Smooth scroll to the target
      window.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      })
    }

    updatePosition()
    scrollToTarget()

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [currentStep, isOpen, steps])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Determinar si estamos en un dispositivo móvil
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" ref={tourRef}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />

      {/* Highlight */}
      <div
        className="absolute bg-transparent border-2 border-[#3e6b47] dark:border-[#4e8c57] rounded-md z-10 pointer-events-none"
        style={{
          top: `${highlightStyle.top}px`,
          left: `${highlightStyle.left}px`,
          width: `${highlightStyle.width}px`,
          height: `${highlightStyle.height}px`,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-72 pointer-events-auto z-20 ${
          isMobile ? "max-w-[90vw]" : ""
        }`}
        style={{
          top: `${popupStyle.top}px`,
          left: `${popupStyle.left}px`,
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Cerrar tutorial"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57] mb-2">{steps[currentStep].title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{steps[currentStep].content}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-[#3e6b47] dark:bg-[#4e8c57]" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              className={`p-1 rounded-full ${
                currentStep > 0
                  ? "text-[#3e6b47] dark:text-[#4e8c57] hover:bg-gray-100 dark:hover:bg-gray-700"
                  : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              onClick={handlePrev}
              disabled={currentStep === 0}
              aria-label="Paso anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="p-1 rounded-full text-[#3e6b47] dark:text-[#4e8c57] hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleNext}
              aria-label={currentStep < steps.length - 1 ? "Siguiente paso" : "Finalizar tutorial"}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
