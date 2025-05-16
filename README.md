# SIFORPAE - Sistema de Formatos para el Programa de Alimentación Escolar

SIFORPAE es una aplicación web moderna desarrollada con Next.js que permite gestionar los formatos y documentación relacionada con el Programa de Alimentación Escolar. La aplicación incluye funcionalidades para la gestión de formatos, complementos alimenticios, reportes y menús.

## 🚀 Características

- 📝 Gestión de formatos digitales
- 🍽️ Control de menús escolares
- 📊 Generación de reportes
- 👥 Administración de usuarios
- 🌓 Modo oscuro/claro
- 📱 Diseño responsivo
- 🔍 Tour guiado para nuevos usuarios
- ✍️ Firma digital integrada

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 18.0.0 o superior)
- npm (incluido con Node.js)
- Git

## 🛠️ Instalación

### Windows

1. Instala Node.js:
   - Descarga el instalador desde [nodejs.org](https://nodejs.org)
   - Ejecuta el instalador y sigue las instrucciones
   - Verifica la instalación:
     ```bash
     node --version
     npm --version
     ```

2. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/siforpae.git
   cd siforpae
   ```

3. Instala las dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_API_URL=tu_url_api
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### macOS

1. Instala Node.js usando Homebrew:
   ```bash
   # Instala Homebrew si no lo tienes
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Instala Node.js
   brew install node
   ```

2. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/siforpae.git
   cd siforpae
   ```

3. Instala las dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_API_URL=tu_url_api
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🔧 Solución de Problemas Comunes

### Error de Dependencias

Si encuentras errores de dependencias, intenta:

```bash
# Limpia la caché de npm
npm cache clean --force

# Elimina node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstala las dependencias
npm install --legacy-peer-deps
```

### Error de Compilación

Si encuentras errores de compilación:

```bash
# Limpia la caché de Next.js
rm -rf .next

# Reinicia el servidor de desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
siforpae/
├── app/
│   ├── admin/           # Rutas de administración
│   ├── components/      # Componentes reutilizables
│   ├── formatos/       # Páginas de formatos
│   ├── hooks/          # Custom hooks
│   └── styles/         # Estilos globales
├── public/             # Archivos estáticos
└── package.json        # Dependencias y scripts
```

## 🛣️ Rutas Principales

- `/` - Página de inicio
- `/dashboard` - Panel principal
- `/formatos` - Gestión de formatos
- `/admin/dashboard` - Panel de administración
- `/opciones` - Configuración del sistema

## 🔐 Roles de Usuario

- **Administrador**: Acceso completo al sistema
- **Usuario**: Acceso a formatos y funciones básicas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📞 Soporte

Para soporte y preguntas, por favor abre un issue en el repositorio de GitHub. 