"use client"
import Sidebar from "@/components/sidebar"
import { Calendar as CalendarIcon, FileSignature, HelpCircle } from "lucide-react"
import { useState } from "react"
import { Popup } from "@/components/ui/popup"
import { SignaturePad } from "@/components/ui/signature-pad"
import { useRouter } from "next/navigation"
import { TourGuide } from "@/components/ui/tour-guide"
import { useTour } from "@/hooks/use-tour"
import { FileUpload } from "@/app/components/ui/file-upload"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { useFormStorage } from "@/hooks/use-form-storage"
import { supabase } from "@/lib/supabase"
import { Calendar } from "@/components/ui/calendar"
import { TIPO_FORMATO } from "@/lib/constants"

interface ViveresFormData {
  institucion: string
  sede: string
  fecha: string
  signatureData: string
  observations: string
  fileUrl: string
}

export default function ViveresPage() {
  const router = useRouter()
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  
  const { formData, updateField } = useFormStorage<ViveresFormData>("viveres-form", {
    institucion: "",
    sede: "",
    fecha: "",
    signatureData: "",
    observations: "",
    fileUrl: ""
  })

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
      target: "#viveres-title",
      title: "Formato de Remisión de Víveres",
      content: "Este formato te permite registrar la entrega de víveres en los comedores escolares.",
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
      content: "Sube aquí los documentos relacionados con la entrega de víveres.",
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
  const { isTourOpen, startTour, closeTour, completeTour } = useTour("viveres", tourSteps)

  // Función para guardar el orden en localStorage
  const saveOrder = (items: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarOrder', JSON.stringify(items))
    }
  }

  const handleFileSelect = async (file: File) => {
    try {
      if (!file) {
        throw new Error("No se ha seleccionado ningún archivo")
      }

      // Crear un nombre de archivo único
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `viveres/${fileName}`
      
      // Intentar subir el archivo directamente
      const { data, error: uploadError } = await supabase.storage
        .from('formatos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (uploadError) {
        if (uploadError.message.includes('bucket') || uploadError.message.includes('storage')) {
          throw new Error('Error de almacenamiento: Por favor, contacta al administrador del sistema')
        } else if (uploadError.message.includes('permission')) {
          throw new Error('No tienes permisos para subir archivos. Contacta al administrador.')
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('Ya existe un archivo con el mismo nombre. Por favor, inténtalo de nuevo.')
        } else {
          throw new Error(`Error al subir el archivo: ${uploadError.message}`)
        }
      }

      if (!data?.path) {
        throw new Error('No se pudo obtener la ruta del archivo subido')
      }
      
      // Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('formatos')
        .getPublicUrl(data.path)
        
      if (!publicUrl) {
        throw new Error("No se pudo obtener la URL del archivo")
      }
      
      updateField("fileUrl", publicUrl)
      setSelectedFile(file)
      
      setPopup({
        show: true,
        type: "success",
        message: "Archivo subido correctamente",
      })
    } catch (error) {
      console.error("Error detallado:", error)
      throw error // Re-lanzar el error para que lo maneje el componente FileUpload
    }
  }

  const handleSaveSignature = (data: string) => {
    updateField("signatureData", data)
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
        tipo_formato_id: TIPO_FORMATO.VIVERES,
        usuario_id: userData.usuario_id,
        fecha_diligenciamiento: new Date().toISOString(),
        estado_diligenciamiento_id: 1,
        datos_formato: {
          institucion: formData.institucion,
          sede: formData.sede,
          fecha: formData.fecha,
          firma: formData.signatureData,
          archivo_url: formData.fileUrl,
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
        message: error instanceof Error ? error.message : "Error desconocido al guardar el formato",
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
      
      {showObservationsModal && (
        <ObservationsModal
          isOpen={showObservationsModal}
          onClose={() => setShowObservationsModal(false)}
          value={formData.observations}
          onChange={(value) => updateField("observations", value)}
        />
      )}
      
      <ConfirmModal />

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
        <h1 id="viveres-title" className="text-2xl font-bold mb-4 text-black dark:text-white text-center">
          Formato de Remisión Entrega de Víveres
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="mb-2 text-black dark:text-white">Tunja</p>
            <div className="flex space-x-4 mb-4">
              <input
                id="institucion-input"
                type="text"
                placeholder="Institución Educativa"
                value={formData.institucion}
                onChange={(e) => updateField("institucion", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-black dark:text-white">Año 2025</p>
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
          <div className="relative w-full">
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
              <div className="absolute top-full left-0 mt-2 z-50">
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

        <div id="file-upload">
          <FileUpload 
            onFileSelect={handleFileSelect} 
            onError={(errorMessage) => {
              setPopup({
                show: true,
                type: "error",
                message: errorMessage
              })
            }}
          />
        </div>

        {/* Firma digital */}
        <div id="firma-digital" className="mb-6">
          <div className="mb-2 text-sm text-black dark:text-white">FIRMA DIGITAL</div>
          <div
            className="border border-gray-300 dark:border-gray-700 rounded-md h-24 mb-4 flex items-center justify-center cursor-pointer bg-white dark:bg-gray-800"
            onClick={() => setShowSignaturePad(true)}
          >
            {formData.signatureData ? (
              <img
                src={formData.signatureData || "/placeholder.svg"}
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
            onClick={() => setShowObservationsModal(true)}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md"
          >
            Observaciones
          </button>

          <button 
            className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md"
            onClick={() => setShowConfirmModal(true)}
          >
            Reportar
          </button>
        </div>
      </div>
    </div>
  )
}
