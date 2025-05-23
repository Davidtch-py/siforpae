"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, AlertCircle, X } from "lucide-react"
import { signInWithEmail } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { SvgImage } from "@/components/ui/svg-image"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryMessage, setRecoveryMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Efecto para mostrar la alerta cuando hay un error de inicio de sesión
  useEffect(() => {
    if (loginError) {
      setShowAlert(true)
    }
  }, [loginError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    setShowAlert(false)

    try {
      // Validar campos
      if (!username || !password) {
        toast({
          title: "Error",
          description: "Por favor ingrese su usuario y contraseña",
          variant: "destructive",
        })
        setLoginError("Por favor ingrese su usuario y contraseña")
        setIsLoading(false)
        return
      }

      // Iniciar sesión con Supabase
      const { data, error } = await signInWithEmail(username, password)

      if (error) {
        console.error("Error de autenticación:", (error as { message: string }).message)
        
        // Personalizar los mensajes de error
        let errorMessage = "Error desconocido"; 
        const errorMsg = (error as { message: string }).message;
        
        if (errorMsg === "Invalid login credentials") {
          errorMessage = "Credenciales inválidas";
        } else if (errorMsg.includes("Usuario no encontrado")) {
          errorMessage = "Usuario no encontrado, verifique su nombre de usuario";
        } else if (errorMsg.includes("correo asociado")) {
          errorMessage = "Este usuario no tiene un correo asociado";
        } else {
          errorMessage = "Error: " + errorMsg;
        }
          
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        
        setLoginError(errorMessage)
        setIsLoading(false)
        return
      }

      // El inicio de sesión fue exitoso
      // No hacemos nada aquí - el cliente Supabase ya habrá establecido cookies
      // y signInWithEmail() ya se encarga de la redirección
      
    } catch (error) {
      console.error("Error inesperado:", error)
      const errorMessage = "Error inesperado al iniciar sesión"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setLoginError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // En una aplicación real, buscar primero el correo asociado al nombre de usuario
      // const { data } = await supabase.from('usuarios').select('correo_electronico').eq('nombre_usuario', recoveryEmail).single()
      // const email = data?.correo_electronico
      // const { error } = await supabase.auth.resetPasswordForEmail(email)

      setRecoveryMessage("Se ha enviado un enlace de recuperación a su correo electrónico asociado.")
      setTimeout(() => {
        setShowForgotPassword(false)
        setRecoveryMessage("")
        setRecoveryEmail("")
      }, 3000)
    } catch (error) {
      console.error("Error al recuperar contraseña:", error)
      toast({
        title: "Error",
        description: "Error al enviar el correo de recuperación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8f5e6]">
      {/* Contenedor principal con posicionamiento relativo */}
      <div className="flex flex-col items-center justify-center w-full relative">
        {/* Alerta para errores de inicio de sesión */}
        {showAlert && loginError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 bg-red-500">
            <Alert variant="destructive" className="relative shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de inicio de sesión</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
              <button 
                onClick={() => {
                  setShowAlert(false)
                  setLoginError(null)
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </Alert>
          </div>
        )}

        {/* Imagen izquierda - solo visible en desktop */}
        <div className="hidden md:block absolute left-[5%] bottom-[1rem] translate-y-0">
          <SvgImage 
            src="/vegetables.svg" 
            alt="Vegetables" 
            width={390} 
            height={100} 
            className="object-contain" 
          />
        </div>

        {/* Imagen derecha - solo visible en desktop */}
        <div className="hidden md:block absolute right-[5%] bottom-[1rem] translate-y-0">
          <SvgImage 
            src="/character.svg" 
            alt="Character" 
            width={220} 
            height={180} 
            className="object-contain" 
          />
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
                      placeholder="Nombre de usuario"
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#3e6b47] text-white font-medium rounded-md hover:bg-[#345a3c] transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "INGRESAR"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[#3e6b47] hover:underline flex items-center justify-center mx-auto"
                  disabled={isLoading}
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
          <SvgImage 
            src="/vegetables.svg" 
            alt="Vegetables" 
            width={290} 
            height={75} 
            className="object-contain" 
          />
        </div>
      </div>
    </div>
  )
}
