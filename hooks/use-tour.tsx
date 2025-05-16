"use client"

import { useState, useEffect } from "react"
import type { TourStep } from "@/components/ui/tour-guide"

export function useTour(tourId: string, steps: TourStep[]) {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useState(true)

  useEffect(() => {
    // Check if the user has seen the tour before
    const tourSeen = localStorage.getItem(`tour-${tourId}-completed`)
    if (tourSeen !== "true") {
      setHasSeenTour(false)
      // Show the tour after a short delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setIsTourOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [tourId])

  const startTour = () => {
    setIsTourOpen(true)
  }

  const closeTour = () => {
    setIsTourOpen(false)
    // Marcar el tour como visto cuando se cierra manualmente
    localStorage.setItem(`tour-${tourId}-completed`, "true")
    setHasSeenTour(true)
  }

  const completeTour = () => {
    setIsTourOpen(false)
    localStorage.setItem(`tour-${tourId}-completed`, "true")
    setHasSeenTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem(`tour-${tourId}-completed`)
    setHasSeenTour(false)
  }

  return {
    isTourOpen,
    hasSeenTour,
    startTour,
    closeTour,
    completeTour,
    resetTour,
  }
}
