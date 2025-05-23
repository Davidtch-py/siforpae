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

interface Menu {
  menu_id: number
  nombre_menu: string
  complementos: number[]
  estado: string
}

export default function EliminarMenu() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('estado', 'activo')
        .order('nombre_menu')

      if (error) throw error

      setMenus(data || [])
    } catch (error) {
      console.error("Error al cargar menús:", error)
      toast.error("Error al cargar los menús")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMenu) return

    try {
      const { error } = await supabase
        .from('menus')
        .update({ estado: 'inactivo' })
        .eq('menu_id', selectedMenu.menu_id)

      if (error) throw error

      toast.success("Menú inhabilitado exitosamente")
      router.push("/menus")
    } catch (error) {
      console.error("Error al inhabilitar menú:", error)
      toast.error("Error al inhabilitar el menú")
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
        Eliminar Menú
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
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/menus")}
              className="px-6 py-2 border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] rounded-md hover:bg-[#c9a55a] hover:text-white dark:hover:bg-[#d9b56a] dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#3e6b47] dark:text-[#4e8c57]">¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                Esta acción inhabilitará el menú "{selectedMenu?.nombre_menu}". Esta acción no se puede deshacer.
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
      </div>
    </>
  )
} 