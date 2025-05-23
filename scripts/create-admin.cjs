const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

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
    console.log('Iniciando creación de usuario administrador...')
    
    // 1. Verificar si el rol de administrador existe, si no, crearlo
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('roles')
      .select('*')
      .eq('nombre_rol', 'administrador')
      .single()
    
    let rolId = existingRole?.rol_id
    
    if (!existingRole) {
      console.log('Rol de administrador no encontrado, creándolo...')
      const { data: newRole, error: roleInsertError } = await supabase
        .from('roles')
        .insert({ nombre_rol: 'administrador' })
        .select()
        .single()
        
      if (roleInsertError) {
        console.error('Error al crear rol de administrador:', roleInsertError)
        throw roleInsertError
      }
      
      console.log('✅ Rol de administrador creado con ID:', newRole.rol_id)
      rolId = newRole.rol_id
    } else {
      console.log('Rol de administrador encontrado con ID:', existingRole.rol_id)
    }

    // 2. Verificar si el usuario ya existe
    const email = 'a@a'
    const password = 'a'
    const nombreCompleto = 'Administrador'
    
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo_electronico', email)
      .single()
    
    if (!checkError && existingUser) {
      console.log(`El usuario ${email} ya existe en la base de datos.`)
      return
    }

    // 3. Crear el usuario en Auth
    console.log('Creando usuario en Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' }, 
    })

    if (authError) {
      console.error('Error al crear usuario en Auth:', authError)
      throw authError
    }
    
    console.log('✅ Usuario creado en Auth')

    // 4. Insertar en la tabla usuarios
    if (authData.user) {
      console.log('Insertando usuario en la tabla usuarios...')
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nombre_completo: nombreCompleto,
          nombre_usuario: email,
          contrasena: 'auth_handled', // La contraseña real se maneja en Auth
          correo_electronico: email,
          rol_id: rolId, // Usar el ID del rol que encontramos o creamos
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          auth_uid: authData.user.id
        })

      if (insertError) {
        console.error('Error al insertar usuario en tabla:', insertError)
        throw insertError
      }
      
      console.log(`✅ Usuario administrador creado exitosamente: ${email}`)
      console.log(`Email: ${email}`)
      console.log(`Contraseña: ${password}`)
      console.log(`Rol: administrador (ID: ${rolId})`)
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