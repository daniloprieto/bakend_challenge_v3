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

PostgreSQL se agregará en la siguiente etapa con Docker Compose.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

```bash
npm run build
npm run lint
npm run format
npm run start
```

## Health Check

```bash
curl http://localhost:3000/api/health
```
