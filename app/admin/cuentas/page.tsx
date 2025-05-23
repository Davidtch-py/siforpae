"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { ArrowLeft, User, Mail, Briefcase, Lock, Eye, EyeOff } from "lucide-react"
import { Popup } from "@/components/ui/popup"
import Link from "next/link"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { supabase, createAdminUser } from "@/lib/supabase"

export default function AdminCuentasPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("crear")
  const [popup, setPopup] = useState<{ show: boolean; type: "success" | "error"; message: string }>({
    show: false,
    type: "success",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [usersList, setUsersList] = useState<any[]>([])

  useEffect(() => {
    // Cargar lista de usuarios cuando se monta el componente
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Obtener usuarios de Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      
      console.log("Usuarios cargados:", data);
      setUsersList(data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setPopup({
        show: true,
        type: "error",
        message: "Error al cargar la lista de usuarios",
      })
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
            <div className="flex">
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
            <button 
              onClick={loadUsers}
              disabled={loading}
              className="px-3 py-1 bg-[#3e6b47] text-white rounded-md text-sm hover:bg-[#345a3c] disabled:opacity-50 ml-2"
            >
              {loading ? "Cargando..." : "Recargar usuarios"}
            </button>
          </div>

          {activeTab === "crear" && <CrearCuentaForm setPopup={setPopup} onSuccess={loadUsers} />}
          {activeTab === "modificar" && <ModificarCuentaForm setPopup={setPopup} usuarios={usersList} onSuccess={loadUsers} />}
          {activeTab === "estado" && <EstadoCuentaForm setPopup={setPopup} usuarios={usersList} onSuccess={loadUsers} />}
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
  onSuccess: () => void
  usuarios?: any[]
}

function CrearCuentaForm({ setPopup, onSuccess }: CuentaFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [cargo, setCargo] = useState("")
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [rol, setRol] = useState("usuario")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generar nombre de usuario al cambiar el nombre completo
  useEffect(() => {
    if (nombreCompleto && !nombreUsuario) {
      // Generar nombre de usuario automáticamente (sin espacios y en minúsculas)
      const generatedUsername = nombreCompleto.toLowerCase().replace(/\s+/g, '')
      setNombreUsuario(generatedUsername)
    }
  }, [nombreCompleto, nombreUsuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validación básica
    if (!nombreCompleto || !nombreUsuario || !cargo || !correo || !contrasena || !confirmarContrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor complete todos los campos",
      })
      setIsLoading(false)
      return
    }

    if (contrasena !== confirmarContrasena) {
      setPopup({
        show: true,
        type: "error",
        message: "Las contraseñas no coinciden",
      })
      setIsLoading(false)
      return
    }

    // Validar longitud mínima de contraseña
    if (contrasena.length < 6) {
      setPopup({
        show: true,
        type: "error",
        message: "La contraseña debe tener al menos 6 caracteres por razones de seguridad",
      })
      setIsLoading(false)
      return
    }

    try {
      // Llamar al endpoint del servidor para crear usuario
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreCompleto,
          nombreUsuario: nombreUsuario,
          correo,
          contrasena,
          cargo,
          rol
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error ? String(result.error) : "Error al crear la cuenta")
      }
      
      // Éxito
      setPopup({
        show: true,
        type: "success",
        message: "Cuenta creada exitosamente",
      })

      // Limpiar formulario
      setNombreCompleto("")
      setNombreUsuario("")
      setCargo("")
      setCorreo("")
      setContrasena("")
      setConfirmarContrasena("")
      setRol("usuario")
        
      // Recargar lista de usuarios
      onSuccess()
    } catch (error) {
      console.error("Error al crear usuario:", error)
      setPopup({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Error desconocido al crear la cuenta"
      })
    } finally {
      setIsLoading(false)
    }
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
              disabled={isLoading}
            />
          </div>
          <HelpTooltip text="Ingrese el nombre completo del usuario" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Nombre de usuario
          </label>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
              disabled={isLoading}
            />
          </div>
          <HelpTooltip text="Este es el nombre que usará para iniciar sesión" className="ml-2" />
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          <HelpTooltip text="La contraseña debe tener al menos 6 caracteres por requisitos de seguridad" className="ml-2" />
        </div>

        <div className="flex items-center">
          <label className="block text-sm font-mediumw-40 text-black dark:text-white">
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
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
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

        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
            Rol del sistema
          </label>
          <div className="flex-1 relative">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
              disabled={isLoading}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <HelpTooltip text="Seleccione el nivel de acceso que tendrá el usuario en el sistema" className="ml-2" />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
          onClick={() => {
            setNombreCompleto("")
            setNombreUsuario("")
            setCargo("")
            setCorreo("")
            setContrasena("")
            setConfirmarContrasena("")
            setRol("usuario")
          }}
          disabled={isLoading}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Creando..." : "Crear"}
        </button>
      </div>
    </form>
  )
}

function ModificarCuentaForm({ setPopup, usuarios = [], onSuccess }: CuentaFormProps) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("")
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [cargo, setCargo] = useState("")
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Efecto para cargar datos del usuario seleccionado
  useEffect(() => {
    if (cuentaSeleccionada) {
      const usuario = usuarios.find(u => u.auth_uid === cuentaSeleccionada)
      if (usuario) {
        setNombreCompleto(usuario.nombre_completo || "")
        setCargo(usuario.cargo || "")
        setCorreo(usuario.correo_electronico || "")
        setContrasena("")
        setConfirmarContrasena("")
      }
    } else {
      setNombreCompleto("")
      setCargo("")
      setCorreo("")
      setContrasena("")
      setConfirmarContrasena("")
    }
  }, [cuentaSeleccionada, usuarios])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!cuentaSeleccionada || !nombreCompleto || !correo) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor complete los campos requeridos",
      })
      setIsLoading(false)
      return
    }

    // Validar contraseñas si se están cambiando
    if (contrasena || confirmarContrasena) {
      if (contrasena !== confirmarContrasena) {
        setPopup({
          show: true,
          type: "error",
          message: "Las contraseñas no coinciden",
        })
        setIsLoading(false)
        return
      }

      // Validar longitud mínima de contraseña
      if (contrasena.length < 6) {
        setPopup({
          show: true,
          type: "error",
          message: "La contraseña debe tener al menos 6 caracteres por razones de seguridad",
        })
        setIsLoading(false)
        return
      }
    }

    try {
      // Llamar al endpoint para actualizar usuario
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_uid: cuentaSeleccionada,
          nombre_completo: nombreCompleto,
          cargo: cargo,
          correo_electronico: correo,
          contrasena: contrasena || undefined
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error ? String(result.error) : "Error al modificar la cuenta")
      }

      setPopup({
        show: true,
        type: "success",
        message: "Cuenta modificada exitosamente",
      })
      
      // Recargar usuarios
      onSuccess()
      
      // Limpiar campos de contraseña
      setContrasena("")
      setConfirmarContrasena("")
    } catch (error) {
      console.error("Error al modificar usuario:", error)
      setPopup({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Error al modificar la cuenta",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {usuarios.length === 0 ? (
        <div className="py-4 text-center bg-yellow-50 rounded-md mb-4">
          <p className="text-amber-600">No hay cuentas disponibles. Crea una cuenta primero o recarga la lista de usuarios.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
              Cuenta a modificar
            </label>
            <div className="flex items-center">
              <select
                value={cuentaSeleccionada}
                onChange={(e) => setCuentaSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
                disabled={isLoading}
              >
                <option value="">Seleccionar cuenta</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.auth_uid} value={usuario.auth_uid}>
                    {usuario.nombre_completo} ({usuario.correo_electronico})
                  </option>
                ))}
              </select>
              <HelpTooltip text="Seleccione la cuenta que desea modificar" className="ml-2" />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
            <h3 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-black dark:text-white">
              Información cuenta
            </h3>

            <div className="grid grid-cols-1 gap-4">
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
                    placeholder="Nombre completo"
                    disabled={isLoading || !cuentaSeleccionada}
                  />
                </div>
                <HelpTooltip text="Nombre completo del usuario" className="ml-2" />
              </div>

              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
                  Cargo
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
                    disabled={isLoading || !cuentaSeleccionada}
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
                    disabled={isLoading || !cuentaSeleccionada}
                  />
                </div>
                <HelpTooltip text="Correo electrónico del usuario" className="ml-2" />
              </div>

              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 w-40 text-black dark:text-white">
                  Nueva contraseña
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
                    placeholder="Dejar en blanco para no cambiar"
                    disabled={isLoading || !cuentaSeleccionada}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                <HelpTooltip text="Si desea cambiar la contraseña, debe tener al menos 6 caracteres por requisitos de seguridad" className="ml-2" />
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
                    placeholder="Dejar en blanco para no cambiar"
                    disabled={isLoading || !cuentaSeleccionada}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                <HelpTooltip text="Repita la nueva contraseña" className="ml-2" />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
          onClick={() => {
            setCuentaSeleccionada("")
            setNombreCompleto("")
            setCargo("")
            setCorreo("")
            setContrasena("")
            setConfirmarContrasena("")
          }}
          disabled={isLoading}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] disabled:opacity-50"
          disabled={isLoading || !cuentaSeleccionada}
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  )
}

function EstadoCuentaForm({ setPopup, usuarios = [], onSuccess }: CuentaFormProps) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("")
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Efecto para cargar datos del usuario seleccionado
  useEffect(() => {
    if (cuentaSeleccionada) {
      const usuario = usuarios.find(u => u.auth_uid === cuentaSeleccionada)
      setUsuarioSeleccionado(usuario || null)
    } else {
      setUsuarioSeleccionado(null)
    }
  }, [cuentaSeleccionada, usuarios])

  const cambiarEstado = async (nuevoEstado: 'activo' | 'inactivo') => {
    if (!cuentaSeleccionada || !usuarioSeleccionado) {
      setPopup({
        show: true,
        type: "error",
        message: "Por favor seleccione una cuenta",
      })
      return
    }

    setIsLoading(true)
    try {
      // Actualizar estado del usuario
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: nuevoEstado })
        .eq('auth_uid', cuentaSeleccionada)

      if (error) throw error

      setPopup({
        show: true,
        type: "success",
        message: `Cuenta ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'} exitosamente`,
      })
      
      // Recargar usuarios
      onSuccess()
    } catch (error) {
      console.error("Error al cambiar estado de usuario:", error)
      setPopup({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Error al cambiar estado de la cuenta",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {usuarios.length === 0 ? (
        <div className="py-4 text-center bg-yellow-50 rounded-md mb-4">
          <p className="text-amber-600">No hay cuentas disponibles. Crea una cuenta primero o recarga la lista de usuarios.</p>
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Seleccionar cuenta
          </label>
          <div className="flex items-center">
            <select
              value={cuentaSeleccionada}
              onChange={(e) => setCuentaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3e6b47] dark:bg-gray-800 dark:text-white text-black dark:text-white"
              disabled={isLoading}
            >
              <option value="">Seleccionar cuenta</option>
              {usuarios.map((usuario) => (
                <option key={usuario.auth_uid} value={usuario.auth_uid}>
                  {usuario.nombre_completo} ({usuario.estado === 'activo' ? 'Activo' : 'Inactivo'})
                </option>
              ))}
            </select>
            <HelpTooltip text="Seleccione la cuenta que desea activar o inactivar" className="ml-2" />
          </div>
        </div>
      )}

      {usuarioSeleccionado && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
          <h3 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-black dark:text-white">
            Información de la cuenta
          </h3>
          
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Nombre:</span> {usuarioSeleccionado.nombre_completo}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Correo:</span> {usuarioSeleccionado.correo_electronico}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Estado actual:</span>{" "}
              <span className={usuarioSeleccionado.estado === 'activo' ? 'text-green-600' : 'text-red-600'}>
                {usuarioSeleccionado.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          className="border border-[#c9a55a] dark:border-[#d9b56a] text-[#c9a55a] dark:text-[#d9b56a] px-6 py-2 rounded-md"
          onClick={() => setCuentaSeleccionada("")}
          disabled={isLoading}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="border border-red-500 text-red-500 px-6 py-2 rounded-md hover:bg-red-500 hover:text-white disabled:opacity-50"
          onClick={() => cambiarEstado('inactivo')}
          disabled={isLoading || !cuentaSeleccionada || usuarioSeleccionado?.estado === 'inactivo'}
        >
          {isLoading ? "Procesando..." : "Inactivar"}
        </button>

        <button
          type="button"
          className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] disabled:opacity-50"
          onClick={() => cambiarEstado('activo')}
          disabled={isLoading || !cuentaSeleccionada || usuarioSeleccionado?.estado === 'activo'}
        >
          {isLoading ? "Procesando..." : "Activar"}
        </button>
      </div>
    </form>
  )
}
