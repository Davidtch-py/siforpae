import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Obtener datos de la solicitud
    const { session } = await request.json()
    
    if (!session || !session.access_token || !session.refresh_token) {
      return NextResponse.json({ error: 'Datos de sesión incompletos' }, { status: 400 })
    }
    
    console.log("API: Sincronizando sesión en el servidor...")
    
    // Establecer la sesión en el servidor
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })
    
    // Verificar que la sesión se estableció correctamente
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("API: Error al verificar sesión:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log("API: Sesión sincronizada correctamente:", !!data.session)
    
    return NextResponse.json({ 
      success: true,
      session: !!data.session
    }, { status: 200 })
  } catch (error) {
    console.error("API: Error al sincronizar sesión:", error)
    return NextResponse.json({ 
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
} 