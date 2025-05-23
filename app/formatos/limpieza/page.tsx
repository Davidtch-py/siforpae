"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { Calendar as CalendarIcon, HelpCircle } from "lucide-react"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { Calendar } from "@/components/ui/calendar"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { useFormStorage } from "@/hooks/use-form-storage"
import { supabase } from "@/lib/supabase"
import { TIPO_FORMATO } from "@/lib/constants"
import { Popup } from "@/components/ui/popup"

interface LimpiezaFormData {
  institucion: string
  fecha: string
  areaEntrega: boolean
  paredes: boolean
  ventanas: boolean
  canecasBasura: boolean
  traperos: boolean
  manos: boolean
  observations: string
}

export default function LimpiezaPage() {
  const router = useRouter()
  const [showCalendar, setShowCalendar] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { formData, updateField } = useFormStorage<LimpiezaFormData>("limpieza-form", {
    institucion: "",
    fecha: "",
    areaEntrega: false,
    paredes: false,
    ventanas: false,
    canecasBasura: false,
    traperos: false,
    manos: false,
    observations: ""
  })

  const defaultItems = [
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

  const [sidebarItems, setSidebarItems] = useState(defaultItems)

  const handleSubmit = async () => {
    try {
      // Verificar la autenticación actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        throw new Error("Error de autenticación: " + authError.message)
      }

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Obtener el usuario de la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('usuario_id, estado')
        .eq('auth_uid', user.id)
        .single()

      if (userError) {
        throw new Error("Error al obtener el usuario: " + userError.message)
      }

      if (!userData) {
        throw new Error("No se encontró el usuario en la base de datos")
      }

      // Verificar si el usuario está activo
      if (userData.estado !== 'activo') {
        throw new Error("Tu cuenta no está activa. Contacta al administrador.")
      }

      const formatoData = {
        tipo_formato_id: TIPO_FORMATO.LIMPIEZA,
        usuario_id: userData.usuario_id,
        fecha_diligenciamiento: new Date().toISOString(),
        estado_diligenciamiento_id: 1,
        datos_formato: {
          institucion: formData.institucion,
          fecha: formData.fecha,
          areas: {
            areaEntrega: formData.areaEntrega,
            paredes: formData.paredes,
            ventanas: formData.ventanas,
            canecasBasura: formData.canecasBasura,
            traperos: formData.traperos,
            manos: formData.manos
          },
          observaciones: formData.observations
        }
      }

      // Guardar en la base de datos
      const { error: saveError } = await supabase
        .from('formatosdiligenciados')
        .insert([formatoData])
        .select()

      if (saveError) {
        throw new Error("Error al guardar en la base de datos: " + saveError.message)
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error completo:", error)
      setPopup({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Error desconocido al guardar el formato"
      })
    }
  }

  // Modal de confirmación
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Confirmar reporte</h3>
          <p className="mb-6 text-black dark:text-white">
            ¿Está seguro que desea reportar este formato? Una vez reportado, no podrá modificarlo.
          </p>
          <div className="flex justify-end space-x-4">
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </button>
            <button 
              className="px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md"
              onClick={() => {
                setShowConfirmModal(false)
                handleSubmit()
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}
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
          localStorage.setItem('sidebarOrder', JSON.stringify(items))
        }}
      />

      {showObservationsModal && (
        <ObservationsModal
          isOpen={showObservationsModal}
          onClose={() => setShowObservationsModal(false)}
          value={formData.observations}
          onChange={(value) => updateField("observations", value)}
        />
      )}

      <div className="flex-1 p-4 md:p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Formato de Limpieza Y desinfeccion<br />
          en los Restaurante escolares<br />
          modalidad racion industrializada
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-black dark:text-white">Tunja</p>
          </div>
            <div>
              <input
              type="text"
              placeholder="Institucion Educativa"
              value={formData.institucion}
              onChange={(e) => updateField("institucion", e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
            <div>
            <p className="text-black dark:text-white text-right">Año 2025</p>
          </div>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="relative w-full max-w-md">
            <div
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full flex items-center bg-white dark:bg-gray-800 cursor-pointer"
              onClick={() => setShowCalendar(true)}
            >
              <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="FECHA"
                value={formData.fecha}
                className="flex-1 outline-none bg-transparent text-black dark:text-white"
                readOnly
              />
            </div>
            {showCalendar && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
                <Calendar
                  mode="single"
                  selected={formData.fecha ? new Date(formData.fecha) : undefined}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateField("fecha", date.toISOString())
                      setShowCalendar(false)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Area de Entrega</span>
            <HelpTooltip text="Área donde se entregan los alimentos" />
            <Checkbox
              checked={formData.areaEntrega}
              onChange={(checked) => updateField("areaEntrega", checked)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Paredes</span>
            <HelpTooltip text="Estado de limpieza de las paredes" />
            <Checkbox
              checked={formData.paredes}
              onChange={(checked) => updateField("paredes", checked)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Ventanas</span>
            <HelpTooltip text="Estado de limpieza de las ventanas" />
            <Checkbox
              checked={formData.ventanas}
              onChange={(checked) => updateField("ventanas", checked)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Canecas de basura</span>
            <HelpTooltip text="Estado de limpieza de las canecas" />
            <Checkbox
              checked={formData.canecasBasura}
              onChange={(checked) => updateField("canecasBasura", checked)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Traperos</span>
            <HelpTooltip text="Estado de los implementos de limpieza" />
            <Checkbox
              checked={formData.traperos}
              onChange={(checked) => updateField("traperos", checked)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-black dark:text-white">Manos</span>
            <HelpTooltip text="Higiene de manos del personal" />
            <Checkbox
              checked={formData.manos}
              onChange={(checked) => updateField("manos", checked)}
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md"
          >
            Cancelar
          </button>

          <button 
            onClick={() => setShowObservationsModal(true)}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md"
          >
            Observaciones
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-6 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md"
          >
            Reportar
          </button>
        </div>
      </div>

      <ConfirmModal />
    </div>
  )
}
