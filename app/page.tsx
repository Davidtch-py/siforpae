"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryMessage, setRecoveryMessage] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulación de autenticación
    // En una aplicación real, esto se conectaría a un backend
    if (username === "admin" && password === "admin") {
      // Redirigir al dashboard de administrador
      router.push("/admin/dashboard")
    } else {
      // Redirigir al dashboard de usuario normal
      router.push("/dashboard")
    }
  }

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulación de recuperación de contraseña
    // En una aplicación real, esto enviaría un correo electrónico
    setRecoveryMessage("Se ha enviado un enlace de recuperación a su correo electrónico.")
    setTimeout(() => {
      setShowForgotPassword(false)
      setRecoveryMessage("")
      setRecoveryEmail("")
    }, 3000)
  }

  return (
    <div className="flex min-h-screen bg-[#f8f5e6]">
      {/* Contenedor principal con posicionamiento relativo */}
      <div className="flex flex-col items-center justify-center w-full relative">
        {/* Imagen izquierda - solo visible en desktop */}
        <div className="hidden md:block absolute left-[5%] bottom-[1rem] translate-y-0">
          <Image src="/vegetables.svg" alt="Vegetables" width={390} height={100} className="object-contain" />
        </div>

        {/* Imagen derecha - solo visible en desktop */}
        <div className="hidden md:block absolute right-[5%] bottom-[1rem] translate-y-0">
          <Image src="/character.svg" alt="Character" width={220} height={180} className="object-contain" />
        </div>

        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#3e6b47]">SIFORPAE</h1>
            <h2 className="text-xl font-medium text-[#4a4a4a]">Tunja</h2>
          </div>

          {!showForgotPassword ? (
            <>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Usuario
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47] text-black dark:text-white"
                      placeholder="Usuario"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47] text-black dark:text-white"
                      placeholder="Contraseña"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#3e6b47] text-white font-medium rounded-md hover:bg-[#345a3c] transition-colors"
                  >
                    INGRESAR
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[#3e6b47] hover:underline flex items-center justify-center mx-auto"
                >
                  <ArrowRight size={16} className="mr-1" />
                  <span>¿Olvidó su contraseña?</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-center mb-4 text-[#3e6b47]">Recuperar contraseña</h3>
              {recoveryMessage ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {recoveryMessage}
                </div>
              ) : (
                <form onSubmit={handleRecoverPassword} className="space-y-6">
                  <div>
                    <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de usuario
                    </label>
                    <input
                      id="recovery-email"
                      name="recovery-email"
                      type="text"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3e6b47] text-black dark:text-white"
                      placeholder="Ingrese su nombre de usuario"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-3 px-4 border border-[#c9a55a] text-[#c9a55a] font-medium rounded-md hover:bg-[#f8f3e0] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-[#3e6b47] text-white font-medium rounded-md hover:bg-[#345a3c] transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Imagen de verduras - visible en mobile */}
        <div className="md:hidden mt-4">
          <Image src="/vegetables.svg" alt="Vegetables" width={290} height={75} className="object-contain" />
        </div>
      </div>
    </div>
  )
}
