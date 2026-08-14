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
- `CESFAM A` con excedente suficiente para cubrir déficit temporal.

## Flujo de demo recomendado

1. Abre `Dashboard`.
2. Selecciona un nodo de ingreso, por ejemplo `cesfam_b`, con contraseña `password`.
3. Pulsa `Preguntar a mi red`.
4. Revisa las respuestas automáticas de los nodos asociados.
5. Entra como `cesfam_a`, `cosam_san_joaquin` o `cosam_macul` para ver la bandeja automatica del nodo proveedor.
6. Pulsa `Confirmar transferencia` desde el nodo solicitante.
7. Verifica el resultado en `Transferencias` y `Compras`.

## Credenciales del prototipo

Todos los usuarios usan la contraseña `password`.

- `cesfam_a`
- `cesfam_b`
- `cesfam_c`
- `cosam_san_joaquin`
- `cosam_la_florida`
- `cosam_macul`
- `sapu_san_miguel`
- `hospital_barros_luco_trudeau`
- `cesfam_la_florida`
- `cesfam_los_castanos`
- `cesfam_bellavista`
- `cesfam_maffioletti`
- `cesfam_felix_de_amesti`
- `cesfam_santa_julia`
- `cesfam_padre_alberto_hurtado`
- `cesfam_padre_manuel_villaseca`
- `cesfam_bernardo_leighton`
- `cesfam_padre_esteban_gumucio`
- `cosam_la_pintana`
- `cosam_puente_alto`
- `cosam_nunoa`
- `cosam_santiago`
- `sapu_la_florida`
- `sar_los_castanos`
- `sapu_bernardo_leighton`
- `sapu_padre_esteban_gumucio`
- `hospital_sotero_del_rio`
- `hospital_la_florida`
- `hospital_el_pino`
- `hospital_san_jose`
- `hospital_felix_bulnes`
- `hospital_el_carmen_de_maipu`

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

Esto construye la imagen y levanta los servicios definidos en [docker-compose.yml](docker-compose.yml). La app estará en http://localhost:3000 y PostgreSQL queda mapeado en el host en el puerto `5432` (contenedor `5432`).

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

