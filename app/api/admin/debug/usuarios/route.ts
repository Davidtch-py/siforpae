import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  )

  try {
    // Obtener usuarios de Supabase
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (usuariosError) {
      return NextResponse.json(
        { success: false, error: usuariosError.message },
        { status: 500 }
      )
    }
    
    // Obtener roles de Supabase
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
    
    if (rolesError) {
      return NextResponse.json(
        { success: false, error: rolesError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      usuarios,
      roles,
      totalUsuarios: usuarios.length
    })
    
  } catch (error) {
    console.error('Error en debug de usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
} 