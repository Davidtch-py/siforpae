"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface Complemento {
  complemento_id: number
  nombre_complemento: string
  gramos_preescolar: number | null
  gramos_primaria: number | null
  gramos_cuarto_quinto: number | null
  gramos_secundaria: number | null
  estado: string
}

export default function CrearMenu() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState("")
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [selectedComplementos, setSelectedComplementos] = useState<number[]>([])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      toast.error("El nombre del menú es requerido")
      return
    }

    if (selectedComplementos.length === 0) {
      toast.error("Debe seleccionar al menos un complemento")
      return
    }
    
    try {
      setSaving(true)
      
      // Primero creamos el menú
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .insert([{
          nombre_menu: nombre,
          estado: 'activo',
          fecha_creacion: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (menuError) throw menuError

      // Luego creamos las relaciones en menucomplementos
      const menuComplementosData = selectedComplementos.map(complementoId => ({
        menu_id: menuData.menu_id,
        complemento_id: complementoId
      }))

      const { error: relationError } = await supabase
        .from('menucomplementos')
        .insert(menuComplementosData)
      
      if (relationError) throw relationError
      
      toast.success("Menú creado exitosamente")
      router.push("/menus")
      
    } catch (error) {
      console.error("Error al crear menú:", error)
      toast.error("Error al crear el menú")
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
        Crear Nuevo Menú
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#3e6b47] dark:text-[#4e8c57]">
            Nombre del Menú
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-[#f8f5e6] dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
              placeholder="Ingrese el nombre del menú"
            />
            <HelpTooltip text="Ingrese un nombre descriptivo para el menú" className="ml-2" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#3e6b47] dark:text-[#4e8c57]">Seleccionar Complementos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complementos.map((complemento) => (
              <div
                key={complemento.complemento_id}
                className="flex items-center space-x-3 p-4 bg-[#f8f5e6] dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <Checkbox
                  checked={selectedComplementos.includes(complemento.complemento_id)}
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedComplementos([...selectedComplementos, complemento.complemento_id])
                    } else {
                      setSelectedComplementos(selectedComplementos.filter(id => id !== complemento.complemento_id))
                    }
                  }}
                />
                <div>
                  <p className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">{complemento.nombre_complemento}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Preescolar: {complemento.gramos_preescolar || 0}gr
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
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
            {saving ? "Guardando..." : "Hecho"}
          </button>
        </div>
      </form>
    </>
  )
} 