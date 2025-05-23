import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Configuración mejorada para persistencia de sesión y manejo correcto de tokens
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce', // Usar flujo PKCE para mejor seguridad
  },
})

// Funciones de utilidad para la gestión de autenticación

// Iniciar sesión con nombre de usuario
export async function signInWithEmail(username: string, password: string) {
  console.log("------ INICIO DE PROCESO DE LOGIN ------")
  console.log("Intentando iniciar sesión con usuario:", username)
  
  try {
    // Primero buscar el correo del usuario usando el endpoint
    console.log("Buscando correo asociado al nombre de usuario...")
    const response = await fetch('/api/auth/get-user-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    })

    const result = await response.json()
    console.log("Resultado de búsqueda:", result)

    if (!result.success) {
      console.error("Error al buscar usuario:", result.error)
      return { 
        data: { session: null, user: null }, 
        error: { message: result.error, status: response.status } 
      }
    }

    const email = result.data.email
    console.log("Correo encontrado para el usuario:", email)
    
    // Intentar iniciar sesión con el correo encontrado
    console.log("Intentando iniciar sesión con el correo asociado...")
    const authResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Resultado de inicio de sesión:", {
      error: authResponse.error,
      hasUser: !!authResponse.data?.user,
      hasSession: !!authResponse.data?.session
    })

    if (authResponse.error) {
      console.error("Error en signInWithPassword:", authResponse.error.message)
      
      // Personalizar mensaje de error
      let errorMessage = "Credenciales inválidas"
      if (authResponse.error.message === "Invalid login credentials") {
        errorMessage = "Contraseña incorrecta"
      }
      
      return {
        data: { session: null, user: null },
        error: { message: errorMessage, status: 401 }
      }
    }

    // Si el inicio de sesión es exitoso, añadir la información adicional
    if (authResponse.data.user) {
      authResponse.data.user.user_metadata = {
        ...authResponse.data.user.user_metadata,
        nombre_completo: result.data.nombre_completo
      }
    }

    // Verificar sesión y sincronizar cookies
    if (authResponse.data.session) {
      console.log("Sincronizando cookies...")
      await syncCookiesWithSession(authResponse.data.session)
      
      // Redirección basada en rol
      if (typeof window !== 'undefined') {
        const role = authResponse.data.session.user.app_metadata?.role
        console.log("Rol del usuario:", role)
        if (role === 'admin' || role === 'administrador') {
          window.location.href = "/admin/dashboard"
        } else {
          window.location.href = "/dashboard"
        }
      }
    }

    console.log("------ FIN DE PROCESO DE LOGIN (ÉXITO) ------")
    return authResponse
    
  } catch (error) {
    console.error("------ ERROR INESPERADO EN LOGIN ------")
    console.error("Error inesperado en signInWithEmail:", error instanceof Error ? error.message : String(error))
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace disponible")
    console.error("------ FIN DE ERROR INESPERADO ------")
    return { 
      data: { session: null, user: null }, 
      error: { message: "Error inesperado durante el inicio de sesión", status: 500 } 
    }
  }
}

// Función para sincronizar las cookies con la sesión actual
async function syncCookiesWithSession(session: any) {
  if (!session) return;
  
  // Llamar a nuestro endpoint de API para forzar la sincronización de cookies
  try {
    console.log("Sincronizando cookies con la sesión...")
    const response = await fetch('/api/auth/sync-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error("Error al sincronizar cookies:", await response.text());
    } else {
      console.log("Cookies sincronizadas correctamente");
    }
  } catch (error) {
    console.error("Error al sincronizar cookies:", error);
  }
}

// Cerrar sesión
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
    console.log("Sesión cerrada exitosamente")
    return { success: true }
  } catch (error) {
    console.error("Error inesperado al cerrar sesión:", error)
    return { success: false, error }
  }
}

// Obtener la sesión actual
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error al obtener sesión:", error)
    } else if (!data.session) {
      console.log("No hay sesión activa")
    } else {
      console.log("Sesión activa encontrada")
    }
    return { data, error }
  } catch (error) {
    console.error("Error inesperado al obtener sesión:", error)
    return { data: { session: null }, error }
  }
}

// Obtener el usuario actual
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error al obtener usuario:", error)
      return null
    }
    return data?.user
  } catch (error) {
    console.error("Error inesperado al obtener usuario:", error)
    return null
  }
}

// Obtener el rol del usuario actual
export async function getUserRole() {
  const user = await getCurrentUser()
  if (!user) return null
  
  try {
    // Primero intentar obtener el rol desde los metadatos (más fiable)
    if (user.app_metadata?.role) {
      return user.app_metadata.role
    }
    
    // Si no hay rol en los metadatos, consultar la función RPC
    const { data, error } = await supabase.rpc('get_user_role')
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error)
    return null
  }
}

// Obtener información completa del usuario actual desde la tabla usuarios
export async function getUserInfo() {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_uid', user.id)
    .single()
    
  if (error) {
    console.error('Error al obtener información del usuario:', error)
    return null
  }
  
  return data
}

// Crear un usuario administrador
export async function createAdminUser(email: string, password: string, nombreCompleto: string) {
  try {
    // 1. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      app_metadata: { role: 'admin' }, // Asignar rol de administrador en metadatos
    })

    if (authError) throw authError

    // 2. Insertar en la tabla usuarios
    if (authData.user) {
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nombre_completo: nombreCompleto,
          nombre_usuario: email,
          contrasena: 'auth_handled', // La contraseña real se maneja en Auth
          correo_electronico: email,
          rol_id: 1, // Asumiendo que 1 es el ID para rol de administrador
          estado: 'activo',
          fecha_creacion: new Date().toISOString(),
          auth_uid: authData.user.id
        })

      if (insertError) throw insertError
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
    return { success: false, error }
  }
} 