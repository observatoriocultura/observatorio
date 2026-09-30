# Módulo de gestión de archivos

Última actualización: 27 de septiembre de 2026.

## 1. Descripción general

Este módulo permite a usuarios con rol `admin` o `editor`:

- Consultar los archivos registrados en Supabase.
- Buscar, paginar y previsualizar archivos.
- Subir archivos al bucket `media`, dentro de la carpeta lógica `uploads/`.
- Generar miniaturas para imágenes compatibles.
- Editar los metadatos de un archivo.
- Eliminar uno o varios archivos, tanto de Storage como de la tabla `public.files`.

La solución usa dos recursos diferentes de Supabase:

1. **Storage** guarda el contenido binario del archivo.
2. **Postgres** guarda sus metadatos y relaciones en `public.files`.

La autorización real se aplica en Supabase mediante permisos SQL y políticas RLS. Las validaciones de rol de Vue mejoran la experiencia de usuario, pero no reemplazan las reglas de la base de datos.

## 2. Archivos del módulo

| Archivo | Responsabilidad |
| --- | --- |
| [`FilesListView.vue`](./FilesListView.vue) | Lista, búsqueda, paginación, selección y eliminación de archivos. |
| [`FilesCreateView.vue`](./FilesCreateView.vue) | Selección, previsualización, carga y registro de archivos. |
| [`FilesEditView.vue`](./FilesEditView.vue) | Consulta y edición de metadatos del archivo. |

Dependencias principales:

- Cliente Supabase: [`../../lib/supabase.js`](../../lib/supabase.js)
- Rutas: [`../../router/index.js`](../../router/index.js)
- Menú lateral: [`../../components/navigation/Sidebar.vue`](../../components/navigation/Sidebar.vue)
- Buscador reutilizable: [`../../components/ListSearchInput.vue`](../../components/ListSearchInput.vue)
- Confirmación de eliminación: [`../../components/ModalDelete.vue`](../../components/ModalDelete.vue)

## 3. Acceso, rutas y menú

Las rutas están protegidas por autenticación y rol:

| Ruta | Nombre | Vista | Roles permitidos |
| --- | --- | --- | --- |
| `/files` | `files` | `FilesListView` | `admin`, `editor` |
| `/files/new` | `file-create` | `FilesCreateView` | `admin`, `editor` |
| `/files/edit/:id` | `file-edit` | `FilesEditView` | `admin`, `editor` |

El guard del router realiza estas comprobaciones:

1. Si la ruta requiere autenticación, verifica la sesión.
2. Si no hay sesión, redirige a `/login`.
3. Si la ruta declara `allowedRoles`, consulta el rol en `public.profiles`.
4. Si el usuario no tiene un rol autorizado, redirige a `/profile`.

El Sidebar muestra **Gestión de archivos** únicamente a usuarios `admin` o `editor`.

> Las rutas y el menú son controles de interfaz. Aunque alguien intente llamar directamente a la API, Supabase vuelve a validar los permisos mediante RLS.

## 4. Proyecto Supabase

El proyecto utilizado actualmente es:

| Propiedad | Valor |
| --- | --- |
| Nombre | `RepositorioDOGCC` |
| Project ref | `vkbvmifeinhobmdqqvgo` |
| Región | `us-east-1` |
| Bucket | `media` |
| Prefijo de carga | `uploads/` |

La aplicación obtiene la URL y la llave publicable desde variables de entorno. Nunca debe incluirse la llave `service_role` en el frontend ni en este documento.

## 5. Tabla `public.files`

La tabla contiene los metadatos de los objetos almacenados en Storage.

### 5.1 Columnas actuales

| Columna | Tipo | Nulo | Valor predeterminado | Uso |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Identificador principal. |
| `bucket_id` | `text` | No | `'media'` | Bucket donde está el objeto. |
| `post_id` | `uuid` | Sí | — | Artículo relacionado. |
| `user_id` | `uuid` | Sí | — | Perfil relacionado. |
| `file_name` | `text` | No | — | Nombre original del archivo. |
| `storage_path` | `text` | No | — | Ruta del objeto dentro del bucket. |
| `extension` | `varchar` | Sí | — | Extensión del archivo. |
| `mime_type` | `varchar` | Sí | — | Tipo MIME detectado. |
| `size_bytes` | `bigint` | Sí | `0` | Tamaño en bytes. |
| `checksum` | `text` | Sí | — | Huella del archivo, disponible para control de duplicados. |
| `is_image` | `boolean` | Sí | `false` | Indica si se trata como imagen. |
| `width` | `integer` | Sí | — | Ancho de la imagen. |
| `height` | `integer` | Sí | — | Alto de la imagen. |
| `blur_hash` | `text` | Sí | — | Representación visual de baja resolución, aún no usada por las vistas. |
| `title` | `text` | Sí | — | Título editable. |
| `description` | `text` | Sí | — | Descripción editable. |
| `alt_text` | `text` | Sí | — | Texto alternativo para accesibilidad. |
| `keywords` | `text[]` | Sí | `'{}'` | Palabras clave. |
| `is_main` | `boolean` | Sí | `false` | Marca de archivo principal. |
| `position` | `integer` | Sí | `0` | Orden disponible para futuras relaciones. |
| `status` | `text` | Sí | `'active'` | Estado lógico del registro. |
| `meta` | `jsonb` | Sí | `'{}'` | Metadatos adicionales. |
| `creator_id` | `uuid` | No | — | Usuario que creó el registro. |
| `updater_id` | `uuid` | Sí | — | Último usuario que lo modificó. |
| `created_at` | `timestamptz` | Sí | `now()` | Fecha de creación. |
| `updated_at` | `timestamptz` | Sí | `now()` | Fecha de modificación. |
| `thumbnail_path` | `text` | Sí | — | Ruta de la miniatura generada. |

### 5.2 Restricciones y relaciones

- Clave primaria: `files_pkey (id)`.
- `post_id` referencia `public.posts(id)` con eliminación en cascada.
- `user_id` referencia `public.profiles(id)` con eliminación en cascada.
- `creator_id` referencia `auth.users(id)`.
- `updater_id` referencia `auth.users(id)`.

Índices adicionales:

- `idx_files_checksum` sobre `checksum`.
- `idx_files_post_relation` sobre `post_id`.
- `idx_files_user_relation` sobre `user_id`.

Actualmente no hay un trigger que actualice automáticamente `updated_at`. La vista de edición escribe este campo explícitamente en cada guardado; otros clientes que actualicen la tabla deberán hacer lo mismo.

## 6. Permisos SQL de la tabla

Los permisos SQL determinan qué operaciones puede intentar cada rol de la API. Después, RLS decide qué filas cumplen las condiciones.

Configuración aplicada:

| Rol | `SELECT` | `INSERT` | `UPDATE` | `DELETE` |
| --- | --- | --- | --- | --- |
| `anon` | No | No | No | No |
| `authenticated` | Sí | Sí | Sí | Sí |
| `service_role` | Privilegios administrativos | Privilegios administrativos | Privilegios administrativos | Privilegios administrativos |

SQL equivalente para los roles públicos de la aplicación:

```sql
revoke all on table public.files from anon;

revoke all on table public.files from authenticated;
grant select, insert, update, delete
on table public.files
to authenticated;
```

Conceder una operación a `authenticated` no permite modificar todas las filas: cada solicitud aún debe superar las políticas RLS descritas a continuación.

## 7. Función `private.is_file_manager()`

Esta función centraliza la regla de negocio que define quién puede administrar archivos. Devuelve `true` cuando el usuario autenticado tiene rol `admin` o `editor` en `public.profiles`.

```sql
create or replace function private.is_file_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role::text in ('admin', 'editor')
  );
$function$;

revoke all on function private.is_file_manager() from public;
grant execute on function private.is_file_manager()
to authenticated, service_role;
```

Aspectos de seguridad:

- Está en el esquema `private`, fuera de la API pública.
- Usa `security definer` para poder consultar el perfil de forma controlada.
- Define un `search_path` vacío y referencia las tablas por su esquema completo.
- No está disponible para `anon`.

## 8. RLS de `public.files`

RLS está habilitado en la tabla. Las cuatro políticas actuales son:

| Política | Operación | Rol API | Regla |
| --- | --- | --- | --- |
| `files_select_managers` | `SELECT` | `authenticated` | El usuario debe ser administrador de archivos. |
| `files_insert_managers` | `INSERT` | `authenticated` | Debe ser administrador y crear el registro a su nombre. |
| `files_update_managers` | `UPDATE` | `authenticated` | Debe ser administrador antes y después del cambio. |
| `files_delete_managers` | `DELETE` | `authenticated` | Debe ser administrador de archivos. |

Definición equivalente:

```sql
alter table public.files enable row level security;

create policy files_select_managers
on public.files
for select
to authenticated
using ((select private.is_file_manager()));

create policy files_insert_managers
on public.files
for insert
to authenticated
with check (
  (select private.is_file_manager())
  and creator_id = (select auth.uid())
  and (
    updater_id is null
    or updater_id = (select auth.uid())
  )
);

create policy files_update_managers
on public.files
for update
to authenticated
using ((select private.is_file_manager()))
with check ((select private.is_file_manager()));

create policy files_delete_managers
on public.files
for delete
to authenticated
using ((select private.is_file_manager()));
```

## 9. Supabase Storage

### 9.1 Bucket `media`

Configuración actual:

| Propiedad | Valor |
| --- | --- |
| Bucket | `media` |
| Público | Sí |
| Tamaño máximo | 10 MiB (`10.485.760` bytes) |
| Carpeta lógica usada | `uploads/` |

Tipos MIME permitidos:

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`
- `video/mp4`
- `video/webm`
- `video/quicktime`
- `application/pdf`

`uploads/` no es otro bucket: es el primer segmento de la ruta de los objetos dentro de `media`.

El módulo genera rutas con esta convención:

```text
uploads/YYYY/MM/<uuid>.<extension>
```

Para imágenes JPEG, PNG o WebP también puede generar:

```text
uploads/YYYY/MM/<uuid>-thumb.webp
```

La miniatura usa WebP, una dimensión máxima de 320 px y calidad aproximada de `0.76`.

### 9.2 Bucket público

Al ser público, cualquier persona que conozca la URL puede visualizar o descargar un objeto. Esto permite mostrar una imagen en un artículo público sin iniciar sesión:

```js
const { data } = supabase.storage
  .from('media')
  .getPublicUrl('uploads/2026/09/archivo.webp')

const publicUrl = data.publicUrl
```

Que el bucket sea público solo afecta la lectura del objeto. No autoriza cargas, reemplazos ni eliminaciones.

Además, `anon` no tiene acceso a `public.files`. Por ello, una página pública debe conocer previamente `storage_path` o la URL pública, o disponer en el futuro de una consulta/vista pública controlada que exponga únicamente los metadatos necesarios.

### 9.3 Políticas de Storage

Supabase Storage controla los objetos mediante RLS sobre `storage.objects`.

| Política | Operación | Condiciones |
| --- | --- | --- |
| `media_upload_file_managers` | `INSERT` | Usuario `admin`/`editor`, bucket `media` y ruta bajo `uploads/`. |
| `media_delete_file_managers` | `DELETE` | Usuario `admin`/`editor`, bucket `media` y ruta bajo `uploads/`. |

Definición equivalente:

```sql
create policy media_upload_file_managers
on storage.objects
for insert
to authenticated
with check (
  (select private.is_file_manager())
  and bucket_id = 'media'
  and (storage.foldername(name))[1] = 'uploads'
);

create policy media_delete_file_managers
on storage.objects
for delete
to authenticated
using (
  (select private.is_file_manager())
  and bucket_id = 'media'
  and (storage.foldername(name))[1] = 'uploads'
);
```

No hay políticas de `UPDATE` ni `SELECT` autenticado para administrar objetos. El flujo actual crea rutas únicas y elimina objetos, por lo que no las necesita. Si se implementa reemplazo, movimiento o `upsert`, deberán revisarse las operaciones adicionales requeridas por Storage.

## 10. Funcionamiento de las vistas Vue

### 10.1 Listado: `FilesListView.vue`

El listado:

- Consulta `public.files` e intenta incluir el artículo relacionado mediante `posts(id, title)`.
- Construye las previsualizaciones con URLs públicas del bucket.
- Usa páginas de 20 elementos.
- Filtra por texto en el cliente.
- Permite seleccionar todos los elementos visibles.
- Permite eliminar uno o varios registros.
- Distingue relaciones con artículos, perfiles o archivos sin relación.

El diálogo `ModalDelete` está dentro del elemento raíz `<main>`. Esta estructura de raíz única es necesaria para que el componente funcione correctamente dentro de la transición con `mode="out-in"` usada por la aplicación.

### 10.2 Creación: `FilesCreateView.vue`

Flujo de creación:

1. Comprueba sesión y rol `admin`/`editor`.
2. Recibe un archivo por selector o arrastrar y soltar.
3. Completa inicialmente el título a partir del nombre.
4. Si es una imagen compatible, obtiene dimensiones y muestra una previsualización.
5. Genera una ruta única bajo `uploads/YYYY/MM/`.
6. Sube el archivo original a Storage.
7. Genera y sube una miniatura WebP cuando aplica.
8. Inserta los metadatos en `public.files` con `creator_id` y `updater_id` iguales al usuario actual.
9. Redirige al listado.

Si falla la inserción en Postgres después de subir el objeto, la vista intenta eliminar el archivo original y la miniatura para revertir la carga.

El formulario registra actualmente:

- Datos físicos: nombre, extensión, MIME, tamaño, dimensiones y rutas.
- Metadatos: título, descripción, texto alternativo y palabras clave.
- Control: `is_main`, `creator_id` y `updater_id`.

### 10.3 Edición: `FilesEditView.vue`

La vista de edición:

- Verifica sesión y rol.
- Consulta el archivo y el título del artículo relacionado.
- Muestra una previsualización pública sobre un patrón que permite reconocer transparencias.
- Permite modificar título, descripción, texto alternativo, palabras clave y la marca `is_main`.
- Registra al usuario actual en `updater_id` y la fecha en `updated_at`.
- Detecta modificaciones, evita actualizaciones redundantes y advierte antes de descartar cambios sin guardar.
- Mantiene al usuario en la vista después de guardar y confirma el resultado mediante el sistema global de toast.
- Usa el color institucional `#654096` en acciones, controles y estados de foco.
- No reemplaza el objeto binario almacenado.

## 11. Flujos de datos

### Carga

```text
Usuario admin/editor
  → FilesCreateView
  → INSERT en storage.objects (bucket media/uploads)
  → INSERT en public.files
  → FilesListView
```

### Consulta

```text
Usuario admin/editor
  → SELECT public.files
  → URL pública de Storage
  → Previsualización o descarga
```

### Eliminación

```text
Usuario admin/editor
  → DELETE public.files
  → DELETE objetos originales y miniaturas en Storage
```

La base de datos y Storage no comparten una transacción. En el listado actual se eliminan primero los registros y después los objetos. Si falla Storage, el sistema muestra una advertencia, pero pueden quedar objetos huérfanos.

## 12. Cómo verificar la configuración

### 12.1 Desde el Dashboard de Supabase

- Tabla y columnas: **Table Editor → files**.
- RLS de la tabla: **Table Editor → files → Policies**.
- Función: **Database → Functions**, buscando `is_file_manager` en el esquema `private`.
- Bucket: **Storage → media → Configuration**.
- Políticas de Storage: **Storage → Policies**, sobre `storage.objects`.

La ubicación exacta de las opciones puede cambiar ligeramente con las actualizaciones del Dashboard.

### 12.2 Consultas SQL de verificación

Políticas de la tabla:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'files'
order by policyname;
```

Políticas de Storage:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'media_%'
order by policyname;
```

Permisos SQL:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'files'
order by grantee, privilege_type;
```

Configuración del bucket:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'media';
```

## 13. Lista de pruebas recomendadas

### Usuario `admin` o `editor`

- Puede abrir `/files`, `/files/new` y `/files/edit/:id`.
- Puede subir cada tipo MIME permitido hasta 10 MiB.
- No puede subir un tipo bloqueado ni exceder el límite del bucket.
- Puede editar metadatos.
- Puede eliminar el original y su miniatura.
- No puede usar estas políticas para escribir fuera de `media/uploads/`.

### Usuario `subscriber`

- No ve el elemento del menú.
- El router lo redirige al perfil si intenta abrir la ruta.
- La API rechaza `SELECT`, `INSERT`, `UPDATE` y `DELETE` aunque intente llamarla directamente.

### Usuario anónimo

- No puede consultar `public.files`.
- No puede cargar ni eliminar objetos.
- Sí puede abrir la URL conocida de un archivo porque el bucket es público.

## 14. Mejoras pendientes identificadas

1. **Fecha de actualización centralizada:** considerar un trigger para garantizar `updated_at` incluso cuando otro cliente actualice la tabla sin enviar el campo.
2. **Validación temprana:** validar en el navegador el tamaño máximo y los MIME permitidos para mostrar errores antes de iniciar la carga.
3. **Paginación en servidor:** el listado descarga actualmente todos los registros y pagina en el cliente; conviene usar `range()` cuando aumente el volumen.
4. **Eliminación resiliente:** revisar el orden de eliminación o implementar un proceso de limpieza para evitar objetos huérfanos.
5. **Integración con artículos:** el listado genera enlaces a `/posts/preview/:id`, pero esa ruta no está registrada actualmente. Además, `public.posts` debe tener una política de lectura compatible para que la relación embebida funcione.
6. **Metadatos públicos:** si un sitio público necesita descubrir archivos desde la base de datos, exponer una vista o RPC limitada en lugar de conceder acceso general a `public.files`.
7. **Reemplazo de archivos:** si se agrega esta función, definir cuidadosamente las políticas `SELECT`/`UPDATE` de Storage necesarias para `upsert`, sin ampliar el acceso a otros prefijos.
8. **Archivo principal:** definir su alcance de negocio y aplicar una restricción o función transaccional si debe existir un único `is_main` por artículo, perfil u otra relación.

## 15. Referencias oficiales

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Seguridad de la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Fundamentos de buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Control de acceso en Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Eliminación de objetos](https://supabase.com/docs/guides/storage/management/delete-objects)
