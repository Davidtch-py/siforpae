// Definición de tipos para la base de datos de Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          rol_id: number
          nombre_rol: string
        }
        Insert: {
          rol_id?: number
          nombre_rol: string
        }
        Update: {
          rol_id?: number
          nombre_rol?: string
        }
      }
      usuarios: {
        Row: {
          usuario_id: number
          nombre_completo: string
          cargo: string | null
          nombre_usuario: string
          contrasena: string
          correo_electronico: string | null
          rol_id: number | null
          estado: string | null
          fecha_creacion: string
          auth_uid: string
        }
        Insert: {
          usuario_id?: number
          nombre_completo: string
          cargo?: string | null
          nombre_usuario: string
          contrasena: string
          correo_electronico?: string | null
          rol_id?: number | null
          estado?: string | null
          fecha_creacion?: string
          auth_uid: string
        }
        Update: {
          usuario_id?: number
          nombre_completo?: string
          cargo?: string | null
          nombre_usuario?: string
          contrasena?: string
          correo_electronico?: string | null
          rol_id?: number | null
          estado?: string | null
          fecha_creacion?: string
          auth_uid?: string
        }
      }
      cargos: {
        Row: {
          cargo_id: number
          nombre_cargo: string
        }
        Insert: {
          cargo_id?: number
          nombre_cargo: string
        }
        Update: {
          cargo_id?: number
          nombre_cargo?: string
        }
      }
      complementos: {
        Row: {
          complemento_id: number
          nombre_complemento: string
          gramos_preescolar: number | null
          gramos_primaria: number | null
          gramos_cuarto_quinto: number | null
          gramos_secundaria: number | null
          estado: string | null
          fecha_creacion: string
        }
        Insert: {
          complemento_id?: number
          nombre_complemento: string
          gramos_preescolar?: number | null
          gramos_primaria?: number | null
          gramos_cuarto_quinto?: number | null
          gramos_secundaria?: number | null
          estado?: string | null
          fecha_creacion?: string
        }
        Update: {
          complemento_id?: number
          nombre_complemento?: string
          gramos_preescolar?: number | null
          gramos_primaria?: number | null
          gramos_cuarto_quinto?: number | null
          gramos_secundaria?: number | null
          estado?: string | null
          fecha_creacion?: string
        }
      }
      cantidadcomplemento: {
        Row: {
          cantidad_id: number
          complemento_id: number
          fecha_establecida: string
          cantidad: number
          fecha_creacion: string
        }
        Insert: {
          cantidad_id?: number
          complemento_id: number
          fecha_establecida: string
          cantidad: number
          fecha_creacion?: string
        }
        Update: {
          cantidad_id?: number
          complemento_id?: number
          fecha_establecida?: string
          cantidad?: number
          fecha_creacion?: string
        }
      }
      menus: {
        Row: {
          menu_id: number
          nombre_menu: string
          estado: string | null
          fecha_creacion: string
        }
        Insert: {
          menu_id?: number
          nombre_menu: string
          estado?: string | null
          fecha_creacion?: string
        }
        Update: {
          menu_id?: number
          nombre_menu?: string
          estado?: string | null
          fecha_creacion?: string
        }
      }
      menucomplementos: {
        Row: {
          menu_complemento_id: number
          menu_id: number
          complemento_id: number
        }
        Insert: {
          menu_complemento_id?: number
          menu_id: number
          complemento_id: number
        }
        Update: {
          menu_complemento_id?: number
          menu_id?: number
          complemento_id?: number
        }
      }
      entregamenus: {
        Row: {
          entrega_id: number
          menu_id: number
          fecha_entrega: string
          fecha_creacion: string
        }
        Insert: {
          entrega_id?: number
          menu_id: number
          fecha_entrega: string
          fecha_creacion?: string
        }
        Update: {
          entrega_id?: number
          menu_id?: number
          fecha_entrega?: string
          fecha_creacion?: string
        }
      }
      tiposformato: {
        Row: {
          tipo_formato_id: number
          nombre_formato: string
        }
        Insert: {
          tipo_formato_id?: number
          nombre_formato: string
        }
        Update: {
          tipo_formato_id?: number
          nombre_formato?: string
        }
      }
      archivosformato: {
        Row: {
          archivo_id: number
          tipo_formato_id: number
          nombre_archivo: string
          ruta_archivo: string
          fecha_subida: string
          estado: string | null
        }
        Insert: {
          archivo_id?: number
          tipo_formato_id: number
          nombre_archivo: string
          ruta_archivo: string
          fecha_subida?: string
          estado?: string | null
        }
        Update: {
          archivo_id?: number
          tipo_formato_id?: number
          nombre_archivo?: string
          ruta_archivo?: string
          fecha_subida?: string
          estado?: string | null
        }
      }
      estadosdiligenciamiento: {
        Row: {
          estado_diligenciamiento_id: number
          nombre_estado: string
        }
        Insert: {
          estado_diligenciamiento_id?: number
          nombre_estado: string
        }
        Update: {
          estado_diligenciamiento_id?: number
          nombre_estado?: string
        }
      }
      formatosdiligenciados: {
        Row: {
          diligenciamiento_id: number
          tipo_formato_id: number
          usuario_id: number
          fecha_diligenciamiento: string
          estado_diligenciamiento_id: number | null
          datos_formato: Json | null
          observaciones_admin: string | null
        }
        Insert: {
          diligenciamiento_id?: number
          tipo_formato_id: number
          usuario_id: number
          fecha_diligenciamiento?: string
          estado_diligenciamiento_id?: number | null
          datos_formato?: Json | null
          observaciones_admin?: string | null
        }
        Update: {
          diligenciamiento_id?: number
          tipo_formato_id?: number
          usuario_id?: number
          fecha_diligenciamiento?: string
          estado_diligenciamiento_id?: number | null
          datos_formato?: Json | null
          observaciones_admin?: string | null
        }
      }
      reportes: {
        Row: {
          reporte_id: number
          usuario_id: number
          fecha_generacion: string
          observacion_admin: string | null
        }
        Insert: {
          reporte_id?: number
          usuario_id: number
          fecha_generacion?: string
          observacion_admin?: string | null
        }
        Update: {
          reporte_id?: number
          usuario_id?: number
          fecha_generacion?: string
          observacion_admin?: string | null
        }
      }
      reporteformatos: {
        Row: {
          reporte_formato_id: number
          reporte_id: number
          diligenciamiento_id: number
        }
        Insert: {
          reporte_formato_id?: number
          reporte_id: number
          diligenciamiento_id: number
        }
        Update: {
          reporte_formato_id?: number
          reporte_id?: number
          diligenciamiento_id?: number
        }
      }
      respuestasreporte: {
        Row: {
          respuesta_id: number
          reporte_id: number
          usuario_supervisor_id: number
          fecha_respuesta: string
          observaciones: string | null
        }
        Insert: {
          respuesta_id?: number
          reporte_id: number
          usuario_supervisor_id: number
          fecha_respuesta?: string
          observaciones?: string | null
        }
        Update: {
          respuesta_id?: number
          reporte_id?: number
          usuario_supervisor_id?: number
          fecha_respuesta?: string
          observaciones?: string | null
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {}
  }
}

// Exportar tipos específicos
export type Role = Database['public']['Tables']['roles']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Cargo = Database['public']['Tables']['cargos']['Row']
export type Complemento = Database['public']['Tables']['complementos']['Row']
export type CantidadComplemento = Database['public']['Tables']['cantidadcomplemento']['Row']
export type Menu = Database['public']['Tables']['menus']['Row']
export type MenuComplemento = Database['public']['Tables']['menucomplementos']['Row']
export type EntregaMenu = Database['public']['Tables']['entregamenus']['Row']
export type TipoFormato = Database['public']['Tables']['tiposformato']['Row']
export type ArchivoFormato = Database['public']['Tables']['archivosformato']['Row']
export type EstadoDiligenciamiento = Database['public']['Tables']['estadosdiligenciamiento']['Row']
export type FormatoDiligenciado = Database['public']['Tables']['formatosdiligenciados']['Row']
export type Reporte = Database['public']['Tables']['reportes']['Row']
export type ReporteFormato = Database['public']['Tables']['reporteformatos']['Row']
export type RespuestaReporte = Database['public']['Tables']['respuestasreporte']['Row']

export const ESTADOS_DILIGENCIAMIENTO = {
  PENDIENTE: 1,
  APROBADO: 2,
  RECHAZADO: 3
} as const

export type EstadoDiligenciamientoId = typeof ESTADOS_DILIGENCIAMIENTO[keyof typeof ESTADOS_DILIGENCIAMIENTO]
