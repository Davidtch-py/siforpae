"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"

interface Menu {
  menu_id: number
  nombre_menu: string
  estado: string
  complementos?: number[]  // Opcional porque lo agregaremos después
}

interface Complemento {
  id: number
  nombre_complemento: string
  gramos_preescolar: number | null
  gramos_primaria: number | null
  gramos_cuarto_quinto: number | null
  gramos_secundaria: number | null
  estado: string
}

export default function ConsultarMenu() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  useEffect(() => {
    if (selectedMenu) {
      fetchComplementos()
    }
  }, [selectedMenu])

  const fetchMenus = async () => {
    try {
      const { data: menusData, error: menusError } = await supabase
        .from('menus')
        .select('*')
        .eq('estado', 'activo')
        .order('nombre_menu')

      if (menusError) throw menusError

      // Para cada menú, obtenemos sus complementos
      const menusWithComplementos = await Promise.all(
        (menusData || []).map(async (menu) => {
          const { data: complementosData } = await supabase
            .from('menucomplementos')
            .select('complemento_id')
            .eq('menu_id', menu.menu_id)

          const complementosIds = (complementosData || []).map(c => c.complemento_id)
          return { ...menu, complementos: complementosIds }
        })
      )

      setMenus(menusWithComplementos)
    } catch (error) {
      console.error("Error al cargar menús:", error)
      toast.error("Error al cargar los menús")
    } finally {
      setLoading(false)
    }
  }

  const fetchComplementos = async () => {
    if (!selectedMenu) return

    try {
      const { data, error } = await supabase
        .from('complementos')
        .select('*')
        .in('complemento_id', selectedMenu.complementos || [])
        .eq('estado', 'activo')

      if (error) throw error

      setComplementos(data || [])
    } catch (error) {
      console.error("Error al cargar complementos:", error)
      toast.error("Error al cargar los complementos del menú")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3e6b47]"></div>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-[#3e6b47] dark:text-[#4e8c57]">
        Consultar Menú
      </h1>

      {menus.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            No hay menús disponibles para consultar
          </p>
        </div>
      ) : !selectedMenu ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map((menu) => (
            <button
              key={menu.menu_id}
              onClick={() => setSelectedMenu(menu)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-[#f8f5e6] dark:hover:bg-gray-700 transition-colors text-left shadow-md"
            >
              <h3 className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">{menu.nombre_menu}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(menu.complementos || []).length} complemento{(menu.complementos || []).length !== 1 ? 's' : ''}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4 text-[#3e6b47] dark:text-[#4e8c57]">
              {selectedMenu.nombre_menu}
            </h2>

            <div className="space-y-4">
              {complementos.map((complemento) => (
                <div key={complemento.id} className="p-4 bg-[#f8f5e6] dark:bg-gray-900 rounded-lg">
                  <h3 className="font-medium text-[#3e6b47] dark:text-[#4e8c57] mb-2">
                    {complemento.nombre_complemento}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Preescolar:</span>
                      <span className="ml-1 text-[#3e6b47] dark:text-[#4e8c57]">
                        {complemento.gramos_preescolar || 0}gr
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">1ero a 3ro:</span>
                      <span className="ml-1 text-[#3e6b47] dark:text-[#4e8c57]">
                        {complemento.gramos_primaria || 0}gr
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">4to y 5to:</span>
                      <span className="ml-1 text-[#3e6b47] dark:text-[#4e8c57]">
                        {complemento.gramos_cuarto_quinto || 0}gr
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">6to a 8vo:</span>
                      <span className="ml-1 text-[#3e6b47] dark:text-[#4e8c57]">
                        {complemento.gramos_secundaria || 0}gr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4 text-[#3e6b47] dark:text-[#4e8c57]">
              Seleccionar Fecha
            </h3>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>
      )}

      {selectedMenu && (
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setSelectedMenu(null)}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
          >
            Volver
          </button>
        </div>
      )}
    </>
  )
} 