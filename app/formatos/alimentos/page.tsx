"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { Calendar as CalendarIcon, ChevronDown, HelpCircle } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import { useRouter } from "next/navigation"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { Calendar } from "@/components/ui/calendar"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { useFormStorage } from "@/hooks/use-form-storage"
import { supabase } from "@/lib/supabase"
import { Menu } from "@/lib/types"
import { TIPO_FORMATO } from "@/lib/constants"

interface AlimentosFormData {
  institucion: string
  sede: string
  zone: string
  fechaInicio: string
  fechaFinal: string
  menus: number
  cantidadAlimentos: string
  alimentos: string[]
  ingresosSemana: string[]
  diasSemana: string[]
  unidadesSalida: boolean[]
  observations: string
}

export default function AlimentosPage() {
  const router = useRouter()
  const [showCalendarInicio, setShowCalendarInicio] = useState(false)
  const [showCalendarFinal, setShowCalendarFinal] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [menus, setMenus] = useState<Menu[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { formData, updateField } = useFormStorage<AlimentosFormData>("alimentos-form", {
    institucion: "",
    sede: "",
    zone: "",
    fechaInicio: "",
    fechaFinal: "",
    menus: 0,
    cantidadAlimentos: "2",
    alimentos: ["", ""],
    ingresosSemana: ["", ""],
    diasSemana: ["", ""],
    unidadesSalida: [false, false],
    observations: ""
  })

  // Cargar los menús desde la base de datos
  useEffect(() => {
    const cargarMenus = async () => {
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('menu_id, nombre_menu, estado, fecha_creacion')
          .eq('estado', 'activo')
          .order('nombre_menu')

        if (error) throw error
        setMenus(data || [])
      } catch (error) {
        console.error('Error al cargar los menús:', error)
        setPopup({
          show: true,
          type: "error",
          message: "Error al cargar los menús"
        })
      }
    }

    cargarMenus()
  }, [])

  // Actualizar el número de formularios cuando cambia la cantidad de alimentos
  useEffect(() => {
    const cantidad = parseInt(formData.cantidadAlimentos) || 0
    const newAlimentos = Array(cantidad).fill("")
    const newIngresos = Array(cantidad).fill("")
    const newDias = Array(cantidad).fill("")
    const newUnidades = Array(cantidad).fill(false)

    updateField("alimentos", newAlimentos)
    updateField("ingresosSemana", newIngresos)
    updateField("diasSemana", newDias)
    updateField("unidadesSalida", newUnidades)
  }, [formData.cantidadAlimentos])

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
        tipo_formato_id: TIPO_FORMATO.ALIMENTOS,
        usuario_id: userData.usuario_id,
        fecha_diligenciamiento: new Date().toISOString(),
        estado_diligenciamiento_id: 1,
        datos_formato: {
          institucion: formData.institucion,
          sede: formData.sede,
          zona: formData.zone,
          fecha_inicio: formData.fechaInicio,
          fecha_final: formData.fechaFinal,
          menu_id: formData.menus,
          cantidad_alimentos: formData.cantidadAlimentos,
          registros: formData.alimentos.map((alimento, index) => ({
            alimento,
            ingreso_semana: formData.ingresosSemana[index],
            dia_semana: formData.diasSemana[index],
            unidad_salida: formData.unidadesSalida[index]
          })),
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

      setPopup({
        show: true,
        type: "success",
        message: "Formato guardado exitosamente"
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
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

      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}

      {showObservationsModal && (
        <ObservationsModal
          isOpen={showObservationsModal}
          onClose={() => setShowObservationsModal(false)}
          value={formData.observations}
          onChange={(value) => updateField("observations", value)}
        />
      )}

      <ConfirmModal />

      <div className="flex-1 p-4 md:p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Formato de Disposicion de Residuos<br />
          Solidos en Comedor Escolares
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

        <div className="mb-6">
          <input
            type="text"
            placeholder="Sede educativa"
            value={formData.sede}
            onChange={(e) => updateField("sede", e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
          />
        </div>

        <div className="mb-6">
          <select
            value={formData.zone}
            onChange={(e) => updateField("zone", e.target.value)}
            className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white appearance-none"
          >
            <option value="">Zona</option>
            <option value="norte">Norte</option>
            <option value="sur">Sur</option>
            <option value="este">Este</option>
            <option value="oeste">Oeste</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <div
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full flex items-center bg-white dark:bg-gray-800 cursor-pointer"
              onClick={() => setShowCalendarInicio(true)}
            >
              <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="FECHA INICIO"
                value={formData.fechaInicio}
                className="flex-1 outline-none bg-transparent text-black dark:text-white"
                readOnly
              />
            </div>
            {showCalendarInicio && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <Calendar
                  mode="single"
                  selected={formData.fechaInicio ? new Date(formData.fechaInicio) : undefined}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateField("fechaInicio", date.toISOString())
                      setShowCalendarInicio(false)
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <div
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full flex items-center bg-white dark:bg-gray-800 cursor-pointer"
              onClick={() => setShowCalendarFinal(true)}
            >
              <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="FECHA FINAL"
                value={formData.fechaFinal}
                className="flex-1 outline-none bg-transparent text-black dark:text-white"
                readOnly
              />
            </div>
            {showCalendarFinal && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <Calendar
                  mode="single"
                  selected={formData.fechaFinal ? new Date(formData.fechaFinal) : undefined}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      updateField("fechaFinal", date.toISOString())
                      setShowCalendarFinal(false)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <select
              value={formData.menus}
              onChange={(e) => updateField("menus", parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white appearance-none"
            >
              <option value={0}>Seleccione un menú</option>
              {menus.map((menu) => (
                <option key={menu.menu_id} value={menu.menu_id}>
                  {menu.nombre_menu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="number"
              min="1"
              placeholder="CANTIDAD ALIMENTOS"
              value={formData.cantidadAlimentos}
              onChange={(e) => updateField("cantidadAlimentos", e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
        </div>

        {Array.from({ length: parseInt(formData.cantidadAlimentos) || 0 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Alimentos"
              value={formData.alimentos?.[index] || ""}
              onChange={(e) => {
                const newAlimentos = [...(formData.alimentos || [])]
                newAlimentos[index] = e.target.value
                updateField("alimentos", newAlimentos)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="text"
              placeholder="Ingresos Semana"
              value={formData.ingresosSemana?.[index] || ""}
              onChange={(e) => {
                const newIngresos = [...(formData.ingresosSemana || [])]
                newIngresos[index] = e.target.value
                updateField("ingresosSemana", newIngresos)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <select
              value={formData.diasSemana?.[index] || ""}
              onChange={(e) => {
                const newDias = [...(formData.diasSemana || [])]
                newDias[index] = e.target.value
                updateField("diasSemana", newDias)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">Seleccione día</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unidades de salida</span>
                <HelpTooltip text="Indica si el alimento tiene unidades de salida" />
                <Checkbox
                  checked={formData.unidadesSalida?.[index] || false}
                  onChange={(checked) => {
                    const newUnidades = [...(formData.unidadesSalida || [])]
                    newUnidades[index] = checked as boolean
                    updateField("unidadesSalida", newUnidades)
                  }}
                />
              </div>
            </div>
          </div>
        ))}

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
    </div>
  )
}
