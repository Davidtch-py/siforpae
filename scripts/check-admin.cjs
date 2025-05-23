const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdmin() {
  try {
    console.log('Verificando usuario administrador...')
    
    // 1. Verificar en Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error al obtener usuarios de Auth:', authError)
      return
    }
    
    const adminAuthUser = authUser.users.find(user => user.email === 'a@a')
    
    if (adminAuthUser) {
      console.log('✅ Usuario a@a encontrado en Auth:')
      console.log(`  - ID: ${adminAuthUser.id}`)
      console.log(`  - Email: ${adminAuthUser.email}`)
      console.log(`  - Rol: ${adminAuthUser.app_metadata?.role || 'No definido'}`)
      console.log(`  - Email confirmado: ${adminAuthUser.email_confirmed_at ? 'Sí' : 'No'}`)
      
      // 2. Verificar en tabla usuarios
      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo_electronico', 'a@a')
        .single()
      
      if (dbError) {
        console.log('❌ Usuario no encontrado en tabla usuarios')
        console.log('Creando entrada en tabla usuarios...')
        
        // Buscar o crear rol administrador
        const { data: existingRole, error: roleCheckError } = await supabase
          .from('roles')
          .select('*')
          .eq('nombre_rol', 'administrador')
          .single()
        
        let rolId
        
        if (roleCheckError) {
          console.log('Creando rol administrador...')
          const { data: newRole, error: roleInsertError } = await supabase
            .from('roles')
            .insert({ nombre_rol: 'administrador' })
            .select()
            .single()
            
          if (roleInsertError) {
            console.error('Error al crear rol:', roleInsertError)
            return
          }
          
          rolId = newRole.rol_id
          console.log(`✅ Rol creado con ID: ${rolId}`)
        } else {
          rolId = existingRole.rol_id
          console.log(`Usando rol existente con ID: ${rolId}`)
        }
        
        // Insertar usuario en tabla
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            nombre_completo: 'Administrador',
            nombre_usuario: 'a@a',
            contrasena: 'auth_handled',
            correo_electronico: 'a@a',
            rol_id: rolId,
            estado: 'activo',
            fecha_creacion: new Date().toISOString(),
            auth_uid: adminAuthUser.id
          })
        
        if (insertError) {
          console.error('Error al insertar usuario en tabla:', insertError)
          return
        }
        
        console.log('✅ Usuario creado en tabla usuarios')
      } else {
        console.log('✅ Usuario encontrado en tabla usuarios:')
        console.log(`  - ID: ${dbUser.usuario_id}`)
        console.log(`  - Nombre: ${dbUser.nombre_completo}`)
        console.log(`  - Rol ID: ${dbUser.rol_id}`)
      }
    } else {
      console.log('❌ Usuario a@a no encontrado en Auth')
    }
  } catch (error) {
    console.error('Error general:', error)
  }
}

// Ejecutar la función
checkAdmin()
  .then(() => {
    console.log('Verificación completada')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error en el script:', err)
    process.exit(1)
  }) 