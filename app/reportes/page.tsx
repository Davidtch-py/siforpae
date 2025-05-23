"use client"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { CheckCircle2, Clock, FileText, HelpCircle, Search, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

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
  observacion_admin: string | null
}

const ESTADOS = {
  1: 'Pendiente',
  2: 'Completado',
  3: 'Pendiente'
} as const

type EstadoId = keyof typeof ESTADOS

export default function ReportesPage() {
  const router = useRouter()
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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
        fetchReportes(userData?.rol === 'admin')
      } catch (error) {
        console.error("Error al verificar el rol:", error)
        setError("Error al cargar los datos")
        setLoading(false)
      }
    }
    
    checkAdmin()
  }, [router])

  const fetchReportes = async (admin: boolean) => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      // Primero obtenemos el usuario_id si no es admin
      let userIdToFilter
      if (!admin) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('usuario_id')
          .eq('auth_uid', user.id)
          .single()
        
        if (userError) {
          console.error("Error al obtener usuario:", userError)
          throw new Error("No se pudo obtener la información del usuario")
        }
        
        userIdToFilter = userData?.usuario_id
      }

      // Construimos la consulta base
      let query = supabase
        .from('formatosdiligenciados')
        .select(`
          *,
          tiposformato:tipo_formato_id(nombre_formato),
          usuarios:usuario_id(nombre_completo),
          estadosdiligenciamiento:estado_diligenciamiento_id(nombre_estado)
        `)
        .order('fecha_diligenciamiento', { ascending: false })
      
      // Si no es admin y tenemos un usuario_id, filtramos por él
      if (!admin && userIdToFilter) {
        query = query.eq('usuario_id', userIdToFilter)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error("Error en la consulta:", error)
        throw new Error("Error al obtener los reportes de la base de datos")
      }
      
      console.log("Datos recibidos:", data)
      
      if (data) {
        const formattedReportes = data.map(item => ({
          id: item.diligenciamiento_id,
          tipo_formato_id: item.tipo_formato_id,
          usuario_id: item.usuario_id,
          fecha_diligenciamiento: item.fecha_diligenciamiento,
          estado_diligenciamiento_id: item.estado_diligenciamiento_id || 1,
          datos_formato: item.datos_formato,
          nombre_formato: item.tiposformato?.nombre_formato || `Formato ${item.tipo_formato_id}`,
          nombre_usuario: item.usuarios?.nombre_completo || 'Usuario desconocido',
          estado: ESTADOS[item.estado_diligenciamiento_id as EstadoId || 1],
          observacion_admin: null
        }))
        
        setReportes(formattedReportes)
      }
    } catch (error) {
      console.error("Error al cargar reportes:", error)
      setError(error instanceof Error ? error.message : "Error al cargar los reportes")
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

  const filteredReportes = reportes.filter(reporte => 
    reporte.nombre_formato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reporte.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <Sidebar 
        activeSection="Reportes" 
        items={sidebarItems.filter(item => !item.adminOnly || isAdmin)} 
      />

      <main className="flex-1 p-6 max-w-4xl mx-auto md:ml-[200px] md:w-[calc(100%-200px)]">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
          {isAdmin ? "Todos los Reportes" : "Mis Reportes"}
        </h1>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar reportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
          />
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
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/reportes/${reporte.id}`)}
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57] mr-3" />
                  <div>
                    <div className="font-medium text-black dark:text-white">{reporte.nombre_formato}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(reporte.fecha_diligenciamiento).toLocaleDateString('es-ES')} - {reporte.nombre_usuario}
                    </div>
                    {reporte.observacion_admin && (
                      <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        Observación admin: {reporte.observacion_admin}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {getEstadoIcon(reporte.estado)}
                    <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{reporte.estado}</span>
                  </div>
                  <HelpCircle size={16} className="text-[#c9a55a]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
