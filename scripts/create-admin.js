import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Necesitamos la clave de servicio para usar admin.createUser

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
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
      console.log(`El usuario ${email} ya existe en la base de datos.`)
      return
    }

    // 2. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' }, 
    })

    if (authError) throw authError

    // 3. Insertar en la tabla usuarios
    if (authData.user) {
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nombre_completo: nombreCompleto,
          nombre_usuario: email,
          contrasena: 'auth_handled', // La contraseña real se maneja en Auth
          correo_electronico: email,
          rol_id: 1, // ID para rol de administrador
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          auth_uid: authData.user.id
        })

      if (insertError) throw insertError
      
      console.log(`✅ Usuario administrador creado exitosamente: ${email}`)
    }
  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
  }
}

// Ejecutar la función
createAdminUser()
  .then(() => {
    console.log('Script completado')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error al ejecutar el script:', err)
    process.exit(1)
  }) 