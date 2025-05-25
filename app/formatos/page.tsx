"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { ChevronDown, HelpCircle, Calendar, FileSignature, ArrowLeft, GripVertical } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/ui/signature-pad"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import Link from "next/link"
import { getSidebarItems, INSTITUCION,SEDE } from "./formatos"

// Definir el tipo para los items del sidebar
interface SidebarItem {
  label: string;
  href: string;
}

export default function FormatosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeFormat, setActiveFormat] = useState("residuos")
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>(() => {
    // Intentar obtener el orden guardado del localStorage
    const savedItems = typeof window !== 'undefined' ? localStorage.getItem('sidebarOrder') : null
    return savedItems ? JSON.parse(savedItems) : getSidebarItems()
  })

  // Efecto para redirigir al primer formato cuando se carga la página
  useEffect(() => {
    if (pathname === '/formatos' && sidebarItems.length > 0) {
      router.push(sidebarItems[0].href)
    }
  }, [pathname, sidebarItems, router])

  // Función para guardar el orden en localStorage y actualizar la navegación si es necesario
  const saveOrder = (items: SidebarItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOrder', JSON.stringify(items))
      
      // Si estamos en la página principal de formatos, redirigir al primer elemento
      if (pathname === '/formatos') {
        router.push(items[0].href)
      }
    }
  }

  // Función para manejar el drag and drop y el toggle de ordenamiento
  const handleSidebarAction = (result: any) => {
    console.log('Handling sidebar action:', result) // Debug log

    if (result.type === 'TOGGLE_ORDER') {
      console.log('Toggling order state. Current:', isOrdering) // Debug log
      setIsOrdering(!isOrdering)
      setShowBlur(!showBlur)
      return
    }
    
    const items = Array.from(sidebarItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setSidebarItems(items)
    saveOrder(items)
  }

  // Define tour steps for formatos page
  const tourSteps = [
    {
      target: "#formatos-title",
      title: "Formatos",
      content: "Aquí puedes gestionar todos los formatos relacionados con el programa de alimentación escolar.",
      position: "bottom" as const,
    },
    {
      target: "#sidebar-formatos",
      title: "Menú de Formatos",
      content: "Navega entre los diferentes tipos de formatos disponibles desde este menú lateral.",
      position: "right" as const,
    },
    {
      target: "#formato-residuos",
      title: "Formato de Residuos",
      content: "Este formato te permite registrar la disposición de residuos sólidos en comedores escolares.",
      position: "top" as const,
    },
    {
      target: "#back-button",
      title: "Volver al Dashboard",
      content: "Puedes regresar al panel principal haciendo clic en este botón.",
      position: "right" as const,
    },
  ]

  // Use the tour hook
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("formatos", tourSteps)

  const handleFormatChange = (format: string) => {
    setActiveFormat(format)
    // In a real app, you would navigate to the specific format page
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6] dark:bg-gray-900 relative">
      {/* Tour Guide */}
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />

      {/* Back button for mobile */}
      <div id="back-button" className="fixed top-4 left-4 z-30 md:hidden">
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
          className="p-2 bg-[#e6e3d3] dark:bg-gray-800 rounded-md shadow-md"
          aria-label="Iniciar tutorial"
        >
          <HelpCircle className="h-6 w-6 text-[#3e6b47] dark:text-[#4e8c57]" />
        </button>
      </div>

      <div id="sidebar-formatos">
        <Sidebar 
          activeSection="Formatos" 
          items={sidebarItems} 
          isOrdering={isOrdering}
          onDragEnd={handleSidebarAction}
        />
      </div>

      <div className="flex-1 p-4 md:p-6 md:ml-[200px]">
        <div className="max-w-3xl mx-0">
          <h1 id="formatos-title" className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
            Formatos
          </h1>

          <div id="formato-residuos">
            {pathname.includes('/formatos/residuos') && <ResiduosForm />}
            {pathname.includes('/formatos/limpieza') && <LimpiezaForm />}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResiduosForm() {
  const router = useRouter()
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null)
  const [zone, setZone] = useState("")
  const [institucion, setInstitucion] = useState(INSTITUCION)
  const [sede, setSede] = useState(SEDE)
  const [empresa, setEmpresa] = useState("URBASERV TUNJA S.A")
  const [linea, setLinea] = useState("+57 XXXXXXXXXX")
  const [fecha, setFecha] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [signatureData, setSignatureData] = useState("")
  const [observations, setObservations] = useState("")
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })

  // Estado para los checkboxes
  const [checkboxes, setCheckboxes] = useState({
    residuosOrganicos: false,
    residuosInorganicos: false,
    residuosSanitarios: true,
  })

  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const toggleFrequency = (frequency: number) => {
    setSelectedFrequency(selectedFrequency === frequency ? null : frequency)
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setFecha(date.toLocaleDateString("es-ES"))
    setShowCalendar(false)
  }

  const handleSaveObservations = (text: string) => {
    setObservations(text)
    setPopup({
      show: true,
      type: "success",
      message: "Observaciones guardadas correctamente",
    })
  }

  const handleSaveSignature = (data: string) => {
    setSignatureData(data)
    setShowSignaturePad(false)
    setPopup({
      show: true,
      type: "success",
      message: "Firma guardada correctamente",
    })
  }

  const handleSubmit = () => {
    // Validar campos requeridos
    if (!institucion || !sede || !zone || !fecha) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor complete todos los campos requeridos",
      })
      return
    }

    setPopup({
      show: true,
      type: "success",
      message: "Formulario guardado correctamente",
    })
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  const handleCheckboxChange = (name: keyof typeof checkboxes, checked: boolean) => {
    setCheckboxes({
      ...checkboxes,
      [name]: checked,
    })
  }

  return (
    <>
      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}

      <ObservationsModal
        isOpen={showObservationsModal}
        onClose={() => setShowObservationsModal(false)}
        value={observations}
        onChange={(value) => setObservations(value)}
      />

      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => setShowSignaturePad(false)}
              initialValue={signatureData}
            />
          </div>
        </div>
      )}

      <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
        Formato de Disposicion de Residuos Solidos en Comedores Escolares
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="mb-2 text-black dark:text-white">Tunja</p>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Institución Educativa"
              value={institucion}
              onChange={(e) => setInstitucion(e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
              aria-label="Institución Educativa"
            />
          </div>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Sede educativa"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
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
                value={zone}
                onChange={(e) => setZone(e.target.value)}
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
                    selectedDays.includes(index)
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
                  }`}
                  onClick={() => toggleDay(index)}
                  aria-label={`Seleccionar día ${day}`}
                  aria-pressed={selectedDays.includes(index)}
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
                    selectedFrequency === num
                      ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                      : "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700"
                  }`}
                  onClick={() => toggleFrequency(num)}
                  aria-label={`Seleccionar frecuencia ${num}`}
                  aria-pressed={selectedFrequency === num}
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
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 mb-4 w-full rounded-md"
              aria-label="Empresa de recolección"
            />

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-black dark:text-white">LINEA DE ATENCION</div>
              <input
                type="text"
                value={linea}
                onChange={(e) => setLinea(e.target.value)}
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
                <Calendar size={16} className="mr-2 text-black dark:text-white" />
                <input
                  type="text"
                  placeholder="FECHA"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
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
              {signatureData ? (
                <img
                  src={signatureData || "/placeholder.svg"}
                  alt="Firma"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <FileSignature className="h-8 w-8 mb-1" />
                  <span className="text-sm">Haga clic para firmar</span>
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
            <Checkbox
              checked={checkboxes.residuosOrganicos}
              onChange={(checked) => handleCheckboxChange("residuosOrganicos", checked)}
            />
          </div>
        </div>

        <div>
          <p className="mb-4 text-black dark:text-white">Residuos Inorganicos</p>
          <div className="flex items-center mb-2">
            <span className="text-sm mr-2 text-black dark:text-white">Residuos Inorganicos</span>
            <HelpCircle size={16} className="text-[#c9a55a] dark:text-[#d9b56a] mr-2" />
            <Checkbox
              checked={checkboxes.residuosInorganicos}
              onChange={(checked) => handleCheckboxChange("residuosInorganicos", checked)}
            />
          </div>
        </div>

        <div>
          <p className="mb-4 text-black dark:text-white">Residuos Sanitarios</p>
          <div className="flex items-center mb-2">
            <span className="text-sm mr-2 text-black dark:text-white">Carece Residuos No Aprovechables</span>
            <HelpCircle size={16} className="text-[#c9a55a] dark:text-[#d9b56a] mr-2" />
            <Checkbox
              checked={checkboxes.residuosSanitarios}
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
    </>
  )
}

function LimpiezaForm() {
  // El resto del código se mantiene igual...
  // (Omitido por brevedad)
  return <div className="text-black dark:text-white">Formulario de Limpieza</div>
}
