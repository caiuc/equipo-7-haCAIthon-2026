# MedStock

Base inicial en Next.js para un sistema distribuido de control de stock de medicamentos entre CESFAM.

## Arranque

```bash
npm run dev
```

## Base de datos local con Docker

Levanta PostgreSQL con:

```bash
docker compose up -d
```

La conexión usada por Prisma queda en `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medstock?schema=public"
```

Si quieres detener la base:

```bash
docker compose down
```

## Estructura recomendada

La idea es separar el proyecto por responsabilidad, no por tipo de archivo:

```text
app/             Rutas, layouts, UI de página y route handlers.
components/      Componentes de interfaz reutilizables.
features/        Módulos de negocio por dominio.
lib/             Clientes, helpers y utilidades compartidas.
server/          Acciones del servidor e integraciones.
types/           Tipos de dominio compartidos.
docs/            Decisiones de arquitectura y flujo funcional.
```
