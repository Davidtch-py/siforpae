"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { CheckCircle2, Clock, FileText, HelpCircle, Search, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
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
  observaciones_admin: string
}

export default function AdminReportesPage() {
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

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
        
        if (userData?.rol !== 'admin') {
          router.push("/reportes")
          return
        }
        
        setIsAdmin(true)
        fetchReportes()
      } catch (error) {
        console.error("Error al verificar el rol:", error)
        setError("Error al cargar los datos")
        setLoading(false)
      }
    }
    
    checkAdmin()
  }, [router])

  const fetchReportes = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('formatosdiligenciados')
        .select(`
          diligenciamiento_id,
          tipo_formato_id,
          usuario_id,
          fecha_diligenciamiento,
          estado_diligenciamiento_id,
          datos_formato,
          tiposformato!tipo_formato_id (nombre_formato),
          usuarios!usuario_id (nombre_completo),
          estadosdiligenciamiento!estado_diligenciamiento_id (nombre_estado),
          reporteformatos!diligenciamiento_id (
            reportes!reporte_id (
              observacion_admin
            )
          )
        `)
        .order('fecha_diligenciamiento', { ascending: false })
      
      console.log("Datos obtenidos:", data)
      
      if (error) throw error
      
      if (data) {
        const formattedReportes = data.map(item => ({
          id: item.diligenciamiento_id,
          tipo_formato_id: item.tipo_formato_id,
          usuario_id: item.usuario_id,
          fecha_diligenciamiento: item.fecha_diligenciamiento,
          estado_diligenciamiento_id: item.estado_diligenciamiento_id || ESTADOS_DILIGENCIAMIENTO.PENDIENTE,
          datos_formato: item.datos_formato,
          nombre_formato: item.tiposformato[0]?.nombre_formato || `Formato ${item.tipo_formato_id}`,
          nombre_usuario: item.usuarios[0]?.nombre_completo || 'Usuario desconocido',
          estado: item.estadosdiligenciamiento[0]?.nombre_estado || 'Pendiente',
          observaciones_admin: item.reporteformatos[0]?.reportes[0]?.observacion_admin
        }))
        
        console.log("Reportes formateados:", formattedReportes)
        setReportes(formattedReportes)
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error)
      setError("Error al cargar los reportes")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return <CheckCircle2 size={18} className="text-green-500" />
      case 'rechazado':
        return <XCircle size={18} className="text-red-500" />
      default:
        return <Clock size={18} className="text-amber-500" />
    }
  }

  const filteredReportes = reportes.filter(reporte => {
    const matchesSearch = 
      reporte.nombre_formato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filtroEstado === null || reporte.estado.toLowerCase() === filtroEstado.toLowerCase();
    
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <Sidebar 
        activeSection="Reportes" 
        items={sidebarItems} 
      />

      <main className="flex-1 p-6 max-w-4xl mx-auto md:ml-[200px] md:w-[calc(100%-200px)]">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
          Administración de Reportes
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre de formato o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filtroEstado || ''}
              onChange={(e) => setFiltroEstado(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3e6b47]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : filteredReportes.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No se encontraron reportes
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReportes.map((reporte) => (
              <div 
                key={reporte.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/reportes/${reporte.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57] mr-3" />
                    <div>
                      <div className="font-medium text-black dark:text-white">{reporte.nombre_formato}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(reporte.fecha_diligenciamiento).toLocaleDateString('es-ES')} - {reporte.nombre_usuario}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getEstadoIcon(reporte.estado)}
                    <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{reporte.estado}</span>
                  </div>
                </div>
                {reporte.observaciones_admin && (
                  <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    <span className="font-medium">Observaciones:</span> {reporte.observaciones_admin}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 