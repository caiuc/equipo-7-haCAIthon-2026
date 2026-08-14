# MedStock

Base inicial en Next.js para un sistema distribuido de control de stock de medicamentos entre CESFAM.

## Arranque

```bash
npm run dev
```

## Inicializar datos del MVP

```bash
npm run db:migrate -- --name medstock_mvp
npm run db:seed
```

Con esto queda cargado el escenario demo:

- `CESFAM B` con riesgo de quiebre para `Losartan 50 mg`.
- `CESFAM A` con excedente suficiente para cubrir deficit temporal.

## Flujo de demo recomendado

1. Abre `Dashboard`.
2. Pulsa `Resolver con MedStock`.
3. Revisa ofertas de nodos cercanos.
4. Pulsa `Confirmar transferencia`.
5. Verifica el resultado en `Transferencias` y `Compras`.

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

## Cómo ejecutar el proyecto

- Requisitos: `node` (>=18), `npm`, y Docker si se utiliza contenedores.

- Desarrollo local (rápido):

```bash
npm install
npm run dev
```

La aplicación queda en http://localhost:3000. Asegúrate de configurar `DATABASE_URL` en tu entorno si usas una base externa.

- Usar Docker (app + Postgres):

```bash
npm run docker:up
```

Esto construye la imagen y levanta los servicios definidos en [docker-compose.yml](docker-compose.yml). La app estará en http://localhost:3000 y PostgreSQL queda mapeado en el host en el puerto `5433` (contenedor `5432`).

- Comandos útiles:

```bash
# Levantar en background
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar y eliminar contenedores
docker-compose down

# Ejecutar migraciones/seed (local o contra la DB en Docker):
npm run db:migrate
npm run db:seed
```

Notas:
- El `DATABASE_URL` por defecto usado en `docker-compose.yml` es:

```
postgresql://postgres:postgres@postgres:5432/medstock?schema=public
```

- Si prefieres controlar migrations manualmente en entorno Docker:

```bash
docker-compose exec web npx prisma migrate deploy
docker-compose exec web npm run db:seed
```

- Si quieres un modo de desarrollo con bind-mount y recarga dentro de Docker, puedo añadir un servicio `web:dev` que monte el código y ejecute `next dev`.

