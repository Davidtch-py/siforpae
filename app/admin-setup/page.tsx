"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleCreateAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/create')
      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Usuario administrador creado exitosamente'
        })
      } else {
        setResult({
          success: false,
          error: data.error || 'Error al crear el usuario administrador'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Error al conectar con el servidor'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f5e6] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#3e6b47]">SIFORPAE - Configuración Inicial</CardTitle>
          <CardDescription className="text-center">
            Crear usuario administrador predeterminado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <div className="font-medium">Datos del administrador:</div>
            <div className="mt-2">
              <div><span className="font-medium">Email:</span> a@a</div>
              <div><span className="font-medium">Contraseña:</span> a</div>
              <div><span className="font-medium">Rol:</span> Administrador</div>
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#3e6b47] hover:bg-[#345a3c]" 
            onClick={handleCreateAdmin}
            disabled={loading}
          >
            {loading ? "Creando usuario..." : "Crear Usuario Administrador"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 