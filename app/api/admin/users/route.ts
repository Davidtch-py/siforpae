import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  // Crear cliente de Supabase con permisos de administrador
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  )

  try {
    const { nombre, nombreUsuario, correo, contrasena, cargo, rol } = await request.json()
    
    if (!nombre || !nombreUsuario || !correo || !contrasena) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }
    
    // Verificar que el nombre de usuario no exista ya
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('usuario_id')
      .eq('nombre_usuario', nombreUsuario)
      .maybeSingle();
      
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El nombre de usuario ya existe' },
        { status: 400 }
      )
    }
    
    // 1. Crear usuario en Auth de Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: { 
        nombre_completo: nombre,  // Guardar el nombre completo en los metadatos
        nombre_usuario: nombreUsuario // Guardar también el nombre de usuario
      },
      app_metadata: { role: rol } // Asignar rol
    })

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      )
    }

    // 2. Insertar el usuario en la tabla usuarios
    if (authData.user) {
      const { error: userError } = await supabase
        .from('usuarios')
        .insert({
          nombre_completo: nombre,
          cargo: cargo,
          nombre_usuario: nombreUsuario, // Usar el nombre de usuario específico
          contrasena: 'auth_handled', // La contraseña real se maneja en Auth
          correo_electronico: correo,
          rol: rol, // Guardar el rol como texto
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          auth_uid: authData.user.id
        })

      if (userError) {
        // Si falla la inserción en la tabla usuarios, eliminar el usuario de Auth
        await supabase.auth.admin.deleteUser(authData.user.id)
        
        return NextResponse.json(
          { success: false, error: userError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nombre: nombre,
          nombreUsuario: nombreUsuario
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Error desconocido al crear usuario' },
      { status: 500 }
    )
    
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const cookieStore = cookies()
  
  // Crear cliente de Supabase con permisos de administrador
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  )

  try {
    const { auth_uid, nombre_completo, cargo, correo_electronico, contrasena } = await request.json()
    
    if (!auth_uid || !nombre_completo || !correo_electronico) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // 1. Actualizar datos del usuario en la tabla usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .update({ 
        nombre_completo,
        cargo,
        correo_electronico
      })
      .eq('auth_uid', auth_uid)

    if (userError) {
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      )
    }

    // 2. Si se proporcionó una nueva contraseña, actualizarla en Auth
    if (contrasena) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        auth_uid,
        { password: contrasena }
      )

      if (authError) {
        return NextResponse.json(
          { success: false, error: authError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    })
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      usuarios,
      totalUsuarios: usuarios.length
    })
    
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
} 