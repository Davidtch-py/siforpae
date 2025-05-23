"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Menu {
  menu_id: number
  nombre_menu: string
  estado: string
  fechas_entrega?: Date[]
}

export default function EstablecerFecha() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    fetchMenus()
  }, [])

  useEffect(() => {
    if (selectedMenu?.fechas_entrega) {
      setSelectedDates(selectedMenu.fechas_entrega)
    } else {
      setSelectedDates([])
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

      // Para cada menú, obtenemos sus fechas de entrega
      const menusWithDates = await Promise.all(
        (menusData || []).map(async (menu) => {
          const { data: fechasData } = await supabase
            .from('entregamenus')
            .select('fecha_entrega')
            .eq('menu_id', menu.menu_id)

          const fechas = (fechasData || []).map(f => new Date(f.fecha_entrega))
          return { ...menu, fechas_entrega: fechas }
        })
      )

      setMenus(menusWithDates)
    } catch (error) {
      console.error("Error al cargar menús:", error)
      toast.error("Error al cargar los menús")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMenu) {
      toast.error("Debe seleccionar un menú")
      return
    }

    if (selectedDates.length === 0) {
      toast.error("Debe seleccionar al menos una fecha")
      return
    }
    
    try {
      setSaving(true)

      // Primero eliminamos las fechas existentes
      const { error: deleteError } = await supabase
        .from('entregamenus')
        .delete()
        .eq('menu_id', selectedMenu.menu_id)

      if (deleteError) throw deleteError

      // Luego insertamos las nuevas fechas
      const fechasData = selectedDates.map(date => ({
        menu_id: selectedMenu.menu_id,
        fecha_entrega: format(date, 'yyyy-MM-dd'),
        fecha_creacion: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('entregamenus')
        .insert(fechasData)
      
      if (insertError) throw insertError
      
      toast.success("Fechas establecidas exitosamente")
      router.push("/menus")
      
    } catch (error) {
      console.error("Error al establecer fechas:", error)
      toast.error("Error al establecer las fechas")
    } finally {
      setSaving(false)
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
        Establecer Fechas de Entrega
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
            Seleccionar Menú
          </label>
          <select
            value={selectedMenu?.menu_id || ""}
            onChange={(e) => {
              const menu = menus.find(m => m.menu_id === parseInt(e.target.value))
              setSelectedMenu(menu || null)
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          >
            <option value="">Seleccione un menú</option>
            {menus.map((menu) => (
              <option key={menu.menu_id} value={menu.menu_id}>
                {menu.nombre_menu}
              </option>
            ))}
          </select>
        </div>

        {selectedMenu && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#3e6b47] dark:text-[#4e8c57]">
                  Seleccionar Fechas
                </label>
                <HelpTooltip text="Seleccione las fechas en las que se entregará este menú" />
              </div>

              <div className="relative">
                <div
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 rounded-md flex items-center cursor-pointer"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57] mr-2" />
                  <div className="flex-1 text-gray-900 dark:text-gray-100">
                    {selectedDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.map((date, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-[#3e6b47] dark:text-[#4e8c57]"
                          >
                            {format(date, "d 'de' MMMM", { locale: es })}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "Seleccione las fechas"
                    )}
                  </div>
                </div>

                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates: Date[] | undefined) => {
                        if (dates) {
                          setSelectedDates(dates)
                        }
                      }}
                      className="rounded-md border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/menus")}
                className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#2d4e34] dark:hover:bg-[#3d7446] disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : "Establecer Fechas"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
} 