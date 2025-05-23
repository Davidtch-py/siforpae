"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"

interface Complemento {
  complemento_id: number
  nombre_complemento: string
  gramos_preescolar: number | null
  gramos_primaria: number | null
  gramos_cuarto_quinto: number | null
  gramos_secundaria: number | null
  estado: string
}

export default function EstablecerCantidad() {
  const router = useRouter()
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [selectedComplemento, setSelectedComplemento] = useState<Complemento | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [cantidad, setCantidad] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchComplementos()
  }, [])

  const fetchComplementos = async () => {
    try {
      const { data, error } = await supabase
        .from('complementos')
        .select('*')
        .eq('estado', 'activo')
        .order('nombre_complemento')

      if (error) throw error

      setComplementos(data || [])
    } catch (error) {
      console.error("Error al cargar complementos:", error)
      toast.error("Error al cargar los complementos")
    } finally {
      setLoading(false)
    }
  }

  const validarDatos = (): boolean => {
    if (!selectedComplemento) {
      toast.error("Debe seleccionar un complemento")
      return false
    }

    if (!cantidad.trim()) {
      toast.error("La cantidad es requerida")
      return false
    }

    const cantidadNum = Number(cantidad)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error("La cantidad debe ser un número positivo")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarDatos()) return
    
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('complementos_fechas')
        .upsert({
          complemento_id: selectedComplemento?.complemento_id,
          fecha: format(selectedDate, 'yyyy-MM-dd'),
          cantidad: Number(cantidad)
        })
      
      if (error) throw error
      
      toast.success("Cantidad establecida exitosamente")
      router.push("/complementos")
      
    } catch (error) {
      console.error("Error al establecer cantidad:", error)
      toast.error("Error al establecer la cantidad")
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

  if (!selectedComplemento) {
    return (
      <>
        <h1 className="text-2xl font-bold text-center mb-8 text-[#3e6b47] dark:text-[#4e8c57]">
          Establecer Cantidad de Complemento
        </h1>

        {complementos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              No hay complementos disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complementos.map((complemento) => (
              <button
                key={complemento.complemento_id}
                onClick={() => setSelectedComplemento(complemento)}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-[#f8f5e6] dark:hover:bg-gray-700 transition-colors text-left shadow-md"
              >
                <h3 className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">{complemento.nombre_complemento}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preescolar: {complemento.gramos_preescolar || 0}gr
                </p>
              </button>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-[#3e6b47] dark:text-[#4e8c57]">
        Establecer Cantidad de Complemento
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4 text-[#3e6b47] dark:text-[#4e8c57]">
            {selectedComplemento.nombre_complemento}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">Preescolar:</span>
              <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
                {selectedComplemento.gramos_preescolar || 0}gr
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">1ero a 3ro:</span>
              <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
                {selectedComplemento.gramos_primaria || 0}gr
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">4to y 5to:</span>
              <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
                {selectedComplemento.gramos_cuarto_quinto || 0}gr
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">6to a 8vo:</span>
              <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
                {selectedComplemento.gramos_secundaria || 0}gr
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
              Cantidad para {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
                placeholder="Ingrese la cantidad"
              />
              <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
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

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => router.push("/complementos")}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#2d4e34] dark:hover:bg-[#3d7446] disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "Establecer Cantidad"}
          </button>
        </div>
      </form>
    </>
  )
} 