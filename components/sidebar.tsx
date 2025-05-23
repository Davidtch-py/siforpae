"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface SidebarProps {
  activeSection: string
  items: {
    label: string
    href: string
    section?: string
  }[]
  isOrdering?: boolean
  onDragEnd?: (result: any) => void
  onClickOption?: (result: string) => void
}

export default function Sidebar({ activeSection, items, isOrdering = false, onDragEnd, onClickOption }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [localItems, setLocalItems] = useState(items)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadUserOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: userData } = await supabase
          .from('usuarios')
          .select('preferencias')
          .eq('auth_uid', user.id)
          .single()

        if (userData?.preferencias?.sidebarOrder) {
          setLocalItems(userData.preferencias.sidebarOrder)
        }
      } catch (error) {
        console.error('Error al cargar el orden:', error)
      }
    }

    loadUserOrder()
  }, [])

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [])

  const saveUserOrder = async (newItems: typeof items) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('usuarios')
        .select('preferencias')
        .eq('auth_uid', user.id)
        .single()

      const updatedPreferences = {
        ...userData?.preferencias,
        sidebarOrder: newItems
      }

      await supabase
        .from('usuarios')
        .update({ preferencias: updatedPreferences })
        .eq('auth_uid', user.id)

      setLocalItems(newItems)
    } catch (error) {
      console.error('Error al guardar el orden:', error)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    if (result.type === 'TOGGLE_ORDER' && onDragEnd) {
      onDragEnd(result)
      return
    }

    const items = Array.from(localItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    saveUserOrder(items)
  }

  const handleReporteClick = () => {
    router.push("/reportes")
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-[#e6e3d3] dark:bg-gray-800 rounded-md shadow-md"
          aria-label="Abrir menú"
        >
          <div className="flex flex-col space-y-1">
            <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
            <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
            <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
          </div>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside
        className={`w-[200px] bg-[#e6e3d3] dark:bg-gray-800 flex flex-col h-screen md:h-auto md:min-h-screen md:sticky md:top-0 fixed z-40 transition-all duration-300 ${
          isMobileMenuOpen ? "left-0" : "-left-[200px]"
        } md:left-0`}
      >
        {isMobileMenuOpen && (
          <button
            className="absolute top-4 right-4 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
          </button>
        )}

        <div className="p-4 flex flex-col items-center border-b border-gray-300 dark:border-gray-700">
          <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
            <div className="relative">
              <Image
                src="/avatar.svg"
                alt="Logo SIFORPAE"
                width={60}
                height={60}
                className="rounded-full border-2 border-[#3e6b47] dark:border-[#4e8c57]"
              />
              <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-[#3e6b47] text-white px-1 rounded-b-full">
                SIFORPAE
              </div>
            </div>
          </Link>
          <div className="mt-3">
            <div className="flex flex-col items-center">
              <div className="flex space-x-1">
                <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
                <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
                <div className="w-6 h-0.5 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>
              </div>
            </div>
          </div>
          <p className="text-xs mt-1 text-center text-black dark:text-gray-300">Página principal</p>
        </div>

        <h2 className="text-2xl font-bold p-4 text-[#3e6b47] dark:text-[#4e8c57]">{activeSection}</h2>

        <div className="flex flex-col overflow-y-auto flex-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable 
              droppableId="sidebar" 
              isDropDisabled={!isOrdering}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {localItems.map((item, index) => (
                    <Draggable
                      key={item.section || item.href}
                      draggableId={item.section || item.href}
                      index={index}
                      isDragDisabled={!isOrdering}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${isOrdering ? "cursor-move relative" : ""} mb-2 p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                            snapshot.isDragging
                              ? 'bg-[#3e6b47] dark:bg-[#4e8c57]'
                              : ''
                          } ${
                            pathname === item.href && !isOrdering
                              ? 'bg-[#3e6b47] dark:bg-[#4e8c57] text-white'
                              : 'bg-transparent'
                          }`}
                          onClick={
                            !isOrdering && item.href === "#"
                              ? () => onClickOption?.(item.section ?? "")
                              : undefined
                          }
                        >
                          {isOrdering && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3e6b47] dark:bg-[#4e8c57]"></div>}
                          <Link
                            href={isOrdering ? "#" : item.href}
                            onClick={(e) => {
                              if (isOrdering) {
                                e.preventDefault()
                              } else {
                                setIsMobileMenuOpen(false)
                              }
                            }}
                          >
                            <div
                              className={`p-3 text-sm hover:bg-[#3e6b47] hover:text-white dark:hover:bg-[#4e8c57] cursor-pointer ${
                                pathname === item.href && !isOrdering
                                  ? "bg-[#3e6b47] dark:bg-[#4e8c57] text-white"
                                  : "text-black dark:text-gray-300"
                              } ${isOrdering ? "border-b border-gray-300 dark:border-gray-700" : ""}`}
                            >
                              {item.label}
                            </div>
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {activeSection === "Formatos" && (
          <div className="p-4 flex justify-between">
            <button
              className={`${
                isOrdering ? "bg-[#3e6b47] text-white" : "bg-white text-black border border-[#ccc]"
              } rounded-md px-2 py-2 text-xs transition-colors duration-200 hover:bg-[#3e6b47] hover:text-white dark:hover:bg-[#4e8c57] dark:hover:text-white m-1`}
              onClick={() => onDragEnd?.({ type: 'TOGGLE_ORDER' })}
              type="button"
            >
              {isOrdering ? "Listo" : "Ordenar"}
            </button>
            <button
              className="bg-[#c9a55a] text-white rounded-md px-2 py-2 text-xs m-1"
              onClick={handleReporteClick}
              type="button"
            >
              Reporte
            </button>
          </div>
        )}

        <div className="p-4">
          <Image src="/vegetables.svg" alt="Vegetables" width={150} height={80} className="object-contain" />
        </div>
      </aside>
    </>
  )
}
