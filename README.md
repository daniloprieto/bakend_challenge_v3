# Backend Challenge V3

API REST para el challenge de agenda de contactos, construida con Node.js,
TypeScript, Express y PostgreSQL.

## Stack

- Node.js 22
- TypeScript
- Express
- PostgreSQL 18.3
- Zod
- ESLint + Prettier
- Postman

## Arquitectura

El proyecto usa una arquitectura hexagonal liviana:

- `domain`: entidades, contratos y errores propios del negocio.
- `application`: casos de uso.
- `infrastructure`: adaptadores externos, como HTTP y PostgreSQL.
- `shared`: configuración y componentes transversales.

Flujo esperado:

```txt
HTTP Controller -> Use Case -> Repository Port -> PostgreSQL Adapter
```

La intención es mantener Express y PostgreSQL fuera del núcleo de negocio, pero
sin agregar capas innecesarias para el tamaño del challenge.

## Estructura

```txt
src/
  modules/
    contacts/
      domain/
      application/
      infrastructure/
    activities/
      domain/
      application/
      infrastructure/
    health/
      domain/
      application/
      infrastructure/
  shared/
    config/
    database/
    http/
```

## Requisitos

- Node.js 22+
- npm 10+
- Docker, para levantar PostgreSQL aislado del PostgreSQL local.

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:migrate
npm run dev
```

## Scripts

```bash
npm run build
npm run db:migrate
npm run lint
npm run test
npm run format
npm run start
```

## Endpoints

### Health

```txt
GET /api/health
```

### Contacts

```txt
POST   /api/contacts
GET    /api/contacts/by-email?email=
GET    /api/contacts?firstName=&lastName=&dateOfBirth=
GET    /api/contacts/by-phone?number=&typeName=
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
```

Ejemplo `POST /api/contacts`:

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "dateOfBirth": "1815-12-10",
  "email": "ada@example.com",
  "phones": [
    {
      "number": "555-1000",
      "typeName": "mobile"
    }
  ],
  "addresses": [
    {
      "locality": "Cordoba",
      "street": "San Martin",
      "number": 100,
      "notes": "Main address"
    }
  ]
}
```

Ejemplo `PATCH /api/contacts/:id`:

```json
{
  "firstName": "Ada Augusta",
  "email": "ada.augusta@example.com"
}
```

### Activities

```txt
POST /api/activities
GET  /api/activities?personId=&activityType=
```

`activityType` acepta únicamente:

```txt
call
meeting
email
```

Ejemplo `POST /api/activities`:

```json
{
  "personId": "1",
  "activityType": "call",
  "activityDate": "2026-05-11T12:00:00.000Z",
  "description": "Follow-up call"
}
```

La búsqueda de actividades devuelve detalles del contacto:

```json
{
  "id": "1",
  "activityType": "call",
  "activityDate": "2026-05-11T12:00:00.000Z",
  "description": "Follow-up call",
  "contact": {
    "id": "1",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "email": "ada@example.com",
    "dateOfBirth": "1815-12-10"
  }
}
```

## Base De Datos

El proyecto usa PostgreSQL 18.3 con Docker Compose. Para no tocar bases locales
existentes, el contenedor publica PostgreSQL en `localhost:5433` y usa una base
propia llamada `emergencias_challenge`.

```txt
postgres://challenge:challenge@localhost:5433/emergencias_challenge
```

Las migraciones SQL viven en `database/migrations` y se ejecutan con:

```bash
npm run db:migrate
```

Por seguridad, el runner de migraciones rechaza cualquier destino distinto de
`localhost:5433/emergencias_challenge`.

## Health Check

```bash
curl http://localhost:3000/api/health
```

## Postman

La documentación ejecutable de la API está en `.postman`:

- `.postman/emergencias-backend-challenge.postman_collection.json`
- `.postman/local.postman_environment.json`

Para usarla:

1. Importar la colección y el environment en Postman.
2. Seleccionar el environment `Backend Challenge Local`.
3. Ejecutar los requests en orden desde `Health Check` hasta
   `Confirm Contact Was Deleted`.

El flujo crea datos únicos, reutiliza variables entre requests y elimina el
contacto al final.

## Formato De Errores

La API responde los errores con una estructura consistente:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "path": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

`details` sólo se incluye cuando hay información adicional útil, por ejemplo en
errores de validación.

## Status Codes

```txt
200 OK
201 Created
204 No Content
400 Bad Request
404 Not Found
409 Conflict
500 Internal Server Error
```

## Verificación

Comandos ejecutados durante el desarrollo:

```bash
npm run build
npm run lint
npm run test
```

También se validó manualmente el flujo completo contra PostgreSQL en Docker:

1. crear contacto
2. buscar por email
3. buscar por datos personales
4. buscar por teléfono y tipo
5. actualizar datos personales
6. crear actividad
7. buscar actividades por contacto y tipo
8. eliminar contacto
9. confirmar que el contacto eliminado responde `404`
