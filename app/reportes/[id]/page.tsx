"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { CheckCircle2, ChevronLeft, Clock, FileText, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ObservationsModal } from "@/components/ui/observations-modal"
import { ESTADOS_DILIGENCIAMIENTO } from "@/lib/types"

interface Reporte {
  id: number
  tipo_formato_id: number
  usuario_id: number
  fecha_diligenciamiento: string
  estado_diligenciamiento_id: number
  datos_formato: any
  nombre_formato: string
  nombre_usuario: string
  estado: string
  observaciones_admin?: string
}

export default function ReporteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [actualizando, setActualizando] = useState(false)

  const sidebarItems = [
    {
      label: "Mis Reportes",
      href: "/reportes",
    },
    {
      label: "Todos los Reportes",
      href: "/reportes/admin",
      adminOnly: true
    },
  ]

  useEffect(() => {
    const checkAdmin = async () => {
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
        
        setIsAdmin(userData?.rol === 'admin')
        fetchReporte(userData?.rol === 'admin')
      } catch (error) {
        console.error("Error al verificar el rol:", error)
        setError("Error al cargar los datos")
        setLoading(false)
      }
    }
    
    checkAdmin()
  }, [router, id])

  const fetchReporte = async (admin: boolean) => {
    try {
      setLoading(true)
      console.log("Fetching reporte with ID:", id)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from('formatosdiligenciados')
        .select(`
          *,
          tiposformato:tipo_formato_id(*),
          usuarios:usuario_id(nombre_completo),
          estadosdiligenciamiento:estado_diligenciamiento_id(nombre_estado)
        `)
        .eq('diligenciamiento_id', id)
        .single()
      
      console.log("Query response:", { data, error })
      
      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      // Si no es admin, verificar que el reporte sea del usuario
      if (!admin) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('usuario_id')
          .eq('auth_uid', user.id)
          .single()
        
        if (userData && userData.usuario_id !== data.usuario_id) {
          router.push("/reportes")
          return
        }
      }
      
      if (data) {
        console.log("Setting reporte with data:", data)
        setReporte({
          id: data.diligenciamiento_id,
          tipo_formato_id: data.tipo_formato_id,
          usuario_id: data.usuario_id,
          fecha_diligenciamiento: data.fecha_diligenciamiento,
          estado_diligenciamiento_id: data.estado_diligenciamiento_id || ESTADOS_DILIGENCIAMIENTO.PENDIENTE,
          datos_formato: data.datos_formato,
          nombre_formato: data.tiposformato?.nombre_formato || `Formato ${data.tipo_formato_id}`,
          nombre_usuario: data.usuarios?.nombre_completo || "Usuario desconocido",
          estado: data.estadosdiligenciamiento?.nombre_estado || "Pendiente",
          observaciones_admin: data.observaciones_admin
        })
      }
    } catch (error) {
      console.error("Error detallado al cargar reporte:", error)
      setError(error instanceof Error ? error.message : "Error al cargar el reporte")
    } finally {
      setLoading(false)
    }
  }
  
  const handleAprobar = async () => {
    try {
      setActualizando(true)
      
      // Primero actualizamos el estado del formato
      const { error: formatoError } = await supabase
        .from('formatosdiligenciados')
        .update({ 
          estado_diligenciamiento_id: ESTADOS_DILIGENCIAMIENTO.APROBADO
        })
        .eq('diligenciamiento_id', id)
      
      if (formatoError) throw formatoError

      // Luego actualizamos o creamos el registro en reportes
      const { data: reporteExistente } = await supabase
        .from('reporteformatos')
        .select('reporte_id')
        .eq('diligenciamiento_id', id)
        .single()

      if (reporteExistente?.reporte_id) {
        // Si existe, actualizamos la observación
        const { error: reporteError } = await supabase
          .from('reportes')
          .update({ 
            observacion_admin: observaciones || undefined
          })
          .eq('reporte_id', reporteExistente.reporte_id)
        
        if (reporteError) throw reporteError
      } else {
        // Si no existe, creamos nuevo reporte y reporteformato
        const { data: nuevoReporte, error: reporteError } = await supabase
          .from('reportes')
          .insert({ 
            usuario_id: reporte?.usuario_id,
            observacion_admin: observaciones || undefined 
          })
          .select()
          .single()
        
        if (reporteError) throw reporteError

        // Creamos la relación en reporteformatos
        const { error: relacionError } = await supabase
          .from('reporteformatos')
          .insert({ 
            reporte_id: nuevoReporte.reporte_id,
            diligenciamiento_id: id
          })
        
        if (relacionError) throw relacionError
      }
      
      // Actualizar el reporte en el estado local
      if (reporte) {
        setReporte({
          ...reporte,
          estado_diligenciamiento_id: ESTADOS_DILIGENCIAMIENTO.APROBADO,
          estado: "Aprobado",
          observaciones_admin: observaciones || undefined
        })
      }
      
      setShowObservationsModal(false)
    } catch (error) {
      console.error("Error al aprobar reporte:", error)
      alert("Error al aprobar el reporte: " + (error instanceof Error ? error.message : "Error desconocido"))
    } finally {
      setActualizando(false)
    }
  }
  
  const handleRechazar = async () => {
    if (!observaciones) {
      alert("Debe agregar observaciones para rechazar un reporte")
      return
    }
    
    try {
      setActualizando(true)
      
      // Primero actualizamos el estado del formato
      const { error: formatoError } = await supabase
        .from('formatosdiligenciados')
        .update({ 
          estado_diligenciamiento_id: ESTADOS_DILIGENCIAMIENTO.RECHAZADO
        })
        .eq('diligenciamiento_id', id)
      
      if (formatoError) throw formatoError

      // Luego actualizamos o creamos el registro en reportes
      const { data: reporteExistente } = await supabase
        .from('reporteformatos')
        .select('reporte_id')
        .eq('diligenciamiento_id', id)
        .single()

      if (reporteExistente?.reporte_id) {
        // Si existe, actualizamos la observación
        const { error: reporteError } = await supabase
          .from('reportes')
          .update({ 
            observacion_admin: observaciones
          })
          .eq('reporte_id', reporteExistente.reporte_id)
        
        if (reporteError) throw reporteError
      } else {
        // Si no existe, creamos nuevo reporte y reporteformato
        const { data: nuevoReporte, error: reporteError } = await supabase
          .from('reportes')
          .insert({ 
            usuario_id: reporte?.usuario_id,
            observacion_admin: observaciones
          })
          .select()
          .single()
        
        if (reporteError) throw reporteError

        // Creamos la relación en reporteformatos
        const { error: relacionError } = await supabase
          .from('reporteformatos')
          .insert({ 
            reporte_id: nuevoReporte.reporte_id,
            diligenciamiento_id: id
          })
        
        if (relacionError) throw relacionError
      }
      
      // Actualizar el reporte en el estado local
      if (reporte) {
        setReporte({
          ...reporte,
          estado_diligenciamiento_id: ESTADOS_DILIGENCIAMIENTO.RECHAZADO,
          estado: "Rechazado",
          observaciones_admin: observaciones
        })
      }
      
      setShowObservationsModal(false)
    } catch (error) {
      console.error("Error al rechazar reporte:", error)
      alert("Error al rechazar el reporte: " + (error instanceof Error ? error.message : "Error desconocido"))
    } finally {
      setActualizando(false)
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return <CheckCircle2 size={24} className="text-green-500" />
      case 'rechazado':
        return <XCircle size={24} className="text-red-500" />
      default:
        return <Clock size={24} className="text-amber-500" />
    }
  }
  
  const renderFormato = () => {
    if (!reporte) return null;

    const commonFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Institución</p>
          <p className="font-medium text-black dark:text-white">{reporte.datos_formato.institucion}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sede</p>
          <p className="font-medium text-black dark:text-white">{reporte.datos_formato.sede}</p>
        </div>
        {reporte.datos_formato.zona && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Zona</p>
            <p className="font-medium text-black dark:text-white">{reporte.datos_formato.zona}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
          <p className="font-medium text-black dark:text-white">{reporte.datos_formato.fecha}</p>
        </div>
      </div>
    );

    // Renderizar el formato según su tipo
    switch (reporte.tipo_formato_id) {
      case 1: // Residuos
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Formato de Disposición de Residuos
            </h2>
            {commonFields}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-black dark:text-white">Tipos de Residuos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-black dark:text-white">Orgánicos</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {Array.isArray(reporte.datos_formato.residuos?.organicos) ? (
                      reporte.datos_formato.residuos.organicos.map((item: boolean, index: number) => (
                        <li key={index} className={`text-sm ${item ? 'text-green-600' : 'text-red-600'}`}>
                          {index === 0 ? 'Residuos de alimentos' : 
                           index === 1 ? 'Cáscaras' : 
                           index === 2 ? 'Frutas y verduras' : 'Otro'}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No hay datos de residuos orgánicos</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-black dark:text-white">Inorgánicos</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {Array.isArray(reporte.datos_formato.residuos?.inorganicos) ? (
                      reporte.datos_formato.residuos.inorganicos.map((item: boolean, index: number) => (
                        <li key={index} className={`text-sm ${item ? 'text-green-600' : 'text-red-600'}`}>
                          {index === 0 ? 'Plástico' : 
                           index === 1 ? 'Papel y cartón' : 
                           index === 2 ? 'Vidrio' : 'Otro'}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No hay datos de residuos inorgánicos</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-black dark:text-white">Sanitarios</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {Array.isArray(reporte.datos_formato.residuos?.sanitarios) ? (
                      reporte.datos_formato.residuos.sanitarios.map((item: boolean, index: number) => (
                        <li key={index} className={`text-sm ${item ? 'text-green-600' : 'text-red-600'}`}>
                          {index === 0 ? 'Papel higiénico' : 
                           index === 1 ? 'Toallas sanitarias' : 
                           index === 2 ? 'Pañales' : 'Otro'}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No hay datos de residuos sanitarios</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );

      case 2: // Limpieza
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Formato de Limpieza y Desinfección
            </h2>
            {commonFields}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-black dark:text-white">Estado de las Áreas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(reporte.datos_formato.areas || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );

      case 3: // Alimentos
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Formato de Control de Alimentos
            </h2>
            {commonFields}

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-black dark:text-white">Registro de Alimentos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Alimento</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Ingreso Semana</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Día Semana</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Unidad Salida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reporte.datos_formato.registros?.map((registro: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{registro.alimento}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{registro.ingreso_semana}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{registro.dia_semana}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{registro.unidad_salida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );

      case 4: // Víveres
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Formato de Remisión de Víveres
            </h2>
            {commonFields}

            {reporte.datos_formato.archivo_url && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Archivo Adjunto</h3>
                <a 
                  href={reporte.datos_formato.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver archivo adjunto
                </a>
              </div>
            )}

            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );

      case 5: // Dotación
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              Formato de Entrega de Dotación
            </h2>
            {commonFields}

            {reporte.datos_formato.archivo_url && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Archivo Adjunto</h3>
                <a 
                  href={reporte.datos_formato.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver archivo adjunto
                </a>
              </div>
            )}

            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
              {reporte.nombre_formato}
            </h2>
            {commonFields}
            
            {reporte.datos_formato.observaciones && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">Observaciones</h3>
                <p className="text-gray-700 dark:text-gray-300">{reporte.datos_formato.observaciones}</p>
              </div>
            )}
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <Sidebar 
        activeSection="Reportes" 
        items={sidebarItems.filter(item => !item.adminOnly || isAdmin)} 
      />
      
      {showObservationsModal && (
        <ObservationsModal
          isOpen={showObservationsModal}
          onClose={() => setShowObservationsModal(false)}
          value={observaciones}
          onChange={setObservaciones}
        />
      )}

      <main className="flex-1 p-6 max-w-4xl mx-auto md:ml-[200px] md:w-[calc(100%-200px)]">
        <button
          onClick={() => router.push("/reportes")}
          className="flex items-center text-[#3e6b47] dark:text-[#4e8c57] mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver a reportes
        </button>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3e6b47]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : reporte ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  {reporte.nombre_formato}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {new Date(reporte.fecha_diligenciamiento).toLocaleDateString('es-ES')} - {reporte.nombre_usuario}
                </p>
              </div>
              <div className="flex items-center">
                {getEstadoIcon(reporte.estado)}
                <span className="ml-2 font-medium text-black dark:text-white">{reporte.estado}</span>
              </div>
            </div>
            
            {renderFormato()}
            
            {reporte.observaciones_admin && (
              <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-2 text-black dark:text-white">
                  Observaciones del administrador
                </h3>
                <p className="text-black dark:text-white">{reporte.observaciones_admin}</p>
              </div>
            )}
            
            {isAdmin && reporte.estado_diligenciamiento_id === ESTADOS_DILIGENCIAMIENTO.PENDIENTE && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowObservationsModal(true)}
                  className="px-4 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md"
                  disabled={actualizando}
                >
                  Agregar observaciones
                </button>
                <button
                  onClick={handleRechazar}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  disabled={actualizando}
                >
                  Rechazar
                </button>
                <button
                  onClick={handleAprobar}
                  className="px-4 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md"
                  disabled={actualizando}
                >
                  Aprobar
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No se encontró el reporte
          </div>
        )}
      </main>
    </div>
  )
} 