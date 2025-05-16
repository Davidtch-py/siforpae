"use client"
import Sidebar from "@/components/sidebar"

export default function MenusPage() {
  const sidebarItems = [
    {
      label: "Consultar Menus",
      href: "/menus/consultar",
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5e6]">
      <Sidebar activeSection="Menús" items={sidebarItems} />

      <main className="flex-1 p-6 max-w-4xl mx-auto md:ml-[200px] md:w-[calc(100%-200px)]">
        <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">Consultar Menus</h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="mb-2 text-black dark:text-white">Tunja</p>
          </div>

          <div>
            <p className="mb-2 text-black dark:text-white">Año 2025</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="font-medium mb-2 text-black dark:text-white">Menú 1</h2>
            <p className="text-sm text-gray-600 mb-1 text-black dark:text-white">Nombre del Complemento</p>
            <p className="text-gray-800 text-black dark:text-white">XXXXXXXXXXXXX</p>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="font-medium mb-2 text-black dark:text-white">Menú 2</h2>
            <p className="text-sm text-gray-600 mb-1 text-black dark:text-white">Nombre del Complemento</p>
            <p className="text-gray-800 text-black dark:text-white">XXXXXXXXXXXXX</p>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="font-medium mb-2 text-black dark:text-white">Menú 3</h2>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="font-medium mb-2 text-black dark:text-white">Menú 4</h2>
          </div>
        </div>
      </main>
    </div>
  )
}
