"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { User, Moon, Sun, Type, ArrowLeft, HelpCircle } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import { useTheme } from "@/components/theme-provider"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import Link from "next/link"

export default function OpcionesPage() {
  const router = useRouter()
  const { theme, fontSize, setTheme, setFontSize } = useTheme()
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })

  // Define tour steps for opciones page
  const tourSteps = [
    {
      target: "#opciones-title",
      title: "Opciones de Usuario",
      content: "Aquí puedes personalizar tu experiencia en SIFORPAE según tus preferencias.",
      position: "bottom" as const,
    },
    {
      target: "#user-info",
      title: "Información de Usuario",
      content: "Aquí puedes ver tu información personal y de la institución a la que perteneces.",
      position: "right" as const,
    },
    {
      target: "#font-size-options",
      title: "Tamaño de Letra",
      content: "Ajusta el tamaño de letra según tus preferencias para una mejor lectura.",
      position: "left" as const,
    },
    {
      target: "#theme-options",
      title: "Tema",
      content: "Cambia entre el modo claro y oscuro según tu preferencia o las condiciones de iluminación.",
      position: "right" as const,
    },
    {
      target: "#save-button",
      title: "Guardar Cambios",
      content: "No olvides guardar tus cambios para que se apliquen en toda la aplicación.",
      position: "top" as const,
    },
  ]

  // Use the tour hook
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("opciones", tourSteps)

  const sidebarItems = [
    {
      label: "Información de Usuario",
      href: "/opciones",
    }
  ]

  const handleSaveChanges = () => {
    setPopup({
      show: true,
      type: "success",
      message: "Cambios guardados correctamente",
    })
  }

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      {/* Tour Guide */}
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />

      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}

      {/* Back button for mobile */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Link href="/dashboard">
          <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
            <ArrowLeft className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
          </button>
        </Link>
      </div>

      {/* Help button */}
      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={startTour}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
          aria-label="Iniciar tutorial"
        >
          <HelpCircle className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
        </button>
      </div>

      <Sidebar activeSection="Opciones" items={sidebarItems} />

      <div className="flex-1 p-6 md:ml-[200px]">
        <div className="max-w-3xl mx-auto">
          <h1 id="opciones-title" className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
            Opciones de Usuario
          </h1>

          <div id="user-info" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 mr-2 text-[#3e6b47] dark:text-[#4e8c57]" />
              <h2 className="text-lg font-medium dark:text-white text-black dark:text-white">Información de Usuario</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-black dark:text-white">
                  Nombre
                </label>
                <input
                  type="text"
                  value="Usuario SIFORPAE"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-black dark:text-white">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value="usuario@siforpae.gov.co"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-black dark:text-white">
                  Institución
                </label>
                <input
                  type="text"
                  value="Secretaría de Educación"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-black dark:text-white">
                  Rol
                </label>
                <input
                  type="text"
                  value="Administrador"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">

            <div id="font-size-options" className="mb-6">
              <h3 className="text-md font-medium mb-2 dark:text-white text-black dark:text-white">Tamaño de Letra</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFontSize("normal")}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === "normal"
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-black dark:text-white"
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === "large"
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-black dark:text-white"
                  }`}
                >
                  Grande
                </button>
                <button
                  onClick={() => setFontSize("extra-large")}
                  className={`px-4 py-2 rounded-md ${
                    fontSize === "extra-large"
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-black dark:text-white"
                  }`}
                >
                  Extra Grande
                </button>
              </div>
            </div>

            <div id="theme-options">
              <h3 className="text-md font-medium mb-2 dark:text-white text-black dark:text-white">Tema</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    theme === "light"
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-black dark:text-white"
                  }`}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    theme === "dark"
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-black dark:text-white"
                  }`}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Oscuro
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              id="save-button"
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
