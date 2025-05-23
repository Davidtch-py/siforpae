"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { supabase } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Popup } from "@/components/ui/popup"
import CrearMenu from "./crear/page"
import EditarMenu from "./editar/page"
import ConsultarMenu from "./consultar/page"
import EstablecerFecha from "./establecer-fecha/page"
import EliminarMenu from "./eliminar/page"

export default function MenusPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("crear")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('auth_uid', user.id)
        .single()
      
      setUserRole(userData?.rol || null)
      setLoading(false)
    } catch (error) {
      console.error("Error al verificar el rol:", error)
      setLoading(false)
    }
  }

  const sidebarItems = [
    {
      label: "Crear Menú",
      href: "#",
      section: "crear",
      roles: ["supervisor", "desarrollador", "admin"]
    },
    {
      label: "Editar Menú",
      href: "#",
      section: "editar",
      roles: ["supervisor", "desarrollador", "admin"]
    },
    {
      label: "Consultar Menú",
      href: "#",
      section: "consultar",
      roles: ["supervisor", "desarrollador", "usuario", "admin"]
    },
    {
      label: "Establecer Fecha",
      href: "#",
      section: "establecer-fecha",
      roles: ["supervisor", "desarrollador", "admin"]
    },
    {
      label: "Eliminar Menú",
      href: "#",
      section: "eliminar",
      roles: ["supervisor", "desarrollador", "admin"]
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f8f5e6] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3e6b47]"></div>
      </div>
    )
  }

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(userRole || "")
  )

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
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

      <Sidebar 
        activeSection="Menús" 
        items={filteredItems}
        onClickOption={setActiveTab}
      />

      <div className="flex-1 p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-center mb-6 text-[#3e6b47] dark:text-[#4e8c57]">Gestión de Menús</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
            <div className="flex flex-wrap">
              {filteredItems.map((item) => (
                <button
                  key={item.section}
                  className={`px-4 py-2 ${
                    activeTab === item.section
                      ? "border-b-2 border-[#3e6b47] dark:border-[#4e8c57] text-[#3e6b47] dark:text-[#4e8c57]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab(item.section)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            {activeTab === "crear" && userRole && ["supervisor", "desarrollador", "admin"].includes(userRole) && (
              <CrearMenu />
            )}
            {activeTab === "editar" && userRole && ["supervisor", "desarrollador", "admin"].includes(userRole) && (
              <EditarMenu />
            )}
            {activeTab === "consultar" && (
              <ConsultarMenu />
            )}
            {activeTab === "establecer-fecha" && userRole && ["supervisor", "desarrollador", "admin"].includes(userRole) && (
              <EstablecerFecha />
            )}
            {activeTab === "eliminar" && userRole && ["supervisor", "desarrollador", "admin"].includes(userRole) && (
              <EliminarMenu />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
