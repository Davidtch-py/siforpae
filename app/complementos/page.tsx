"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { ChevronDown } from "lucide-react"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { useFormStorage } from "@/hooks/use-form-storage"

interface ComplementoFormData {
  institucion: string
  sede: string
  zona: string
  nombreComplemento: string
  cantidades: {
    preescolar: string
    primaria: string
    cuartoQuinto: string
    secundaria: string
  }
}

export default function ComplementosPage() {
  const [activeSection, setActiveSection] = useState("crear")

  const sidebarItems = [
    {
      label: "Crear Nuevo Complemento",
      href: "/complementos/crear",
    },
    {
      label: "Consultar Complemento",
      href: "/complementos/consultar",
    },
    {
      label: "Editar Complemento",
      href: "/complementos/editar",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <Sidebar activeSection="Complemento" items={sidebarItems} />

      <div className="flex-1 p-6 md:ml-[200px] max-w-4xl mx-auto">
        {activeSection === "crear" && <CrearComplementoForm />}
        {activeSection === "consultar" && <ConsultarComplementoForm />}
        {activeSection === "editar" && <EditarComplementoForm />}
      </div>
    </div>
  )
}

function CrearComplementoForm() {
  const initialData: ComplementoFormData = {
    institucion: "",
    sede: "",
    zona: "",
    nombreComplemento: "",
    cantidades: {
      preescolar: "",
      primaria: "",
      cuartoQuinto: "",
      secundaria: "",
    },
  }

  const { formData, updateField, isLoaded } = useFormStorage<ComplementoFormData>("crear-complemento", initialData)

  const handleCantidadChange = (field: keyof typeof formData.cantidades, value: string) => {
    updateField("cantidades", {
      ...formData.cantidades,
      [field]: value,
    })
  }

  if (!isLoaded) {
    return <div className="p-4 text-center">Cargando formulario...</div>
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
        Formato de Disposicion de Residuos Solidos en Comedor Escolares
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="mb-2 text-black dark:text-white">Tunja</p>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Institución Educativa"
              value={formData.institucion}
              onChange={(e) => updateField("institucion", e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
            />
          </div>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Sede educativa"
              value={formData.sede}
              onChange={(e) => updateField("sede", e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-black dark:text-white">Año 2025</p>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full">
              <select
                value={formData.zona}
                onChange={(e) => updateField("zona", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full appearance-none"
              >
                <option value="">Zona</option>
                <option value="norte">Norte</option>
                <option value="sur">Sur</option>
                <option value="este">Este</option>
                <option value="oeste">Oeste</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-black dark:text-white">Nombre del Complemento</p>
        <div className="flex items-center">
          <input
            type="text"
            value={formData.nombreComplemento}
            onChange={(e) => updateField("nombreComplemento", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <HelpTooltip text="Ingrese el nombre del complemento alimenticio" className="ml-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">Preescolar</span>
          <HelpTooltip text="Cantidad en gramos para nivel preescolar" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.preescolar}
            onChange={(e) => handleCantidadChange("preescolar", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">1ero, 2do, 3ro</span>
          <HelpTooltip text="Cantidad en gramos para 1ro, 2do y 3er grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.primaria}
            onChange={(e) => handleCantidadChange("primaria", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">4to, 5to</span>
          <HelpTooltip text="Cantidad en gramos para 4to y 5to grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.cuartoQuinto}
            onChange={(e) => handleCantidadChange("cuartoQuinto", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">6to, 7mo, 8vo</span>
          <HelpTooltip text="Cantidad en gramos para 6to, 7mo y 8vo grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.secundaria}
            onChange={(e) => handleCantidadChange("secundaria", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md">
          Cancelar
        </button>

        <button className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md">
          Observaciones
        </button>

        <button className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md">Guardar</button>
      </div>
    </>
  )
}

function ConsultarComplementoForm() {
  return (
    <>
      <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">Consultar Complemento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="mb-2 text-black dark:text-white">Tunja</p>
        </div>

        <div>
          <p className="mb-2 text-black dark:text-white">Año 2025</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-black dark:text-white">Nombre del Complemento</p>
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700">
          XXXXXXXXX
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">Preescolar</span>
          <HelpTooltip text="Cantidad en gramos para nivel preescolar" className="mr-2" />
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 w-full">
            XXXXXXXXXXXXXX
          </div>
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">1ero, 2do, 3ro</span>
          <HelpTooltip text="Cantidad en gramos para 1ro, 2do y 3er grado" className="mr-2" />
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 w-full">
            XXXXXXXXXXXXXX
          </div>
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">4to, 5to</span>
          <HelpTooltip text="Cantidad en gramos para 4to y 5to grado" className="mr-2" />
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 w-full">
            XXXXXXXXXXXXXX
          </div>
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">6to, 7mo, 8vo</span>
          <HelpTooltip text="Cantidad en gramos para 6to, 7mo y 8vo grado" className="mr-2" />
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 border border-gray-300 dark:border-gray-700 w-full">
            XXXXXXXXXXXXXX
          </div>
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md">
          Cancelar
        </button>

        <button className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md">
          Observaciones
        </button>

        <button className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md">Guardar</button>
      </div>
    </>
  )
}

function EditarComplementoForm() {
  const initialData: ComplementoFormData = {
    institucion: "",
    sede: "",
    zona: "",
    nombreComplemento: "",
    cantidades: {
      preescolar: "",
      primaria: "",
      cuartoQuinto: "",
      secundaria: "",
    },
  }

  const { formData, updateField, isLoaded } = useFormStorage<ComplementoFormData>("editar-complemento", initialData)

  const handleCantidadChange = (field: keyof typeof formData.cantidades, value: string) => {
    updateField("cantidades", {
      ...formData.cantidades,
      [field]: value,
    })
  }

  if (!isLoaded) {
    return <div className="p-4 text-center">Cargando formulario...</div>
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">Editar Complemento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="mb-2 text-black dark:text-white">Tunja</p>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Institución Educativa"
              value={formData.institucion}
              onChange={(e) => updateField("institucion", e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
            />
          </div>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Sede educativa"
              value={formData.sede}
              onChange={(e) => updateField("sede", e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-black dark:text-white">Año 2025</p>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full">
              <select
                value={formData.zona}
                onChange={(e) => updateField("zona", e.target.value)}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-1 text-sm border border-gray-300 dark:border-gray-700 w-full appearance-none"
              >
                <option value="">Zona</option>
                <option value="norte">Norte</option>
                <option value="sur">Sur</option>
                <option value="este">Este</option>
                <option value="oeste">Oeste</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-black dark:text-white">Nombre del Complemento</p>
        <div className="flex items-center">
          <input
            type="text"
            value={formData.nombreComplemento}
            onChange={(e) => updateField("nombreComplemento", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <HelpTooltip text="Ingrese el nombre del complemento alimenticio" className="ml-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">Preescolar</span>
          <HelpTooltip text="Cantidad en gramos para nivel preescolar" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.preescolar}
            onChange={(e) => handleCantidadChange("preescolar", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">1ero, 2do, 3ro</span>
          <HelpTooltip text="Cantidad en gramos para 1ro, 2do y 3er grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.primaria}
            onChange={(e) => handleCantidadChange("primaria", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">4to, 5to</span>
          <HelpTooltip text="Cantidad en gramos para 4to y 5to grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.cuartoQuinto}
            onChange={(e) => handleCantidadChange("cuartoQuinto", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm mr-2 w-32 text-black dark:text-white">6to, 7mo, 8vo</span>
          <HelpTooltip text="Cantidad en gramos para 6to, 7mo y 8vo grado" className="mr-2" />
          <input
            type="text"
            placeholder="Cantidad por Gramos"
            value={formData.cantidades.secundaria}
            onChange={(e) => handleCantidadChange("secundaria", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47]"
          />
          <span className="ml-2 text-black dark:text-white">gr</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md">
          Cancelar
        </button>

        <button className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md">Reestablecer</button>

        <button className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md">Guardar</button>
      </div>
    </>
  )
}
