# Backend Challenge V3

API REST para el challenge de agenda de contactos, construida con Node.js,
TypeScript, Express y PostgreSQL.

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
npm run format
npm run start
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
