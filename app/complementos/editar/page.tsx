"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

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

export default function EditarComplemento() {
  const router = useRouter()
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [selectedComplemento, setSelectedComplemento] = useState<Complemento | null>(null)
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

  const handleSelectComplemento = (complemento: Complemento) => {
    setSelectedComplemento(complemento)
  }

  const handleGramosChange = (field: keyof Pick<Complemento, 'gramos_preescolar' | 'gramos_primaria' | 'gramos_cuarto_quinto' | 'gramos_secundaria'>, value: string) => {
    if (!selectedComplemento) return

    setSelectedComplemento({
      ...selectedComplemento,
      [field]: value ? Number(value) : null
    })
  }

  const validarDatos = (): boolean => {
    if (!selectedComplemento) return false

    if (!selectedComplemento.nombre_complemento.trim()) {
      toast.error("El nombre del complemento es requerido")
      return false
    }

    const cantidades = [
      selectedComplemento.gramos_preescolar,
      selectedComplemento.gramos_primaria,
      selectedComplemento.gramos_cuarto_quinto,
      selectedComplemento.gramos_secundaria
    ]
    
    for (const cantidad of cantidades) {
      if (cantidad === null) {
        toast.error("Todas las cantidades son requeridas")
        return false
      }
      if (cantidad <= 0) {
        toast.error("Las cantidades deben ser números positivos")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedComplemento || !validarDatos()) return
    
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('complementos')
        .update({
          nombre_complemento: selectedComplemento.nombre_complemento,
          gramos_preescolar: selectedComplemento.gramos_preescolar,
          gramos_primaria: selectedComplemento.gramos_primaria,
          gramos_cuarto_quinto: selectedComplemento.gramos_cuarto_quinto,
          gramos_secundaria: selectedComplemento.gramos_secundaria
        })
        .eq('complemento_id', selectedComplemento.complemento_id)
      
      if (error) throw error
      
      toast.success("Complemento actualizado exitosamente")
      router.push("/complementos")
      
    } catch (error) {
      console.error("Error al actualizar complemento:", error)
      toast.error("Error al actualizar el complemento")
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
        Editar Complemento
      </h1>

      {complementos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            No hay complementos disponibles para editar
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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
              Nombre del Complemento
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={selectedComplemento.nombre_complemento}
                onChange={(e) => setSelectedComplemento({ ...selectedComplemento, nombre_complemento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
                placeholder="Ingrese el nombre del complemento"
              />
              <HelpTooltip text="Ingrese el nombre del complemento alimenticio" className="ml-2" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">Cantidades por Grupo Etáreo</h2>
            
            <div className="flex items-center">
              <span className="text-sm mr-2 w-32 text-[#3e6b47] dark:text-[#4e8c57]">Preescolar</span>
              <HelpTooltip text="Cantidad en gramos para nivel preescolar" className="mr-2" />
              <input
                type="number"
                min="0"
                placeholder="Cantidad en gramos"
                value={selectedComplemento.gramos_preescolar || ""}
                onChange={(e) => handleGramosChange("gramos_preescolar", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
              />
              <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
            </div>

            <div className="flex items-center">
              <span className="text-sm mr-2 w-32 text-[#3e6b47] dark:text-[#4e8c57]">1ero a 3ro</span>
              <HelpTooltip text="Cantidad en gramos para 1ro a 3er grado" className="mr-2" />
              <input
                type="number"
                min="0"
                placeholder="Cantidad en gramos"
                value={selectedComplemento.gramos_primaria || ""}
                onChange={(e) => handleGramosChange("gramos_primaria", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
              />
              <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
            </div>

            <div className="flex items-center">
              <span className="text-sm mr-2 w-32 text-[#3e6b47] dark:text-[#4e8c57]">4to y 5to</span>
              <HelpTooltip text="Cantidad en gramos para 4to y 5to grado" className="mr-2" />
              <input
                type="number"
                min="0"
                placeholder="Cantidad en gramos"
                value={selectedComplemento.gramos_cuarto_quinto || ""}
                onChange={(e) => handleGramosChange("gramos_cuarto_quinto", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
              />
              <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
            </div>

            <div className="flex items-center">
              <span className="text-sm mr-2 w-32 text-[#3e6b47] dark:text-[#4e8c57]">6to a 8vo</span>
              <HelpTooltip text="Cantidad en gramos para 6to a 8vo grado" className="mr-2" />
              <input
                type="number"
                min="0"
                placeholder="Cantidad en gramos"
                value={selectedComplemento.gramos_secundaria || ""}
                onChange={(e) => handleGramosChange("gramos_secundaria", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
              />
              <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => setSelectedComplemento(null)}
              className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#2d4e34] dark:hover:bg-[#3d7446] disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Hecho"}
            </button>
          </div>
        </form>
      )}
    </>
  )
} 