# 🚀 Quick Reference - SOLID Architecture

## Imports rápidos

```typescript
// Auth
import { withAuth, requireAdmin } from "@/lib/auth"

// Errors
import { handleError, ValidationError, BusinessLogicError } from "@/lib/errors"
import type { ActionResult } from "@/lib/errors"

// Repositories
import { ClienteRepository, CitaRepository, /* ... */ } from "@/lib/repositories"

// Services
import { ClienteService, UserService } from "@/lib/services"

// Utils
import { formatPrice, formatDate, isValidEmail } from "@/lib/utils"
```

---

## Template: Nueva Acción

```typescript
"use server"

import { withAuth } from "@/lib/auth"
import { handleError, type ActionResult } from "@/lib/errors"
import { EntityRepository } from "@/lib/repositories/entity-repository"
import { EntityService } from "@/lib/services/entity-service"
import { revalidatePath } from "next/cache"
import type { Entity } from "@/lib/types"

export async function createEntity(data: CreateEntityData): Promise<ActionResult<Entity>> {
  try {
    const { supabase } = await withAuth()
    const repository = new EntityRepository(supabase)
    const service = new EntityService(repository)
    const entity = await service.create(data)
    
    revalidatePath("/dashboard/entities")
    return { success: true, data: entity }
  } catch (error) {
    return handleError(error)
  }
}
```

---

## Template: Nuevo Repositorio

```typescript
import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository } from "./base-repository"
import type { Entity } from "@/lib/types"

export interface CreateEntityDTO {
  nombre: string
}

export interface UpdateEntityDTO {
  nombre?: string
}

export class EntityRepository extends BaseRepository<Entity, CreateEntityDTO, UpdateEntityDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "entities")
  }

  // Métodos custom
  async findByNombre(nombre: string): Promise<Entity[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .ilike("nombre", `%${nombre}%`)
      .is("deleted_at", null)
    
    if (error) throw new DatabaseError(error.message, error)
    return (data || []) as unknown as Entity[]
  }
}
```

---

## Template: Nuevo Servicio

```typescript
import type { EntityRepository } from "@/lib/repositories/entity-repository"
import type { Entity } from "@/lib/types"
import { ValidationError, BusinessLogicError } from "@/lib/errors"

export class EntityService {
  constructor(private repository: EntityRepository) {}

  async create(data: CreateEntityDTO): Promise<Entity> {
    // Validación
    this.validate(data)
    
    // Reglas de negocio
    const existing = await this.repository.findByNombre(data.nombre)
    if (existing.length > 0) {
      throw new BusinessLogicError("Ya existe")
    }
    
    return this.repository.create(data)
  }

  private validate(data: CreateEntityDTO): void {
    if (!data.nombre?.trim()) {
      throw new ValidationError("Nombre requerido")
    }
  }
}
```

---

## Errores disponibles

```typescript
// 401 - No autenticado
throw new AuthenticationError("Debe iniciar sesión")

// 403 - No autorizado
throw new AuthorizationError("Requiere rol admin")

// 404 - No encontrado
throw new NotFoundError("Cliente", id)

// 400 - Validación
throw new ValidationError("Email inválido", { email: ["Formato incorrecto"] })

// 422 - Lógica de negocio
throw new BusinessLogicError("No se puede eliminar cliente con citas")

// 500 - Base de datos
throw new DatabaseError("Error al insertar", originalError)

// 502 - Servicio externo
throw new ExternalServiceError("WAHA", "Timeout", originalError)
```

---

## Middlewares de Auth

```typescript
// Usuario autenticado (cualquier rol)
const { supabase, user, profile } = await withAuth()

// Solo admins
const { supabase, user, profile } = await requireAdmin()

// Solo users
const { supabase, user, profile } = await requireUser()

// Permitir usuarios inactivos
const { supabase, user, profile } = await withAuth({ requireActive: false })
```

---

## Utilidades comunes

```typescript
// Formateo
formatPrice(150000)        // "₲ 150.000"
formatDate("2024-01-20")   // "20 ene 2024"
formatDateTime(dateString) // "20 ene 2024, 14:30"
formatPhoneNumber("0981234567") // "098-123-4567"

// Validación
isValidEmail("test@example.com")  // true
isValidPhoneNumber("0981234567")  // true
isEmpty(str)                       // true/false
isPastDate(date)                   // true/false
isFutureDate(date)                 // true/false

// Sanitización
sanitizeString("  Hello  World  ")  // "Hello World"
```

---

## Métodos BaseRepository

Todos los repositorios heredan estos métodos:

```typescript
// CRUD básico
await repository.findAll("nombre")  // Todos ordenados
await repository.findById(id)       // Por ID o null
await repository.create(data)       // Crear nuevo
await repository.update(id, data)   // Actualizar
await repository.delete(id)         // Soft delete
```

---

## Patterns comunes

### 1. Validar y crear
```typescript
async create(data: DTO): Promise<Entity> {
  this.validate(data)
  this.checkBusinessRules(data)
  return this.repository.create(data)
}
```

### 2. Verificar existencia antes de actualizar
```typescript
async update(id: string, data: DTO): Promise<Entity> {
  const existing = await this.repository.findById(id)
  if (!existing) throw new ValidationError("No encontrado")
  
  this.validate(data)
  return this.repository.update(id, data)
}
```

### 3. Verificar dependencias antes de eliminar
```typescript
async delete(id: string): Promise<void> {
  const hasRelated = await this.checkRelatedRecords(id)
  if (hasRelated) {
    throw new BusinessLogicError("No se puede eliminar, tiene registros relacionados")
  }
  
  await this.repository.delete(id)
}
```

### 4. Transacciones complejas (ejemplo Cita)
```typescript
async createWithRelations(data: DTO): Promise<Entity> {
  // 1. Validar todos los datos
  this.validateMain(data)
  this.validateRelations(data)
  
  // 2. Calcular valores derivados
  const total = this.calculateTotal(data)
  
  // 3. Crear entidad principal
  const entity = await this.repository.create({ ...data, total })
  
  // 4. Crear relaciones
  await this.createRelations(entity.id, data.relations)
  
  // 5. Crear recordatorio si aplica
  if (data.createReminder) {
    await this.createReminder(entity)
  }
  
  return entity
}
```

---

## Checklist para agregar nueva funcionalidad

- [ ] Definir tipos en `lib/types.ts` (si aplica)
- [ ] Crear DTOs (CreateDTO, UpdateDTO)
- [ ] Crear/extender repositorio en `lib/repositories/`
- [ ] Crear servicio en `lib/services/` con validaciones
- [ ] Crear/actualizar acciones en `app/actions/`
- [ ] Usar middleware apropiado (`withAuth` o `requireAdmin`)
- [ ] Manejar errores con `handleError()`
- [ ] Revalidar cache con `revalidatePath()`
- [ ] Actualizar exports en archivos `index.ts`
- [ ] Documentar en código si la lógica es compleja

---

## Debugging tips

```typescript
// En desarrollo, los errores muestran stack trace completo
try {
  await service.create(data)
} catch (error) {
  console.error(error) // Ver error completo
  return handleError(error) // Retornar al cliente
}

// Verificar tipo de error
if (error instanceof ValidationError) {
  console.log(error.details) // { field: ["error1", "error2"] }
}

// Códigos de error disponibles
AUTH_001, AUTH_002, NOT_FOUND, VALIDATION_ERROR, 
DB_ERROR, BUSINESS_ERROR, EXTERNAL_SERVICE_ERROR
```

---

## Performance tips

```typescript
// ✅ Bueno: Crear instancias solo cuando necesites
export async function action() {
  const { supabase } = await withAuth()
  const service = new Service(new Repository(supabase))
  return service.doSomething()
}

// ❌ Malo: No crear instancias globales
const service = new Service(...) // ❌ No hacer esto

// ✅ Bueno: Reutilizar queries complejas
protected getSelectQuery(): string {
  return `*, cliente:clientes(*), items:items(*)`
}

// ✅ Bueno: Usar índices de BD para búsquedas frecuentes
// Asegurar índices en: email, contacto, fecha_hora, etc.
```

---

## Testing (cuando se implemente)

```typescript
describe("EntityService", () => {
  let service: EntityService
  let mockRepo: jest.Mocked<EntityRepository>

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any
    service = new EntityService(mockRepo)
  })

  it("should validate required fields", async () => {
    await expect(service.create({ nombre: "" }))
      .rejects.toThrow(ValidationError)
  })

  it("should create entity", async () => {
    mockRepo.create.mockResolvedValue({ id: "123" } as any)
    const result = await service.create({ nombre: "Test" })
    expect(result.id).toBe("123")
  })
})
```

---

## Archivos de referencia

- **Auth**: [lib/auth/middleware.ts](lib/auth/middleware.ts)
- **Errors**: [lib/errors/app-errors.ts](lib/errors/app-errors.ts)
- **Base Repo**: [lib/repositories/base-repository.ts](lib/repositories/base-repository.ts)
- **Ejemplo completo**: [lib/services/cliente-service.ts](lib/services/cliente-service.ts)
- **Guía detallada**: [REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)

---

**Mantener este archivo actualizado con nuevos patterns que emerjan**
