import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types'

// Esta ruta debe estar protegida en producción
// Solo para uso durante desarrollo o por super administradores

export async function GET(req: NextRequest) {
  try {
    // Verificar que estamos en desarrollo o usar algún token secreto
    const isLocalhost = req.headers.get('host')?.includes('localhost') || false
    if (!isLocalhost) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta' }, 
        { status: 500 }
      )
    }

    // Usar la clave de servicio para operaciones de admin
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Datos del usuario administrador
    const email = 'a@a'
    const password = 'a'
    const nombreCompleto = 'Administrador'

    // 1. Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo_electronico', email)
      .single()
    
    if (!checkError && existingUser) {
      return NextResponse.json(
        { message: `El usuario ${email} ya existe en la base de datos.` }, 
        { status: 200 }
      )
    }

    // 2. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' }, 
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Error al crear el usuario en Auth: ' + authError.message }, 
        { status: 500 }
      )
    }

    // 3. Insertar en la tabla usuarios
    if (authData.user) {
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nombre_completo: nombreCompleto,
          nombre_usuario: email,
          contrasena: 'auth_handled',
          correo_electronico: email,
          rol_id: 1, // ID para rol de administrador
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          auth_uid: authData.user.id
        })

      if (insertError) {
        return NextResponse.json(
          { error: 'Error al insertar usuario en la tabla: ' + insertError.message }, 
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: `Usuario administrador creado exitosamente: ${email}`, 
          user: { email, role: 'admin' }
        }, 
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear usuario, no se recibió respuesta del servicio de Auth' }, 
      { status: 500 }
    )
  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
} 