import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const refresh = requestUrl.searchParams.get('refresh')
  
  console.log(`------ INICIO DE CALLBACK DE AUTENTICACIÓN ------`)
  console.log(`URL completa: ${requestUrl.toString()}`)
  console.log(`Código presente: ${!!code}`)
  console.log(`Refresh: ${refresh}`)
  
  if (!code) {
    console.log(`Error: No se recibió código de autenticación`)
    return NextResponse.redirect(requestUrl.origin)
  }
  
  try {
    // Crear cliente de Supabase
    const supabase = createClientComponentClient()
    console.log(`Cliente Supabase creado`)
    
    // Verificar si ya hay una sesión antes del intercambio
    const { data: sessionBefore } = await supabase.auth.getSession()
    console.log(`Sesión antes del intercambio: ${!!sessionBefore.session}`)
    
    // Intercambiar el código por una sesión
    console.log(`Intentando intercambiar código por sesión...`)
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error(`Error al intercambiar código: ${exchangeError.message}`)
      return NextResponse.redirect(requestUrl.origin)
    }
    
    console.log(`Código intercambiado exitosamente`)
    
    // Verificar si se generó una sesión después del intercambio
    const { data: sessionAfter } = await supabase.auth.getSession()
    console.log(`Sesión después del intercambio: ${!!sessionAfter.session}`)
    
    if (!sessionAfter.session) {
      console.error(`Error: No se generó sesión después del intercambio`)
      return NextResponse.redirect(requestUrl.origin)
    }
    
    // Obtener el usuario actual para determinar a dónde redirigir
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error(`Error al obtener usuario: ${userError.message}`)
      return NextResponse.redirect(requestUrl.origin)
    }
    
    console.log(`Usuario obtenido: ${!!user}`)
    
    if (user) {
      // Verificar si es admin
      const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'administrador'
      console.log(`Rol de usuario: ${user.app_metadata?.role || 'no definido'}`)
      console.log(`¿Es admin?: ${isAdmin}`)
      
      if (isAdmin) {
        console.log(`Redirigiendo a dashboard administrativo`)
        return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
      } else {
        console.log(`Redirigiendo a dashboard regular`)
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    }
    
    console.log(`No se encontró usuario, redirigiendo a página principal`)
    console.log(`------ FIN DE CALLBACK DE AUTENTICACIÓN ------`)
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error(`------ ERROR EN CALLBACK DE AUTENTICACIÓN ------`)
    console.error(`Tipo de error: ${error instanceof Error ? error.name : 'Desconocido'}`)
    console.error(`Mensaje: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`------ FIN DE ERROR ------`)
    return NextResponse.redirect(requestUrl.origin)
  }
} 