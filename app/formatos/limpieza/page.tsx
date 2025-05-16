"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { HelpCircle } from "lucide-react"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"

export default function LimpiezaPage() {
  const router = useRouter()
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [fecha, setFecha] = useState("")
  const [area, setArea] = useState("")
  const [sidebarItems, setSidebarItems] = useState(() => {
    // Intentar obtener el orden guardado del localStorage
    const savedItems = typeof window !== 'undefined' ? localStorage.getItem('sidebarOrder') : null
    return savedItems ? JSON.parse(savedItems) : [
      {
        label: "Disposicion de Residuos Solidos en Comedores Escolares",
        href: "/formatos/residuos",
      },
      {
        label: "Limpieza en Restaurante Escolares",
        href: "/formatos/limpieza",
      },
      {
        label: "Remisión Entrega de Viveres En Comedores Escolares",
        href: "/formatos/viveres",
      },
      {
        label: "Entrega De Dotacion",
        href: "/formatos/dotacion",
      },
      {
        label: "Entrada y Salida de Alimentos en los Restaurantes Escolares",
        href: "/formatos/alimentos",
      },
    ]
  })

  // Define los pasos del tour
  const tourSteps = [
    {
      target: "#limpieza-title",
      title: "Formato de Limpieza",
      content: "Este formato te permite registrar las actividades de limpieza en los restaurantes escolares.",
      position: "bottom" as const,
    },
    {
      target: "#info-general",
      title: "Información General",
      content: "Ingresa aquí la fecha y el área donde se realizó la limpieza.",
      position: "right" as const,
    },
    {
      target: "#actividades",
      title: "Actividades de Limpieza",
      content: "Lista de actividades de limpieza que deben realizarse.",
      position: "left" as const,
    },
  ]

  // Usa el hook del tour
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("limpieza", tourSteps)

  // Función para guardar el orden en localStorage
  const saveOrder = (items: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOrder', JSON.stringify(items))
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      {/* Tour Guide */}
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />

      {/* Help button */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={startTour}
          className="p-2 bg-[#e6e3d3] dark:bg-gray-800 rounded-md shadow-md"
          aria-label="Iniciar tutorial"
        >
          <HelpCircle className="h-6 w-6 text-[#3e6b47] dark:text-[#4e8c57]" />
        </button>
      </div>

      <Sidebar 
        activeSection="Formatos" 
        items={sidebarItems}
        isOrdering={isOrdering}
        onDragEnd={(result) => {
          if (result.type === 'TOGGLE_ORDER') {
            setIsOrdering(!isOrdering)
            setShowBlur(!showBlur)
            return
          }
          
          const items = Array.from(sidebarItems)
          const [reorderedItem] = items.splice(result.source.index, 1)
          items.splice(result.destination.index, 0, reorderedItem)
          
          setSidebarItems(items)
          saveOrder(items)
        }}
      />

      <div className="flex-1 p-4 md:p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 id="limpieza-title" className="text-2xl font-bold mb-4 text-black dark:text-white text-center">
          Formato de Limpieza en Restaurantes Escolares
        </h1>
        <p className="mb-2 text-black dark:text-white">Este es un formato para registrar las actividades de limpieza.</p>

        <div id="info-general" className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-black dark:text-white">
                Fecha:
              </label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md shadow-sm focus:ring focus:ring-[#3e6b47] dark:focus:ring-[#4e8c57] focus:border-[#3e6b47] dark:focus:border-[#4e8c57] bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-black dark:text-white">
                Área:
              </label>
              <input
                type="text"
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md shadow-sm focus:ring focus:ring-[#3e6b47] dark:focus:ring-[#4e8c57] focus:border-[#3e6b47] dark:focus:border-[#4e8c57] bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        <div id="actividades">
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">Actividades de Limpieza</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-black dark:text-white">Barrer y trapear pisos</li>
            <li className="text-black dark:text-white">Limpiar superficies</li>
            <li className="text-black dark:text-white">Vaciar papeleras</li>
            <li className="text-black dark:text-white">Limpiar baños</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
            onClick={() => router.push("/dashboard")}
          >
            Cancelar
          </button>

          <button 
            className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md"
            onClick={() => {}}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
