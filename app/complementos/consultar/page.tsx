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
  fecha_creacion: string
}

interface ComplementoFecha {
  id: number
  complemento_id: number
  fecha: string
  cantidad: number
}

export default function ConsultarComplemento() {
  const router = useRouter()
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [selectedComplemento, setSelectedComplemento] = useState<Complemento | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [cantidadFecha, setCantidadFecha] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplementos()
  }, [])

  useEffect(() => {
    if (selectedComplemento && selectedDate) {
      fetchCantidadFecha()
    }
  }, [selectedComplemento, selectedDate])

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

  const fetchCantidadFecha = async () => {
    if (!selectedComplemento) return

    try {
      const { data, error } = await supabase
        .from('complementos_fechas')
        .select('*')
        .eq('complemento_id', selectedComplemento.complemento_id)
        .eq('fecha', format(selectedDate, 'yyyy-MM-dd'))
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró cantidad para esta fecha
          setCantidadFecha(null)
        } else {
          throw error
        }
      } else {
        setCantidadFecha(data.cantidad)
      }
    } catch (error) {
      console.error("Error al cargar cantidad por fecha:", error)
      toast.error("Error al cargar la cantidad para la fecha seleccionada")
    }
  }

  const handleSelectComplemento = (complemento: Complemento) => {
    setSelectedComplemento(complemento)
    setCantidadFecha(null)
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
        Consultar Complemento
      </h1>

      {complementos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            No hay complementos disponibles para consultar
          </p>
        </div>
      ) : !selectedComplemento ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complementos.map((complemento) => (
            <button
              key={complemento.complemento_id}
              onClick={() => handleSelectComplemento(complemento)}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-[#f8f5e6] dark:hover:bg-gray-700 transition-colors text-left shadow-md"
            >
              <h3 className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">{complemento.nombre_complemento}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Preescolar: {complemento.gramos_preescolar || 0}gr
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {cantidadFecha !== null && (
              <div className="mt-6 p-4 bg-[#f8f5e6] dark:bg-gray-900 rounded-lg">
                <h3 className="text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
                  Cantidad para {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}:
                </h3>
                <p className="text-2xl font-bold text-[#3e6b47] dark:text-[#4e8c57]">
                  {cantidadFecha}gr
                </p>
              </div>
            )}

            {cantidadFecha === null && (
              <div className="mt-6 p-4 bg-[#f8f5e6] dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No se ha establecido una cantidad para la fecha seleccionada
                </p>
              </div>
            )}
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

      {selectedComplemento && (
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setSelectedComplemento(null)}
            className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
          >
            Volver
          </button>
        </div>
      )}
    </>
  )
} 