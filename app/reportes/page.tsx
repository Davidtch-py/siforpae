"use client"
import Sidebar from "@/components/sidebar"
import { HelpCircle } from "lucide-react"

export default function ReportesPage() {
  const sidebarItems = [
    {
      label: "Consultar Reporte",
      href: "/reportes/consultar",
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6]">
      <Sidebar activeSection="Reportes" items={sidebarItems} />

      <main className="flex-1 p-6 max-w-4xl mx-auto md:ml-[200px] md:w-[calc(100%-200px)]">
        <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">
          Formato de Disposicion de Residuos Solidos en Comedor Escolares
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="mb-2 text-black dark:text-white">Tunja</p>
          </div>

          <div>
            <p className="mb-2 text-black dark:text-white">Año 2025</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <span className="font-medium text-black dark:text-white">Reporte 1 Formato xxxx</span>
              <HelpCircle size={16} className="text-[#c9a55a] ml-2" />
            </div>
            <button className="text-[#3e6b47] font-medium">Ver</button>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <span className="font-medium text-black dark:text-white">Reporte 2 Formato xxx</span>
              <HelpCircle size={16} className="text-[#c9a55a] ml-2" />
            </div>
            <button className="text-[#3e6b47] font-medium">Ver</button>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <span className="font-medium text-black dark:text-white">Reporte 3 Formato xxx</span>
              <HelpCircle size={16} className="text-[#c9a55a] ml-2" />
            </div>
            <button className="text-[#3e6b47] font-medium">Ver</button>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <span className="font-medium text-black dark:text-white">Reporte 4 Formato xxx</span>
              <HelpCircle size={16} className="text-[#c9a55a] ml-2" />
            </div>
            <button className="text-[#3e6b47] font-medium">Ver</button>
          </div>
        </div>
      </main>
    </div>
  )
}
