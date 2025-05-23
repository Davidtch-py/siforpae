"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Settings, Menu, HelpCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { signOut, getCurrentUser } from "@/lib/supabase"

export default function AdminDashboard() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("Administrador")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar datos del usuario al montar el componente
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUserName(user.email || "Administrador")
          
          // Verificar si es admin
          const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'administrador'
          if (!isAdmin) {
            console.log("Usuario no es administrador, redirigiendo...")
            window.location.href = "/dashboard"
            return
          }
        } else {
          // Si no hay usuario, redirigir a la página principal
          console.log("No hay sesión activa, redirigiendo...")
          window.location.href = "/"
          return
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Define tour steps
  const tourSteps = [
    {
      target: "#dashboard-header",
      title: "Panel de Administrador",
      content:
        "Bienvenido al panel de administrador de SIFORPAE. Desde aquí podrás gestionar todas las funciones del sistema.",
      position: "bottom" as const,
    },
    {
      target: "#settings-button",
      title: "Configuración",
      content: "Accede a las opciones de configuración como el tamaño de letra y el modo oscuro desde aquí.",
      position: "left" as const,
    },
    {
      target: "#formatos-button",
      title: "Formatos",
      content: "Aquí encontrarás todos los formatos disponibles para completar y gestionar.",
      position: "right" as const,
    },
    {
      target: "#admin-button",
      title: "Administrar Cuentas",
      content: "Como administrador, puedes crear, modificar y gestionar cuentas de usuario.",
      position: "right" as const,
    },
  ]
  
  // Función mejorada de cierre de sesión
  const handleLogOut = async () => {
    try {
      setIsLoading(true)
      console.log("Cerrando sesión...")
      await signOut()
      console.log("Sesión cerrada exitosamente")
      // Usar window.location en lugar de router para una navegación limpia
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Si falla el cierre de sesión, intentar redirección de todos modos
      window.location.href = "/"
    }
  }

  // Use the tour hook
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("admin-dashboard", tourSteps)

  // Si todavía está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
        <div className="text-[#3e6b47] dark:text-[#4e8c57] text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f5e6] dark:bg-gray-900 p-4">
      {/* Tour Guide */}
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />

      {/* Header with settings icon */}
      <div
        id="dashboard-header"
        className="fixed top-0 left-0 right-0 bg-[#f8f5e6] dark:bg-gray-900 p-4 flex justify-between items-center z-20 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-[#3e6b47] dark:text-[#4e8c57]" />
          </button>
          <span className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">SIFORPAE - Administrador</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={startTour}
            className="mr-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Iniciar tutorial"
          >
            <HelpCircle className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
          </button>
          <Link href="/opciones" aria-label="Configuración" id="settings-button">
            <Settings className="h-6 w-6 text-[#3e6b47] dark:text-[#4e8c57] cursor-pointer hover:text-[#345a3c] dark:hover:text-[#3e7a47]" />
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-[#e6e3d3] dark:bg-gray-800 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-2 border-gray-300 dark:border-gray-700">
              <span className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">Menú</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
              </button>
            </div>
            <div className="space-y-4">
              <Link
                href="/formatos"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Formatos
              </Link>
              <Link
                href="/complementos"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Complementos
              </Link>
              <Link
                href="/reportes"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reportes
              </Link>
              <Link
                href="/menus"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Menús
              </Link>
              <Link
                href="/admin/cuentas"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Administrar Cuentas
              </Link>
              <Link
                href="/opciones"
                className="block p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#3e6b47] dark:text-[#4e8c57]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Opciones
              </Link>
              <button
                className="w-full text-left p-2 hover:bg-[#d8d5c5] dark:hover:bg-gray-700 rounded-md text-[#c9a55a] dark:text-[#d9b56a]"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogOut();
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto p-6 bg-[#f8f5e6] dark:bg-gray-900 rounded-lg mt-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src="/avatar.svg"
              alt="Logo SIFORPAE"
              width={80}
              height={80}
              className="rounded-full border-2 border-[#3e6b47] dark:border-[#4e8c57]"
            />
          </div>
          <div className="text-center flex-grow">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3e6b47] dark:text-[#4e8c57]">Bienvenido</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#4a4a4a] dark:text-gray-300">{userName}</h2>
          </div>
          <div className="w-[80px] hidden md:block"></div> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 relative">
          {/* Vegetables image - desktop only */}
          <div className="hidden md:block absolute -left-32 top-52 transform">
            <Image src="/vegetables.svg" alt="Vegetables" width={300} height={230} className="object-contain" />
          </div>

          <Link href="/formatos">
            <div
              id="formatos-button"
              className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white py-3 px-6 rounded-md text-center text-xl font-medium hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] transition-colors cursor-pointer relative"
            >
              Formatos
            </div>
          </Link>

          <Link href="/complementos">
            <div className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white py-3 px-6 rounded-md text-center text-xl font-medium hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] transition-colors cursor-pointer relative">
              Complementos
            </div>
          </Link>

          <Link href="/reportes">
            <div className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white py-3 px-6 rounded-md text-center text-xl font-medium hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] transition-colors cursor-pointer">
              Reportes
            </div>
          </Link>

          <Link href="/menus">
            <div className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white py-3 px-6 rounded-md text-center text-xl font-medium hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] transition-colors cursor-pointer">
              Menús
            </div>
          </Link>

          <Link href="/admin/cuentas" className="sm:col-span-2">
            <div
              id="admin-button"
              className="bg-[#c9a55a] dark:bg-[#d9b56a] text-white py-3 px-6 rounded-md text-center text-xl font-medium hover:bg-[#b89449] dark:hover:bg-[#c8a449] transition-colors cursor-pointer"
            >
              Administrar Cuentas
            </div>
          </Link>
        </div>

        <div className="flex justify-center mb-4 relative">
          <button
            onClick={handleLogOut}
            className="border-2 border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] py-2 px-12 rounded-md text-lg font-medium hover:bg-[#c9a55a] dark:hover:bg-gray-800 transition-colors hover:text-white dark:hover:text-[#d9b56a]"
          >
            Cerrar Sesión
          </button>
          {/* Character image - desktop only */}
          <div className="hidden md:block absolute -right-48 top-1/2 transform -translate-y-1/2">
            <Image 
              src="/character.svg" 
              alt="Character" 
              width={200} 
              height={300} 
              className="object-contain transform translate-y-[-50%]" 
              style={{ marginBottom: "-150px" }}
            />
          </div>
        </div>

        {/* Mobile images */}
        <div className="flex md:hidden justify-between items-end mt-8">
          <div className="w-[120px]">
            <Image src="/character.svg" alt="Character" width={120} height={150} className="object-contain" />
          </div>
          <div className="w-[200px]">
            <Image src="/vegetables.svg" alt="Vegetables" width={200} height={100} className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
