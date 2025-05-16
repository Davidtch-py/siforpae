"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { FileSignature, HelpCircle } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import { SignaturePad } from "@/components/ui/signature-pad"
import { useRouter } from "next/navigation"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { FileUpload } from "@/app/components/ui/file-upload"

export default function DotacionPage() {
  const router = useRouter()
  const [institucion, setInstitucion] = useState("")
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [signatureData, setSignatureData] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)

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

  useEffect(() => {
    const savedItems = localStorage.getItem('sidebarOrder')
    if (savedItems) {
      setSidebarItems(JSON.parse(savedItems))
    }
  }, [])

  // Define los pasos del tour
  const tourSteps = [
    {
      target: "#dotacion-title",
      title: "Formato de Entrega de Dotación",
      content: "Este formato te permite registrar la entrega de dotación en los comedores escolares.",
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
      content: "Sube aquí los documentos relacionados con la entrega de dotación.",
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
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("dotacion", tourSteps)

  // Función para guardar el orden en localStorage
  const saveOrder = (items: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOrder', JSON.stringify(items))
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPopup({
      show: true,
      type: "success",
      message: "Archivo seleccionado correctamente",
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

  const handleCancel = () => {
    router.push("/dashboard")
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
              initialValue={signatureData}
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
        <h1 id="dotacion-title" className="text-2xl font-bold mb-4 text-black dark:text-white text-center">
          Formato de Entrega de Dotación
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="mb-2 text-black dark:text-white">Tunja</p>
            <div className="flex space-x-4 mb-4">
              <input
                id="institucion-input"
                type="text"
                placeholder="Institución Educativa"
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-black dark:text-white">Año 2025</p>
          </div>
        </div>

        <div id="file-upload">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Firma digital */}
        <div id="firma-digital" className="mb-6">
          <div className="mb-2 text-sm text-black dark:text-white">FIRMA DIGITAL</div>
          <div
            className="border border-gray-300 dark:border-gray-700 rounded-md h-24 mb-4 flex items-center justify-center cursor-pointer bg-white dark:bg-gray-800"
            onClick={() => setShowSignaturePad(true)}
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
                <span className="text-sm text-black dark:text-white">Haga clic para firmar</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
            onClick={handleCancel}
          >
            Cancelar
          </button>

          <button 
            className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md"
            onClick={() => {
              setPopup({
                show: true,
                type: "success",
                message: "Formulario guardado correctamente",
              })
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
