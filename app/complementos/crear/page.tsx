"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ComplementoFormData {
  nombre_complemento: string
  gramos_preescolar: string
  gramos_primaria: string
  gramos_cuarto_quinto: string
  gramos_secundaria: string
}

export default function CrearComplemento() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ComplementoFormData>({
    nombre_complemento: "",
    gramos_preescolar: "",
    gramos_primaria: "",
    gramos_cuarto_quinto: "",
    gramos_secundaria: "",
  })

  const handleGramosChange = (field: keyof Omit<ComplementoFormData, 'nombre_complemento'>, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const validarDatos = (): boolean => {
    if (!formData.nombre_complemento.trim()) {
      toast.error("El nombre del complemento es requerido")
      return false
    }

    const cantidades = [
      formData.gramos_preescolar,
      formData.gramos_primaria,
      formData.gramos_cuarto_quinto,
      formData.gramos_secundaria
    ]
    
    for (const cantidad of cantidades) {
      if (!cantidad.trim()) {
        toast.error("Todas las cantidades son requeridas")
        return false
      }
      if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
        toast.error("Las cantidades deben ser números positivos")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarDatos()) return
    
    try {
      setLoading(true)
      
      const { error, data } = await supabase
        .from('complementos')
        .insert([
          {
            nombre_complemento: formData.nombre_complemento,
            gramos_preescolar: Number(formData.gramos_preescolar),
            gramos_primaria: Number(formData.gramos_primaria),
            gramos_cuarto_quinto: Number(formData.gramos_cuarto_quinto),
            gramos_secundaria: Number(formData.gramos_secundaria),
            estado: 'activo',
            fecha_creacion: new Date().toISOString()
          }
        ])
        .select()
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        throw new Error("No se pudo crear el complemento")
      }

      toast.success("Complemento creado exitosamente")
      router.push("/complementos")
      
    } catch (error) {
      console.error("Error al crear complemento:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear el complemento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8 text-[#3e6b47] dark:text-[#4e8c57]">
        Crear Nuevo Complemento
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
            Nombre del Complemento
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={formData.nombre_complemento}
              onChange={(e) => setFormData({ ...formData, nombre_complemento: e.target.value })}
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
              value={formData.gramos_preescolar}
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
              value={formData.gramos_primaria}
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
              value={formData.gramos_cuarto_quinto}
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
              value={formData.gramos_secundaria}
              onChange={(e) => handleGramosChange("gramos_secundaria", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
            />
            <span className="ml-2 text-[#3e6b47] dark:text-[#4e8c57]">gr</span>
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
            disabled={loading}
            className="px-6 py-2 bg-[#3e6b47] dark:bg-[#4e8c57] text-white rounded-md hover:bg-[#2d4e34] dark:hover:bg-[#3d7446] disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Hecho"}
          </button>
        </div>
      </form>
    </>
  )
} 