# Gestor de Proyectos y Tareas
Una aplicación móvil desarrollada con React Native y Expo para la gestión eficiente de proyectos y tareas en equipo.

# Características
  Autenticación y Seguridad
  Login con Google OAuth
  Autenticación segura con JWT
  Gestión de sesiones de usuario
  Pantallas de carga y manejo de errores

# Gestión de Proyectos
  Crear y editar proyectos
  Gestionar miembros del proyecto
  Lista de proyectos con detalles
  Interfaz intuitiva y responsive
  Sistema de Tareas
  Crear y editar tareas
  Asignar tareas a miembros
  Fechas de vencimiento
  Estados: Pendiente, En Progreso, Completada
  Descripciones detalladas

# Gestión de Usuarios
  Edición de perfil personal
  Visualización de perfiles
  Lista de usuarios del sistema
  Roles globales de usuario

# Tecnologías Utilizadas
  Frontend: React Native, Expo

  Navegación: React Navigation

  Estado Global: React Context API

  HTTP Client: Axios

  Autenticación: OAuth 2.0

  Plataforma: Android, iOS

# Descripción Detallada de Carpetas

/components/ - Componentes reutilizables organizados por funcionalidad

auth/ - Componentes de autenticación (LoginScreen, RegisterScreen, etc.)

common/ - Componentes comunes (Loading, ErrorMessage, Header, etc.)

projects/ - Componentes de gestión de proyectos

tasks/ - Componentes de gestión de tareas

users/ - Componentes de gestión de usuarios

/contexts/ - Contextos de React para el manejo de estado global

AuthContext.jsx - Estado de autenticación y usuario

ProjectContext.jsx - Estado de proyectos

ThemeContext.jsx - Estado de temas y preferencias

/navigation/ - Configuración de navegación

AppNavigator.jsx - Navegador principal

AuthNavigator.jsx - Navegador de autenticación

MainNavigator.jsx - Navegador de la app principal

/services/ - Servicios API y rutas

api.js - Configuración base de Axios e interceptores

auth.js - Servicios de autenticación (login, registro, logout)

projects.js - Operaciones CRUD de proyectos

tasks.js - Operaciones CRUD de tareas

users.js - Operaciones de usuarios y perfiles

/styles/ - Estilos y temas

common.js - Estilos base y componentes comunes

themes.js - Definiciones de temas (colores, tipografías, etc.)

/utils/ - Funciones de utilidad y helpers

constants.js - Constantes y configuraciones globales

helpers.js - Funciones auxiliares y formateadores

/hooks/ - Hooks personalizados de React

(Para futuros hooks personalizados)

/assets/ - Archivos estáticos como imágenes y fuentes

Iconos de la aplicación

Imágenes de splash screen

# Instalación y Configuración
Prerrequisitos
  Node.js (versión 16 o superior)

  npm o yarn

  Expo CLI

  Cuenta de Expo


# Pasos de instalación
  Clonar el repositorio
  
  git clone [url-del-repositorio]

  cd ProjectmanagementApp
  
Instalar dependencias
  npm install
  o
  yarn install

Configurar variables de entorno

  .env.example .env
  
Editar el archivo .env con tus configuraciones:

  API_BASE_URL=tu_api_url
  GOOGLE_OAUTH_CLIENT_ID=tu_google_client_id

Ejecutar la aplicación
  # Desarrollo
  expo start

  # Android
  expo start --android

  # iOS
  expo start --ios

# Funcionalidades Principales
Autenticación
Registro e inicio de sesión

Login social con Google

Gestión segura de tokens

Proyectos
Creación y edición de proyectos

Invitación de miembros

Control de acceso por roles

Vista detallada de proyectos

Tareas
Sistema completo de tareas

Asignación a miembros

Seguimiento de progreso

Fechas de vencimiento

Filtros y búsqueda

Perfiles de Usuario
Edición de información personal

Visualización de actividades

Gestión de preferencias

# Configuración de Desarrollo
Estructura de Contextos
AuthContext: Manejo de autenticación y sesiones

ProjectContext: Estado global de proyectos

ThemeContext: Gestión de temas y estilos

Servicios API
Cada módulo tiene su propio servicio para mantener separación de concerns:

auth.js: Autenticación y usuarios

projects.js: Operaciones de proyectos

tasks.js: Gestión de tareas

users.js: Perfiles de usuario

Navegación
AppNavigator: Navegación principal

AuthNavigator: Flujos de autenticación

MainNavigator: Navegación post-login

Personalización
Temas
La aplicación soporta temas personalizables a través de ThemeContext:

javascript
const theme = {
  colors: {
    primary: '#0984E3',
    secondary: '#636E72',
    success: '#27AE60',
    error: '#E74C3C'
  }
}

# Build y Deploy
Desarrollo
expo start --tunnel
Build para producción
# Android
expo build:android

# iOS
expo build:ios

EAS Build
# Configurar EAS
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
