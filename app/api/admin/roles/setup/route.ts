import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Roles básicos del sistema
const ROLES_BASICOS = [
  { nombre_rol: 'usuario' },
  { nombre_rol: 'admin' },
  { nombre_rol: 'supervisor' }
]

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
    // Verificar si ya existen roles
    const { data: existingRoles, error: queryError } = await supabase
      .from('roles')
      .select('*')
    
    if (queryError) {
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      )
    }
    
    // Si ya hay roles, retornar los existentes
    if (existingRoles && existingRoles.length > 0) {
      return NextResponse.json({
        success: true, 
        message: 'Los roles ya están configurados',
        roles: existingRoles
      })
    }
    
    // Insertar roles básicos
    const { data: insertedRoles, error: insertError } = await supabase
      .from('roles')
      .insert(ROLES_BASICOS)
      .select()
    
    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Roles creados exitosamente',
      roles: insertedRoles
    })
    
  } catch (error) {
    console.error('Error al configurar roles:', error)
    return NextResponse.json(
      { success: false, error: 'Error al configurar roles' },
      { status: 500 }
    )
  }
} 