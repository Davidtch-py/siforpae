import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './lib/types'

export async function middleware(request: NextRequest) {
  // Verificar si es una ruta que debe excluirse completamente
  const pathname = request.nextUrl.pathname
  
  // Excluir archivos estáticos y rutas de autenticación
  if (pathname.startsWith('/auth/') || 
      pathname.endsWith('.svg') || pathname.endsWith('.png') || 
      pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || 
      pathname.endsWith('.gif') || pathname.endsWith('.ico')) {
    return NextResponse.next()
  }
  
  console.log(`----- MIDDLEWARE: Procesando ruta: ${pathname} -----`)
  
  try {
    // Crear respuesta y cliente Supabase
    const response = NextResponse.next()
    const supabase = createMiddlewareClient<Database>({ req: request, res: response })
    console.log(`Middleware: Cliente Supabase creado`)
    
    // Obtener sesión actual con manejo de errores
    let session = null
    try {
      console.log(`Middleware: Intentando obtener sesión...`)
      const { data, error } = await supabase.auth.getSession()
      session = data.session
      
      if (error) {
        console.error(`Middleware: Error al obtener sesión: ${error.message}`)
      } else {
        console.log(`Middleware: Sesión obtenida: ${!!session}`)
        if (session) {
          console.log(`Middleware: Usuario: ${session.user.email}`)
          console.log(`Middleware: Rol: ${session.user.app_metadata?.role || 'no definido'}`)
          console.log(`Middleware: Vencimiento del token: ${new Date(session.expires_at! * 1000).toISOString()}`)
        }
      }
    } catch (error) {
      console.error(`Middleware: Error al obtener sesión: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    // Definir rutas públicas
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/admin-setup', '/api']
    const isApiRoute = pathname.startsWith('/api/')
    const isPublicRoute = publicRoutes.some(route => pathname === route) || isApiRoute
    
    console.log(`Middleware: ¿Es ruta pública?: ${isPublicRoute}`)
    
    // Redireccionar usuarios no autenticados
    if (!session && !isPublicRoute) {
      console.log(`Middleware: Usuario no autenticado intentando acceder a ruta protegida. Redirigiendo a /`)
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verificar permisos para rutas administrativas
    if (session && pathname.startsWith('/admin') && pathname !== '/admin-setup') {
      const role = session.user?.app_metadata?.role
      const isAdmin = role === 'admin' || role === 'administrador'
      
      console.log(`Middleware: Usuario accediendo a ruta admin. ¿Es admin?: ${isAdmin}`)
      
      if (!isAdmin) {
        console.log(`Middleware: Usuario regular intentando acceder a ruta de admin. Redirigiendo a /dashboard`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    console.log(`----- MIDDLEWARE: Finalizado para ruta: ${pathname} -----`)
    return response
  } catch (error) {
    console.error(`----- ERROR EN MIDDLEWARE -----`)
    console.error(`Ruta: ${pathname}`)
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`----- FIN DE ERROR EN MIDDLEWARE -----`)
    return NextResponse.next()
  }
}

// Configuración de rutas para el middleware
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/admin',
    '/admin/:path*',
    '/formatos/:path*',
    '/complementos/:path*',
    '/reportes/:path*',
    '/menus/:path*',
    '/opciones/:path*',
  ],
} 