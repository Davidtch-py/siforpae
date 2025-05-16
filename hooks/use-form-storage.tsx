"use client"

import { useState, useEffect } from "react"

export function useFormStorage<T>(formId: string, initialData: T) {
  const [formData, setFormData] = useState<T>(initialData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar datos del formulario al montar el componente
  useEffect(() => {
    const storedData = localStorage.getItem(`form-${formId}`)
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setFormData(parsedData)
      } catch (error) {
        console.error("Error parsing stored form data:", error)
      }
    }
    setIsLoaded(true)
  }, [formId])

  // Guardar datos del formulario cuando cambian
  const saveFormData = (data: T) => {
    setFormData(data)
    localStorage.setItem(`form-${formId}`, JSON.stringify(data))
  }

  // Actualizar un campo específico
  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    const updatedData = { ...formData, [field]: value }
    saveFormData(updatedData)
  }

  // Limpiar datos del formulario
  const clearFormData = () => {
    localStorage.removeItem(`form-${formId}`)
    setFormData(initialData)
  }

  return {
    formData,
    setFormData: saveFormData,
    updateField,
    clearFormData,
    isLoaded,
  }
}
