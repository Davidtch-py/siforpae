import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  // Crear cliente de Supabase con permisos de administrador (para saltarse RLS)
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  )

  try {
    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Falta nombre de usuario' },
        { status: 400 }
      )
    }

    console.log('Buscando usuario:', username)

    // Buscar usuario por nombre de usuario
    const { data, error } = await supabase
      .from('usuarios')
      .select('correo_electronico, nombre_completo, auth_uid, rol_id')
      .eq('nombre_usuario', username)
      .single()
    
    if (error) {
      console.error('Error al buscar usuario:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    // Verificar que exista un correo electrónico
    if (!data || !data.correo_electronico) {
      return NextResponse.json(
        { success: false, error: 'Usuario sin correo electrónico asociado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        email: data.correo_electronico,
        nombre_completo: data.nombre_completo,
        auth_uid: data.auth_uid,
        rol_id: data.rol_id
      }
    })
    
  } catch (error) {
    console.error('Error al obtener email del usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 