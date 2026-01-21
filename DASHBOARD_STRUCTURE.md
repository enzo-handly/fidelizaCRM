# Estructura de Componentes Dashboard

## 📁 Nueva Organización

Los componentes del dashboard han sido reorganizados siguiendo el patrón **feature-based organization** para mejorar la mantenibilidad y escalabilidad del proyecto.

### Estructura Anterior
```
components/dashboard/
  ├── header.tsx
  ├── sidebar.tsx
  ├── citas-calendar.tsx
  ├── citas-table.tsx
  ├── create-cita-dialog.tsx
  ├── edit-cita-dialog.tsx
  ├── clientes-table.tsx
  ├── create-cliente-dialog.tsx
  ├── edit-cliente-dialog.tsx
  ├── users-table.tsx
  ├── create-user-dialog.tsx
  ├── edit-user-dialog.tsx
  ├── ... (24 archivos en total)
```

### Estructura Actual
```
components/dashboard/
  ├── layout/                    # Componentes de estructura
  │   ├── header.tsx
  │   └── sidebar.tsx
  │
  ├── citas/                     # Módulo de Citas
  │   ├── citas-calendar.tsx
  │   ├── citas-table.tsx
  │   ├── create-cita-dialog.tsx
  │   └── edit-cita-dialog.tsx
  │
  ├── clientes/                  # Módulo de Clientes
  │   ├── clientes-table.tsx
  │   ├── create-cliente-dialog.tsx
  │   └── edit-cliente-dialog.tsx
  │
  ├── usuarios/                  # Módulo de Usuarios
  │   ├── users-table.tsx
  │   ├── create-user-dialog.tsx
  │   └── edit-user-dialog.tsx
  │
  ├── plantillas/                # Módulo de Plantillas
  │   ├── plantillas-table.tsx
  │   ├── create-plantilla-dialog.tsx
  │   └── edit-plantilla-dialog.tsx
  │
  ├── recordatorios/             # Módulo de Recordatorios
  │   ├── recordatorios-table.tsx
  │   ├── create-recordatorio-dialog.tsx
  │   └── edit-recordatorio-dialog.tsx
  │
  ├── servicios/                 # Módulo de Servicios y Subservicios
  │   ├── servicios-view.tsx
  │   ├── subservicios-table.tsx
  │   ├── create-subservicio-dialog.tsx
  │   └── edit-subservicio-dialog.tsx
  │
  └── shared/                    # Componentes compartidos
      ├── dashboard-chart.tsx
      └── profile-settings-form.tsx
```

## 📂 Descripción de Carpetas

### `layout/` (2 archivos)
Componentes de estructura y navegación del dashboard.
- **header.tsx** - Barra superior con perfil y notificaciones
- **sidebar.tsx** - Menú lateral de navegación

### `citas/` (4 archivos)
Todo lo relacionado con agendamientos y citas.
- **citas-calendar.tsx** - Vista de calendario de citas
- **citas-table.tsx** - Vista de tabla de citas
- **create-cita-dialog.tsx** - Diálogo para crear cita
- **edit-cita-dialog.tsx** - Diálogo para editar cita

### `clientes/` (3 archivos)
Gestión de clientes.
- **clientes-table.tsx** - Tabla de clientes
- **create-cliente-dialog.tsx** - Diálogo para crear cliente
- **edit-cliente-dialog.tsx** - Diálogo para editar cliente

### `usuarios/` (3 archivos)
Administración de usuarios del sistema.
- **users-table.tsx** - Tabla de usuarios
- **create-user-dialog.tsx** - Diálogo para crear usuario
- **edit-user-dialog.tsx** - Diálogo para editar usuario

### `plantillas/` (3 archivos)
Plantillas de mensajes WhatsApp.
- **plantillas-table.tsx** - Tabla de plantillas
- **create-plantilla-dialog.tsx** - Diálogo para crear plantilla
- **edit-plantilla-dialog.tsx** - Diálogo para editar plantilla

### `recordatorios/` (3 archivos)
Recordatorios y notificaciones.
- **recordatorios-table.tsx** - Tabla de recordatorios
- **create-recordatorio-dialog.tsx** - Diálogo para crear recordatorio
- **edit-recordatorio-dialog.tsx** - Diálogo para editar recordatorio

### `servicios/` (4 archivos)
Servicios y subservicios ofrecidos.
- **servicios-view.tsx** - Vista principal de servicios
- **subservicios-table.tsx** - Tabla de subservicios
- **create-subservicio-dialog.tsx** - Diálogo para crear subservicio
- **edit-subservicio-dialog.tsx** - Diálogo para editar subservicio

### `shared/` (2 archivos)
Componentes compartidos entre múltiples módulos.
- **dashboard-chart.tsx** - Gráfico del dashboard principal
- **profile-settings-form.tsx** - Formulario de configuración de perfil

## 🔄 Actualización de Imports

### Antes
```tsx
import { DashboardHeader } from "@/components/dashboard/header"
import { ClientesTable } from "@/components/dashboard/clientes-table"
import { CreateCitaDialog } from "@/components/dashboard/create-cita-dialog"
```

### Después
```tsx
import { DashboardHeader } from "@/components/dashboard/layout/header"
import { ClientesTable } from "@/components/dashboard/clientes/clientes-table"
import { CreateCitaDialog } from "@/components/dashboard/citas/create-cita-dialog"
```

## ✅ Beneficios

### 1. **Organización por Feature**
Todos los archivos relacionados con un módulo están juntos, facilitando encontrar y modificar funcionalidad específica.

### 2. **Escalabilidad**
Agregar nuevos componentes a un módulo es simple - solo se añaden a la carpeta correspondiente.

### 3. **Mantenibilidad**
- Más fácil entender la estructura del proyecto
- Reducción de tiempo buscando archivos
- Separación clara de responsabilidades

### 4. **Colocación (Colocation)**
Archivos que cambian juntos están juntos:
- Tabla + Dialogs de create/edit del mismo módulo
- Facilita refactoring y testing por módulo

### 5. **Imports Más Semánticos**
```tsx
// Más claro de dónde viene el componente
import { UsersTable } from "@/components/dashboard/usuarios/users-table"
// vs
import { UsersTable } from "@/components/dashboard/users-table"
```

## 📋 Archivos Actualizados

Se actualizaron las importaciones en los siguientes archivos:

### Páginas de App Router (9 archivos)
- ✅ `app/dashboard/layout.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `app/dashboard/agendamientos/page.tsx`
- ✅ `app/dashboard/clientes/page.tsx`
- ✅ `app/dashboard/plantillas/page.tsx`
- ✅ `app/dashboard/recordatorios/page.tsx`
- ✅ `app/dashboard/servicios/page.tsx`
- ✅ `app/dashboard/usuarios/page.tsx`
- ✅ `app/dashboard/settings/page.tsx`

### Estado del Build
✅ Build exitoso - todas las rutas compiladas correctamente  
✅ 0 errores de TypeScript  
✅ Solo warnings cosméticos de Tailwind CSS

## 🚀 Próximos Pasos

### Posibles Mejoras Futuras
1. **Crear index.ts en cada carpeta** para exports centralizados:
   ```tsx
   // components/dashboard/clientes/index.ts
   export { ClientesTable } from './clientes-table'
   export { CreateClienteDialog } from './create-cliente-dialog'
   export { EditClienteDialog } from './edit-cliente-dialog'
   
   // Usar como:
   import { ClientesTable, CreateClienteDialog } from '@/components/dashboard/clientes'
   ```

2. **Agregar README.md por módulo** con documentación específica de cada feature

3. **Tests por módulo** organizados en la misma estructura:
   ```
   __tests__/
     dashboard/
       citas/
         citas-table.test.tsx
         create-cita-dialog.test.tsx
   ```

## 📝 Convenciones

### Naming
- **Carpetas**: lowercase con guiones (kebab-case)
- **Archivos de componentes**: kebab-case.tsx
- **Componentes**: PascalCase

### Estructura de Módulo Típica
```
modulo/
  ├── [nombre]-table.tsx          # Vista principal de tabla
  ├── create-[nombre]-dialog.tsx  # Crear nuevo item
  ├── edit-[nombre]-dialog.tsx    # Editar item existente
  └── [nombre]-view.tsx           # Vista alternativa (opcional)
```

---

**Fecha de reorganización**: 2026-01-21  
**Versión**: 1.0  
**Estado**: ✅ Completado y verificado
