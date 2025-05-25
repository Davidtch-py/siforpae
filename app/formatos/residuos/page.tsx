"use client"
import { useRef, useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { Calendar as CalendarIcon, ChevronDown, FileSignature, HelpCircle } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import { SignaturePad } from "@/components/ui/signature-pad"
import { useRouter } from "next/navigation"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { useFormStorage } from "@/hooks/use-form-storage"
import { supabase } from "@/lib/supabase"
import { TIPO_FORMATO } from "@/lib/constants"
import { getSidebarItems } from "../formatos"

interface ResiduosFormData {
  institucion: string
  sede: string
  zone: string
  selectedDays: number[]
  selectedFrequency: number | null
  empresa: string
  linea: string
  fecha: string
  signatureData: string
  observations: string
  checkboxes: {
    residuosOrganicos: boolean
    residuosInorganicos: boolean
    residuosSanitarios: boolean
  }
}

export default function ResiduosPage() {
  const router = useRouter()
  const calendarRef = useRef<HTMLDivElement>(null)
  
  // Establecer la fecha por defecto en Colombia
  const defaultDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate)

  useEffect(() => {
    // Establecer la fecha inicial en el formato
    if (defaultDate) {
      updateField("fecha", defaultDate.toLocaleDateString("es-ES"))
    }
  }, [])

  // Define los pasos del tour
  const tourSteps = [
    {
      target: "#residuos-title",
      title: "Formato de Disposición de Residuos",
      content: "Este formato te permite registrar la disposición de residuos en los comedores escolares.",
      position: "bottom" as const,
    },
    {
      target: "#institucion-input",
      title: "Información de la Institución",
      content: "Ingresa aquí los datos de la institución educativa.",
      position: "right" as const,
    },
    {
      target: "#file-upload",
      title: "Carga de Archivos",
      content: "Sube aquí los documentos relacionados con los residuos.",
      position: "left" as const,
    },
    {
      target: "#firma-digital",
      title: "Firma Digital",
      content: "Añade tu firma digital para validar el documento.",
      position: "right" as const,
    },
  ]

  // Usa el hook del tour
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("residuos", tourSteps)

  const [showCalendar, setShowCalendar] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)

  const { formData, updateField } = useFormStorage<ResiduosFormData>("residuos-form", {
    institucion: "",
    sede: "",
    zone: "",
    selectedDays: [],
    selectedFrequency: null,
    empresa: "URBASERV TUNJA S.A",
    linea: "+57 XXXXXXXXXX",
    fecha: "",
    signatureData: "",
    observations: "",
    checkboxes: {
      residuosOrganicos: false,
      residuosInorganicos: false,
      residuosSanitarios: true,
    },
  })

  const defaultItems = getSidebarItems()

  const [sidebarItems, setSidebarItems] = useState(defaultItems)

  useEffect(() => {
    const savedItems = localStorage.getItem('sidebarOrder')
    if (savedItems) {
      setSidebarItems(JSON.parse(savedItems))
    }
  }, [])

  const handleSaveSignature = (data: string) => {
    updateField("signatureData", data)
    setShowSignaturePad(false)
    setPopup({
      show: true,
      type: "success",
      message: "Firma guardada correctamente",
    })
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    updateField("fecha", date.toLocaleDateString("es-ES"))
    setShowCalendar(false)
  }

  const toggleDay = (day: number) => {
    const currentDays = [...formData.selectedDays]
    if (currentDays.includes(day)) {
      updateField(
        "selectedDays",
        currentDays.filter((d) => d !== day),
      )
    } else {
      updateField("selectedDays", [...currentDays, day])
    }
  }

  const toggleFrequency = (frequency: number) => {
    updateField("selectedFrequency", formData.selectedFrequency === frequency ? null : frequency)
  }

  const handleCheckboxChange = (name: keyof typeof formData.checkboxes, checked: boolean) => {
    updateField("checkboxes", {
      ...formData.checkboxes,
      [name]: checked,
    })
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.institucion || !formData.sede || !formData.zone || !formData.fecha) {
        setPopup({
          show: true,
          type: "error",
          message: "Por favor complete todos los campos requeridos",
        })
        return
      }

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

      // Crear el objeto de datos para guardar
      const formatoData = {
        tipo_formato_id: TIPO_FORMATO.RESIDUOS,
        usuario_id: userData.usuario_id,
        fecha_diligenciamiento: new Date().toISOString(),
        estado_diligenciamiento_id: 1,
        datos_formato: {
          institucion: formData.institucion,
          sede: formData.sede,
          zona: formData.zone,
          dias_seleccionados: formData.selectedDays,
          frecuencia: formData.selectedFrequency,
          empresa: formData.empresa,
          linea_atencion: formData.linea,
          fecha: formData.fecha,
          firma: formData.signatureData,
          observaciones: formData.observations,
          residuos: {
            organicos: formData.checkboxes.residuosOrganicos,
            inorganicos: formData.checkboxes.residuosInorganicos,
            sanitarios: formData.checkboxes.residuosSanitarios,
          }
        }
      }

      console.log("Usuario autenticado:", user.id)
      console.log("ID de usuario en la base de datos:", userData.usuario_id)
      console.log("Guardando formato:", formatoData)

      // Intentar guardar en la base de datos
      const { error: saveError } = await supabase
        .from('formatosdiligenciados')
        .insert([formatoData])
        .select()

      if (saveError) {
        console.error("Error detallado al guardar:", saveError)
        throw new Error("Error al guardar en la base de datos: " + saveError.message)
      }

      setPopup({
        show: true,
        type: "success",
        message: "Formato guardado exitosamente",
      })

      // Esperar un momento antes de redirigir
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

      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}

      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => setShowSignaturePad(false)}
              initialValue={formData.signatureData}
            />
          </div>
        </div>
      )}

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
        <h1 id="residuos-title" className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
          Formato de Disposicion de Residuos Solidos en Comedores Escolares
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-black dark:text-white">Tunja</p>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Institución Educativa"
                value={formData.institucion}
                onChange={(e) => updateField("institucion", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
                aria-label="Institución Educativa"
              />
            </div>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Sede educativa"
                value={formData.sede}
                onChange={(e) => updateField("sede", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
                aria-label="Sede educativa"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-black dark:text-white">Año 2025</p>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-full">
                <select
                  value={formData.zone}
                  onChange={(e) => updateField("zone", e.target.value)}
                  className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full appearance-none"
                  aria-label="Seleccionar zona"
                >
                  <option value="">Zona</option>
                  <option value="norte">Norte</option>
                  <option value="sur">Sur</option>
                  <option value="este">Este</option>
                  <option value="oeste">Oeste</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black dark:text-white">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap justify-between mb-4 gap-4">
            <div>
              <p className="text-center mb-2 text-black dark:text-white">DIARIA</p>
              <div className="flex flex-wrap space-x-2">
                {["L", "M", "X", "J", "V"].map((day, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      formData.selectedDays.includes(index)
                        ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                        : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => toggleDay(index)}
                    aria-label={`Seleccionar día ${day}`}
                    aria-pressed={formData.selectedDays.includes(index)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-center mb-2 text-black dark:text-white">Frecuencia</p>
              <div className="flex flex-wrap space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      formData.selectedFrequency === num
                        ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                        : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => toggleFrequency(num)}
                    aria-label={`Seleccionar frecuencia ${num}`}
                    aria-pressed={formData.selectedFrequency === num}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center font-medium mb-4 text-black dark:text-white">Formato</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2 text-sm text-black dark:text-white">EMPRESA DE RECOLECCION</div>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => updateField("empresa", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 mb-4 w-full rounded-md"
                aria-label="Empresa de recolección"
              />

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-black dark:text-white">LINEA DE ATENCION</div>
                <input
                  type="text"
                  value={formData.linea}
                  onChange={(e) => updateField("linea", e.target.value)}
                  className="bg-white dark:bg-gray-800 text-black dark:text-white p-1 border border-gray-300 dark:border-gray-700 text-sm w-32 rounded-md"
                  aria-label="Línea de atención"
                />
              </div>

              <div className="flex items-center justify-center mb-4 relative">
                <div
                  className="bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center w-full cursor-pointer"
                  onClick={() => setShowCalendar(true)}
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={showCalendar}
                  aria-label="Seleccionar fecha"
                >
                  <CalendarIcon size={16} className="mr-2 text-black dark:text-white" />
                  <input
                    type="text"
                    placeholder="FECHA"
                    value={formData.fecha}
                    className="border-none outline-none w-full cursor-pointer bg-transparent text-black dark:text-white"
                    readOnly
                    onClick={() => setShowCalendar(true)}
                    aria-label="Fecha seleccionada"
                  />
                </div>

                {showCalendar && (
                  <div className="absolute top-full left-0 mt-1 z-10" ref={calendarRef}>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          handleDateChange(date)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              {/* Firma digital */}
              <div className="mb-2 text-sm text-black dark:text-white">FIRMA DIGITAL</div>
              <div
                className="border border-gray-300 dark:border-gray-700 rounded-md h-24 mb-4 flex items-center justify-center cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => setShowSignaturePad(true)}
                role="button"
                aria-label="Agregar firma digital"
              >
                {formData.signatureData ? (
                  <img
                    src={formData.signatureData || "/placeholder.svg"}
                    alt="Firma"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 mb-1"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    <span className="text-sm text-black dark:text-white">Haga clic para firmar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="mb-4 text-black dark:text-white">Residuos organicos</p>
            <div className="flex items-center mb-2">
              <span className="text-sm mr-2 text-black dark:text-white">Carece Residuos Organicos</span>
              <HelpTooltip text="Marque si no hay residuos orgánicos" />
              <Checkbox
                checked={formData.checkboxes.residuosOrganicos}
                onChange={(checked) => handleCheckboxChange("residuosOrganicos", checked)}
              />
            </div>
          </div>

          <div>
            <p className="mb-4 text-black dark:text-white">Residuos Inorganicos</p>
            <div className="flex items-center mb-2">
              <span className="text-sm mr-2 text-black dark:text-white">Residuos Inorganicos</span>
              <HelpTooltip text="Marque si hay residuos inorgánicos como plásticos, vidrios, etc." />
              <Checkbox
                checked={formData.checkboxes.residuosInorganicos}
                onChange={(checked) => handleCheckboxChange("residuosInorganicos", checked)}
              />
            </div>
          </div>

          <div>
            <p className="mb-4 text-black dark:text-white">Residuos Sanitarios</p>
            <div className="flex items-center mb-2">
              <span className="text-sm mr-2 text-black dark:text-white">Carece Residuos No Aprovechables</span>
              <HelpTooltip text="Marque si no hay residuos sanitarios o no aprovechables" />
              <Checkbox
                checked={formData.checkboxes.residuosSanitarios}
                onChange={(checked) => handleCheckboxChange("residuosSanitarios", checked)}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-2">
          <button
            className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
            onClick={handleCancel}
            aria-label="Cancelar"
          >
            Cancelar
          </button>

          <button
            className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
            onClick={() => setShowObservationsModal(true)}
            aria-label="Agregar observaciones"
          >
            Observaciones
          </button>

          <button
            className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md"
            onClick={handleSubmit}
            aria-label="Guardar formulario"
          >
            Hecho
          </button>
        </div>
      </div>

      {showObservationsModal && (
        <ObservationsModal
          isOpen={showObservationsModal}
          onClose={() => setShowObservationsModal(false)}
          value={formData.observations}
          onChange={(value) => updateField("observations", value)}
        />
      )}
    </div>
  )
}
