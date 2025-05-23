import { TipoFormato } from './types'

export const TIPO_FORMATO = {
  LIMPIEZA: 1,
  RESIDUOS: 2,
  ALIMENTOS: 3,
  VIVERES: 4,
  DOTACION: 5
} as const

export const NOMBRE_FORMATO = {
  [TIPO_FORMATO.LIMPIEZA]: "Limpieza y Desinfección",
  [TIPO_FORMATO.RESIDUOS]: "Residuos",
  [TIPO_FORMATO.ALIMENTOS]: "Alimentos",
  [TIPO_FORMATO.VIVERES]: "Víveres",
  [TIPO_FORMATO.DOTACION]: "Dotación"
} as const

export type TipoFormatoId = typeof TIPO_FORMATO[keyof typeof TIPO_FORMATO]

export type TipoFormatoKey = keyof typeof TIPO_FORMATO

// Mapeo de nombres de formato para mostrar
export const NOMBRE_FORMATO_FULL = {
  [TIPO_FORMATO.LIMPIEZA]: "Limpieza y Desinfección",
  [TIPO_FORMATO.RESIDUOS]: "Residuos",
  [TIPO_FORMATO.ALIMENTOS]: "Alimentos",
  [TIPO_FORMATO.VIVERES]: "Víveres",
  [TIPO_FORMATO.DOTACION]: "Dotación"
} as const 