
export const INSTITUCION="ENSLAP"
export const SEDE="Restaurante central"


const SIDEBAR_ITEMS = [
      {
        label: "Disposicion de Residuos Solidos en Comedores Escolares",
        href: "/formatos/residuos",
      },
      {
        label: "Limpieza en Restaurante Escolares",
        href: "/formatos/limpieza",
      },
      {
        label: "Remisión Entrega de Viveres En Comedores Escolares",
        href: "/formatos/viveres",
      },
      {
        label: "Entrega De Dotacion",
        href: "/formatos/dotacion",
      },
      {
        label: "Entrada y Salida de Alimentos en los Restaurantes Escolares",
        href: "/formatos/alimentos",
      },
      {
        label: "Almacenamiento de formatos diligenciados",
        href: "/formatos/almacenamiento",
      }
]

export const getActualDate=()=>{
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function getSidebarItems() {
  return structuredClone(SIDEBAR_ITEMS)
}