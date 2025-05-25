"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { getSidebarItems } from "../formatos"

interface FormatInterface{
  nombre_usuario: string,
  nombre_formato: string,
  fecha_diligenciamiento: string,
  datos_formato: any
}

export default function AlmacenamientoPage() {
  const router = useRouter()
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [isOrdering, setIsOrdering] = useState(false)
  const [showBlur, setShowBlur] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actualFormat, setActualFormat] = useState(-1)
  const [formatList, setFormatList] = useState<FormatInterface[]>([])



  // Cargar los menús desde la base de datos
  useEffect(() => {
  const loadFormats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_formatos_almacenamiento')

    if (error) throw error

    const formattedData: FormatInterface[] = (data || []).map((item: any) => ({
      nombre_usuario: item.nombre_completo || '',
      nombre_formato: item.nombre_formato || '',
      fecha_diligenciamiento: item.fecha_diligenciamiento,
      datos_formato: item.datos_formato
    }))

    setFormatList(formattedData)
  } catch (error) {
    console.error('Error al cargar los formatos:', error)
    setPopup({
      show: true,
      type: "error",
      message: "Error al cargar los formatos"
    })
  }
}

  loadFormats()
}, [])



  const defaultItems = getSidebarItems()

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

      <div className="flex-1 p-4 md:p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Almacenamiento de formatos<br />
          Diligenciados
        </h1>
        <div className="w-full  grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-black dark:text-white">Tunja</p>
          </div>
          <div>
            <p className="text-black dark:text-white text-right">Año 2025</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center">
           <select
              value={actualFormat >= 0 ? actualFormat : ""}
              onChange={(e) => {
                const value = e.target.value;
                setActualFormat(value === "" ? -1 : Number(value));
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black"
            >
              <option value="">Seleccionar Formato</option>
              {formatList.map((format, index) => (
                <option key={index} value={index} >
                    {formatOptionText(format.nombre_formato.toUpperCase(), format.fecha_diligenciamiento, format.nombre_usuario)}
                </option>
              ))}
            </select>
            <HelpTooltip text="Seleccione el formato a mostrar" className="ml-2" />
          </div>
        </div>
        {formatList.length > 0 && actualFormat >= 0 && formatList[actualFormat] && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
            Detalles del Formato
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Formato:
              </label>
              <p className="text-black dark:text-white font-medium">
                {formatList[actualFormat].nombre_formato}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario:
              </label>
              <p className="text-black dark:text-white font-medium">
                {formatList[actualFormat].nombre_usuario}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Diligenciamiento:
              </label>
              <p className="text-black dark:text-white font-medium">
                {new Date(formatList[actualFormat].fecha_diligenciamiento).toLocaleDateString()}
              </p>
            </div>
          </div>
        
         {formatList[actualFormat].datos_formato && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
      Datos del Formato:
    </h3>
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
      {Object.entries(formatList[actualFormat].datos_formato).map(([key, value]) => (
        <div key={key} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300 min-w-0 sm:w-1/4">
              {key}:
            </span>
            <div className="flex-1 min-w-0">
              {typeof value === 'object' ? (
                <pre className="text-xs text-black dark:text-white bg-white dark:bg-gray-800 p-2 rounded border overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : typeof value === 'string' && value.startsWith('data:image') ? (
                <div className="space-y-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Imagen codificada en base64</span>
                  <img 
                    src={value} 
                    alt="Imagen del formato" 
                    className="max-w-full h-auto max-h-48 border rounded"
                  />
                  <div style={{display: 'none'}} className="text-sm text-red-600 dark:text-red-400">
                    Error al cargar la imagen
                  </div>
                </div>
              ) : typeof value === 'string' && value.startsWith('https://') ? (
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                >
                  {value}
                </a>
              ) : (
                <span className="text-black dark:text-white text-sm break-words">
                  {String(value)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      )}

      
      {formatList.length > 0 && (actualFormat === -1) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-center">
            Seleccione un formato para ver sus detalles
          </p>
        </div>
      )}
      
      {formatList.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No hay formatos disponibles para mostrar
          </p>
        </div>
      )}
      </div>
    </div>
  )
}

const formatOptionText = (nombreFormato:string, fecha:string, nombreUsuario:string) => {
  nombreFormato = nombreFormato.toUpperCase();
  return `${nombreFormato}  ${fecha}  ${nombreUsuario}`;
};