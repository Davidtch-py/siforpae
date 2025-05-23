"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Complemento {
  complemento_id: number
  nombre_complemento: string
  gramos_preescolar: number
  gramos_primaria: number
  gramos_cuarto_quinto: number
  gramos_secundaria: number
  estado: string
}

export default function EliminarComplemento() {
  const router = useRouter()
  const [complementos, setComplementos] = useState<Complemento[]>([])
  const [selectedComplemento, setSelectedComplemento] = useState<Complemento | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!selectedComplemento) return
    
    try {
      setDeleting(true)
      
      const { error } = await supabase
        .from('complementos')
        .update({ estado: 'inactivo' })
        .eq('complemento_id', selectedComplemento.complemento_id)
      
      if (error) throw error
      
      toast.success("Complemento inhabilitado exitosamente")
      router.push("/complementos")
      
    } catch (error) {
      console.error("Error al inhabilitar complemento:", error)
      toast.error("Error al inhabilitar el complemento")
    } finally {
      setDeleting(false)
      setShowConfirmDialog(false)
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
          Eliminar Complemento
        </h1>

        {complementos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              No hay complementos disponibles para eliminar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complementos.map((complemento) => (
              <button
                key={complemento.complemento_id}
                onClick={() => handleSelectComplemento(complemento)}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-[#f8f5e6] dark:hover:bg-gray-700 transition-colors text-left shadow-md"
              >
                <h3 className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">{complemento.nombre_complemento}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preescolar: {complemento.gramos_preescolar}gr
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
        Eliminar Complemento
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium mb-4 text-[#3e6b47] dark:text-[#4e8c57]">
          {selectedComplemento.nombre_complemento}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">Preescolar:</span>
            <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
              {selectedComplemento.gramos_preescolar}gr
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">1ero a 3ro:</span>
            <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
              {selectedComplemento.gramos_primaria}gr
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">4to y 5to:</span>
            <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
              {selectedComplemento.gramos_cuarto_quinto}gr
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#3e6b47] dark:text-[#4e8c57]">6to a 8vo:</span>
            <span className="font-medium text-[#3e6b47] dark:text-[#4e8c57]">
              {selectedComplemento.gramos_secundaria}gr
            </span>
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
            type="button"
            onClick={() => setShowConfirmDialog(true)}
            disabled={deleting}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#3e6b47] dark:text-[#4e8c57]">¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Esta acción inhabilitará el complemento "{selectedComplemento.nombre_complemento}" y no podrá ser utilizado.
              ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white">
              No, cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sí, inhabilitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 