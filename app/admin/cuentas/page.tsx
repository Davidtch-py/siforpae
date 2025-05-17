"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { ArrowLeft, User, Mail, Briefcase, Lock, Eye, EyeOff } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import Link from "next/link"
import { HelpTooltip } from "@/components/ui/help-tooltip"

export default function AdminCuentasPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("crear")
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })

  const sidebarItems = [
    {
      label: "Crear Cuenta",
      href: "#",
      section: "crear",
    },
    {
      label: "Modificar Cuenta",
      href: "#",
      section: "modificar",
    },
    {
      label: "Inactivar/Activar Cuenta",
      href: "#",
      section: "estado",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      {popup.show && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
      )}

      {/* Back button for mobile */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Link href="/admin/dashboard">
          <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
            <ArrowLeft className="h-5 w-5 text-[#3e6b47] dark:text-[#4e8c57]" />
          </button>
        </Link>
      </div>

      <Sidebar activeSection="Administrar cuentas" items={sidebarItems} onClickOption={setActiveTab}/>

      <div className="flex-1 p-6 md:ml-[200px] max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-center mb-6 text-black dark:text-white">Administrar Cuentas</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`px-4 py-2 ${
                activeTab === "crear"
                  ? "border-b-2 border-[#3e6b47] dark:border-[#4e8c57] text-[#3e6b47] dark:text-[#4e8c57]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("crear")}
            >
              Crear Cuenta
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "modificar"
                  ? "border-b-2 border-[#3e6b47] dark:border-[#4e8c57] text-[#3e6b47] dark:text-[#4e8c57]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("modificar")}
            >
              Modificar Cuenta
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "estado"
                  ? "border-b-2 border-[#3e6b47] dark:border-[#4e8c57] text-[#3e6b47] dark:text-[#4e8c57]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setActiveTab("estado")}
            >
              Inactivar/Activar Cuenta
            </button>
          </div>

          {activeTab === "crear" && <CrearCuentaForm setPopup={setPopup} />}
          {activeTab === "modificar" && <ModificarCuentaForm setPopup={setPopup} />}
          {activeTab === "estado" && <EstadoCuentaForm setPopup={setPopup} />}
        </div>
      </div>
    </div>
  )
}

interface CuentaFormProps {
  setPopup: React.Dispatch<
    React.SetStateAction<{
      show: boolean
      type: "success" | "error"
      message: string
    }>
  >
}

function CrearCuentaForm({ setPopup }: CuentaFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [cargo, setCargo] = useState("")
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!nombreCompleto || !cargo || !correo || !contrasena || !confirmarContrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor complete todos los campos",
      })
      return
    }

    if (contrasena !== confirmarContrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Las contraseñas no coinciden",
      })
      return
    }

    // Simulación de creación exitosa
    setPopup({
      show: true,
      type: "success",
      message: "Cuenta creada exitosamente",
    })

    // Limpiar formulario
    setNombreCompleto("")
    setCargo("")
    setCorreo("")
    setContrasena("")
    setConfirmarContrasena("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Nombre completo
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            />
          </div>
          <HelpTooltip text="Ingrese el nombre completo del usuario" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Cargo de la cuenta
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            />
          </div>
          <HelpTooltip text="Ingrese el cargo o rol del usuario" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Correo electrónico
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            />
          </div>
          <HelpTooltip text="Ingrese un correo electrónico válido" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Contraseña
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          <HelpTooltip text="La contraseña debe tener al menos 8 caracteres" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Confirmar contraseña
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <HelpTooltip text="Repita la contraseña para confirmar" className="ml-2" />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
          onClick={() => {
            setNombreCompleto("")
            setCargo("")
            setCorreo("")
            setContrasena("")
            setConfirmarContrasena("")
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
        >
          Crear
        </button>
      </div>
    </form>
  )
}

function ModificarCuentaForm({ setPopup }: CuentaFormProps) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [cargo, setCargo] = useState("")
  const [correo, setCorreo] = useState("")

  // Simulación de cuentas disponibles
  const cuentas = [
    { id: "1", nombre: "Usuario 1" },
    { id: "2", nombre: "Usuario 2" },
    { id: "3", nombre: "Usuario 3" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!cuentaSeleccionada || !contrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor seleccione una cuenta y proporcione la contraseña",
      })
      return
    }

    // Simulación de modificación exitosa
    setPopup({
      show: true,
      type: "success",
      message: "Cuenta modificada exitosamente",
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Cuenta a modificar
          </label>
          <div className="flex items-center">
            <select
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
            <HelpTooltip text="Seleccione la cuenta que desea modificar" className="ml-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Contraseña
          </label>
          <div className="flex items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <HelpTooltip text="Ingrese su contraseña de administrador" className="ml-2" />
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
        <h3 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-black dark:text-white">
          Información cuenta
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
              Nombre de la cuenta
            </label>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
                placeholder="Nombre completo"
              />
            </div>
            <HelpTooltip text="Nombre completo del usuario" className="ml-2" />
          </div>

          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
              Cargo de la cuenta
            </label>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
                placeholder="Cargo o rol"
              />
            </div>
            <HelpTooltip text="Cargo o rol del usuario" className="ml-2" />
          </div>

          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
              Correo electrónico
            </label>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
                placeholder="Correo electrónico"
              />
            </div>
            <HelpTooltip text="Correo electrónico del usuario" className="ml-2" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

function EstadoCuentaForm({ setPopup }: CuentaFormProps) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Simulación de cuentas disponibles
  const cuentas = [
    { id: "1", nombre: "Usuario 1", estado: "Activo" },
    { id: "2", nombre: "Usuario 2", estado: "Inactivo" },
    { id: "3", nombre: "Usuario 3", estado: "Activo" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!cuentaSeleccionada || !contrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor seleccione una cuenta y proporcione la contraseña",
      })
      return
    }

    // Simulación de cambio de estado exitoso
    setPopup({
      show: true,
      type: "success",
      message: "Estado de la cuenta actualizado exitosamente",
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Cuenta a modificar
          </label>
          <div className="flex items-center">
            <select
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} ({cuenta.estado})
                </option>
              ))}
            </select>
            <HelpTooltip text="Seleccione la cuenta que desea activar o inactivar" className="ml-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Contraseña
          </label>
          <div className="flex items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <HelpTooltip text="Ingrese su contraseña de administrador" className="ml-2" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
        >
          Cancelar
        </button>

        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
        >
          Inactivar
        </button>

        <button
          type="submit"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]"
        >
          Activar
        </button>
      </div>
    </form>
  )
}
