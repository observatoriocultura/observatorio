# Documentacion de la exploracion PAI

Esta carpeta implementa una interfaz de exploracion para el Plan Anual de Investigaciones
(PAI). La experiencia actual permite consultar investigaciones por vigencia, ver una portada
con indicadores agregados y columnas de avance, navegar a un listado buscable y abrir el
detalle de avance de cada investigacion por etapas, notas y productos asociados.

El objetivo funcional es convertir la tabla `gio_investigaciones` de Supabase en una vista web
simple para seguimiento: cuantas investigaciones hay por linea, cual es el avance promedio, que
productos se han generado y en que estado esta cada proyecto dentro del ciclo PAI.

## Entrada de la experiencia

- Ruta principal: `/pai/:year`.
- Redireccion: `/pai` redirige a `/pai/2025`.
- Componente de entrada: `src/views/pai/PaiView.vue`.
- Navegacion interna: pestanas locales `Inicio`, `Investigaciones`, `Notas` y `Avance`,
  sincronizadas con variables GET en la URL.

`PaiView.vue` lee `route.params.year`; si no hay un valor numerico valido usa `2025` como
vigencia por defecto. Cada cambio de vigencia dispara una nueva carga contra Supabase.

## Variables GET de control

La herramienta usa query params para que el estado de navegacion sea compartible y recuperable.

| Variable | Valores esperados | Controla | Default |
| --- | --- | --- | --- |
| `tab` | `portada`, `listado`, `notas`, `avance` | Vista principal activa en `PaiView.vue` | `portada` |
| `seccion` | `list`, `details` | Seccion interna de `PaiList.vue` | `details` si hay `investigacion_id`; si no, `list` |
| `investigacion_id` | ID de `gio_investigaciones` | Investigacion seleccionada para el detalle | `null` |

Ejemplos de URL:

```text
/pai/2025?tab=portada
/pai/2025?tab=listado&seccion=list
/pai/2025?tab=listado&seccion=details&investigacion_id=12
/pai/2026?tab=avance
```

Reglas importantes:

- Si `tab` falta o tiene un valor invalido, se normaliza a `portada`.
- Si `seccion` falta y existe `investigacion_id`, se normaliza a `details`.
- Si `seccion` falta y no existe `investigacion_id`, se normaliza a `list`.
- Los enlaces de tarjetas y columnas de avance deben incluir siempre
  `tab=listado&seccion=details&investigacion_id={id}`.

## Fuente de datos

La informacion se consulta desde Supabase usando el cliente definido en `src/lib/supabase.js`.
Ese cliente depende de estas variables de entorno:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Tablas consultadas:

```text
gio_investigaciones
gio_productos
```

Campos solicitados actualmente en `gio_investigaciones`:

```text
id,
nombre_clave,
titulo,
descripcion,
linea_investigacion,
year_vigencia,
puntaje,
entidad,
dependencia,
avance,
avance_planeacion,
avance_instrumentos,
avance_recoleccion,
avance_documentacion,
avance_finalizacion,
cantidad_productos,
cantidad_hallazgos,
cantidad_radicados,
cantidad_paginas
```

Filtro aplicado a investigaciones:

```text
year_vigencia == String(year)
```

Orden:

```text
year_vigencia desc
puntaje desc
```

Campos solicitados actualmente en `gio_productos`:

```text
id,
investigacion_id,
tipo_producto,
titulo,
es_publico,
url,
url_publica,
url_editable,
created_at,
orden,
radicado_orfeo,
paginas,
descripcion,
observaciones
```

Filtro aplicado a productos:

```text
Sin filtro por vigencia directo.
```

`gio_productos` no usa `year_vigencia` en la consulta actual. La relacion con la vigencia se
resuelve de forma indirecta porque cada producto tiene `investigacion_id`, y el detalle solo
muestra los productos cuyo `investigacion_id` coincide con la investigacion seleccionada.

Orden de productos:

```text
orden asc
```

Acceso publico de productos:

- `gio_productos` debe permitir lectura `select` para los roles `anon` y/o `authenticated`
  mediante RLS.
- Existe una migracion local propuesta en
  `supabase/migrations/20260602000000_gio_productos_public_read.sql` para habilitar RLS y crear
  la policy `gio_productos_public_read`.

Nota para agentes IA: `PaiList.vue` incluye `palabras_clave` dentro del texto buscable, pero
`PaiView.vue` no esta trayendo ese campo desde Supabase. Si se quiere que la busqueda cubra
palabras clave reales, se debe agregar `palabras_clave` al `select`.

Datos complementarios desde Google Sheets:

`PaiView.vue` tambien carga datos auxiliares desde Google Sheets usando `fetchGoogleSheetCsv`.
La configuracion de cada vigencia vive en `src/views/pai/constants.js`.

Campos por vigencia:

```text
file_id
notas_gid
semanas_gid
avances_gid
```

Uso actual:

- `notas_gid`: alimenta `NotasView.vue`.
- `semanas_gid`: alimenta la serie `Avance esperado` de `AvanceSemanal.vue`.
- `avances_gid`: alimenta el resumen por fecha y las series de avance registrado de
  `AvanceSemanal.vue`.

Nota: actualmente la vigencia `2026` tiene `semanas_gid` y `avances_gid`. Si otra vigencia no
tiene esos valores, la pestana `Avance` no tendra datos para graficar.

Columnas esperadas en la hoja de semanas:

```text
fecha_fin
avance_esperado
semana
nombre
```

Columnas esperadas en la hoja de avances:

```text
fecha
linea_investigacion
avance
p
i
r
a
f
```

`AvanceSemanal.vue` normaliza los encabezados de Google Sheets con `toClassName`, por lo que
tolera variantes con espacios, tildes o mayusculas como `Fecha fin`, `Avance esperado` o
`Linea de investigacion`.

## Modelo conceptual

Cada investigacion representa una fila de `gio_investigaciones` y se espera que tenga:

- Identificacion: `id`, `nombre_clave`, `titulo`, `descripcion`.
- Clasificacion: `linea_investigacion`, `entidad`, `dependencia`.
- Vigencia: `year_vigencia`.
- Avance total: `avance`.
- Avances por etapa: `avance_planeacion`, `avance_instrumentos`,
  `avance_recoleccion`, `avance_documentacion`, `avance_finalizacion`.
- Conteos agregados: `cantidad_productos`, `cantidad_hallazgos`, `cantidad_radicados`,
  `cantidad_paginas`.

Los avances se tratan como porcentajes numericos entre 0 y 100. La UI normaliza valores no
numericos a `0`, redondea al entero mas cercano y limita el resultado al rango `0..100`.

Cada producto representa una fila de `gio_productos` y se espera que tenga:

- Relacion: `investigacion_id`, que debe coincidir con `gio_investigaciones.id`.
- Identificacion visible: `tipo_producto`, `titulo`, `descripcion`.
- Enlaces: `url_publica` para el producto publicado y `url_editable` para el editable. El campo
  historico `url` queda como respaldo para `url_publica`.
- Metadatos: `paginas`, `radicado_orfeo`, `observaciones`, `orden`.

El join entre investigaciones y productos no se hace en Supabase. Se hace en
`InvestigacionView.vue` filtrando:

```text
producto.investigacion_id == investigacion.id
```

## Etapas del PAI

Las etapas estan centralizadas en `src/views/pai/constants.js` como `etapasInvestigacion`.
Cada etapa define codigo, nombre, descripcion, etiqueta y peso.

| Codigo | Etapa | Campo de avance | Peso |
| --- | --- | --- | --- |
| `P` | Planeacion | `avance_planeacion` | 20% |
| `I` | Diseno Instrumento | `avance_instrumentos` | 10% |
| `R` | Recoleccion informacion | `avance_recoleccion` | 20% |
| `D` | Analisis y Documentacion | `avance_documentacion` | 30% |
| `F` | Finalizacion y entrega | `avance_finalizacion` | 20% |

Los colores de estas etapas estan en `src/assets/styles/pai.css`:

- `.etapa-planeacion`
- `.etapa-instrumento`
- `.etapa-recoleccion`
- `.etapa-documentacion`
- `.etapa-finalizacion`

Si se cambia una etapa, se deben revisar estos lugares juntos:

- `constants.js`, para el metadato visible y el peso.
- `PaiList.vue`, para el mapeo `campoAvancePorEtapa` y `clasePorEtapa`.
- `InvestigacionView.vue`, para el mismo mapeo en la vista de detalle.
- `pai.css`, para estilos visuales.

## Lineas de investigacion

Las lineas estan centralizadas en `constants.js` como `lineasInvestigacion`.

Lineas actuales:

- Cultura Ciudadana: `cultura-ciudadana`, clase `bg-cultura-ciudadana`.
- Sector Cultura: `sector-cultura`, clase `bg-sector-cultura`.

Los estilos de badges para estas lineas estan en `src/assets/styles/scrd.css`.
La funcion `toClassName` en `src/utils/text.js` normaliza textos a slugs CSS:

```text
"Cultura Ciudadana" -> "cultura-ciudadana"
```

Esta normalizacion permite comparar el texto que llega desde Supabase con las claves de
`lineasInvestigacion` y construir clases CSS con el patron `bg-${slug}`.

## Tipos de producto

Los tipos de producto estan centralizados en `constants.js` como `tiposProducto`.

Cada tipo define:

```text
nombre
bs_icon
```

`InvestigacionView.vue` compara `producto.tipo_producto` con `tipoProducto.nombre` usando
`toClassName`, para tolerar diferencias de tildes, mayusculas y espacios. Si encuentra
coincidencia, usa `bs_icon` para renderizar el icono Bootstrap correspondiente. Si no encuentra
coincidencia, usa `file-earmark` como icono de respaldo.

El contenedor del icono recibe estas clases:

```text
tipo-producto-general
tipo-producto-{toClassName(producto.tipo_producto)}
```

Los estilos base y colores por tipo estan en `src/assets/styles/pai.css`. Por ejemplo:

```text
.tipo-producto-general
.tipo-producto-informe-final
.tipo-producto-presentacion
.tipo-producto-carpeta-archivos
```

Si una clase especifica no existe, se mantiene el estilo base de `.tipo-producto-general`.

## Componentes y responsabilidades

### `PaiView.vue`

Responsable de orquestar la vista completa.

Hace:

- Lee la vigencia desde la ruta.
- Carga investigaciones desde Supabase.
- Carga productos desde Supabase.
- Carga notas, semanas y avances desde Google Sheets segun la vigencia.
- Gestiona estados de carga, error y vacio.
- Filtra investigaciones por `year_vigencia`.
- Controla la pestana activa: `portada` o `listado`, sincronizada con `?tab=`.
- Controla la seccion interna del listado mediante `currentListSection`, sincronizada con
  `?seccion=`.
- Lee `?investigacion_id=` para seleccionar una investigacion y abrir la vista de detalle.
- Entrega `investigacionesFiltradas`, `notas`, `productos`, `semanas` y `avances` a los
  componentes hijos.

Estados principales:

- `investigaciones`: arreglo crudo cargado desde Supabase.
- `productos`: arreglo crudo cargado desde Supabase desde `gio_productos`.
- `notas`: arreglo cargado desde Google Sheets segun la vigencia.
- `semanas`: arreglo cargado desde Google Sheets para el avance esperado.
- `avances`: arreglo cargado desde Google Sheets para el avance registrado.
- `loading`: indicador de carga.
- `errorMessage`: mensaje visible si falla la consulta o si no hay Supabase configurado.
- `activeView`: pestana activa.
- `currentListSection`: seccion interna de `PaiList.vue`; puede ser `list` o `details`.
- `selectedInvestigacionId`: ID de la investigacion seleccionada desde la URL.
- `year`: vigencia derivada de `route.params.year`.

Nota tecnica: `cargarInvestigaciones` y `cargarProductos` se disparan con watchers sobre `year`.
Ambas funciones usan el mismo estado `loading` y `errorMessage`, por lo que un error de productos
puede afectar el mensaje global de la vista. Si los productos se vuelven una consulta auxiliar
no critica, conviene separar su estado de carga/error.

### `PaiPortada.vue`

Responsable de la vista resumen.

Recibe:

```text
investigaciones: Array
```

Calcula:

- Total general de investigaciones.
- Total de investigaciones por linea.
- Avance promedio general.
- Avance promedio por linea.

Ademas renderiza `ColumnasAvance.vue` encima de los KPIs para mostrar una lectura rapida del
avance total de cada investigacion.

El avance promedio se calcula con valores numericos finitos de `investigacion.avance`. Si no
hay avances validos, el promedio mostrado es `0`.

La portada no consulta datos directamente; depende por completo de las props entregadas por
`PaiView.vue`.

### `ColumnasAvance.vue`

Responsable de la visualizacion reutilizable de columnas verticales de avance.

Recibe:

```text
investigaciones: Array
```

Hace:

- Renderiza una columna por investigacion.
- Usa una altura base de `5em`, donde `100%` equivale a la columna completa.
- Calcula la altura visible con `investigacion.avance`, normalizado al rango `0..100`.
- Muestra el `id` de la investigacion debajo de cada columna.
- Usa tooltips de Bootstrap con `investigacion.nombre_clave` sobre la columna y el ID.
- Envuelve cada columna en un `RouterLink` que apunta al detalle:

```text
?tab=listado&seccion=details&investigacion_id={investigacion.id}
```

El componente inicializa y destruye instancias de `Tooltip` de Bootstrap en su ciclo de vida
para que funcionen con contenido renderizado por Vue. No emite eventos de seleccion; la
navegacion se controla por URL.

### `PaiList.vue`

Responsable del listado exploratorio.

Recibe:

```text
investigaciones: Array
notas: Array
productos: Array
currentSection?: "list" | "details" | null
selectedInvestigacionId?: Number | String | null
```

Emite:

```text
update:currentSection
```

Hace:

- Muestra un campo de busqueda con `ListSearchInput`.
- Filtra investigaciones por texto normalizado, sin distinguir mayusculas ni acentos.
- Presenta tarjetas de investigacion en una grilla responsiva.
- Muestra indicadores compactos de avance por etapa.
- Presenta cada tarjeta como `RouterLink` hacia
  `?tab=listado&seccion=details&investigacion_id={id}`.
- Lee `route.query.seccion` para decidir si renderiza el listado o el detalle.
- Usa `selectedInvestigacionId` o `route.query.investigacion_id` para encontrar la investigacion
  seleccionada.
- Reenvia `notas` y `productos` a `InvestigacionView.vue`.
- Permite seleccionar una investigacion y pasar a la vista de detalle.
- Vuelve automaticamente a `list` si ya no existe la investigacion seleccionada.

Campos incluidos en la busqueda:

- `nombre_clave`
- `titulo`
- `descripcion`
- `linea_investigacion`
- `palabras_clave`

La seccion activa puede manejarse por URL, de forma externa o de forma interna. El orden de
prioridad es:

1. `route.query.seccion`, si es `list` o `details`.
2. `currentSection`, si llega como prop.
3. `localCurrentSection`, como estado local de respaldo.

### `InvestigacionView.vue`

Responsable del detalle de una investigacion seleccionada.

Recibe:

```text
investigacion: Object | null
notas: Array
productos: Array
```

Emite:

```text
back
```

Hace:

- Muestra linea, nombre clave, titulo, descripcion y avance total.
- Renderiza cada etapa del PAI con descripcion, porcentaje, barra de progreso y peso.
- Lista notas asociadas a la investigacion.
- Lista productos asociados a la investigacion.
- Usa `etapasInvestigacion` como fuente de verdad para el orden y la metadata de etapas.
- Usa `tiposProducto` para resolver el icono de cada producto.
- Expone un boton para volver al listado.

Productos en el detalle:

- Se filtran con `producto.investigacion_id === investigacion.id`.
- Se muestran en la tercera columna del detalle.
- La estructura visual es: icono a la izquierda, titulo, descripcion, metadatos
  `paginas | tipo | radicado`, enlaces y observaciones.
- El icono es un enlace a `url_publica` cuando existe y abre en una pestaña nueva.
- El enlace `Abrir` usa `url_publica`, con fallback a `url`.
- El enlace `Abrir editable` usa `url_editable`.
- `observaciones` se muestra como texto secundario (`small.text-muted`).

### `AvanceSemanal.vue`

Responsable de la vista de seguimiento semanal.

Recibe:

```text
semanas: Array
avances: Array
```

Hace:

- Renderiza una grafica de Highcharts con linea temporal de avance.
- Construye la serie `Avance esperado` desde `semanas`.
- Construye una serie de avance registrado por cada `linea_investigacion` presente en `avances`.
- Calcula cada punto registrado como promedio de `avance` por combinacion de fecha y linea de
  investigacion.
- Muestra en la leyenda solo el nombre de cada linea, por ejemplo `Cultura Ciudadana` y
  `Sector Cultura`.
- Desactiva las etiquetas de valor de la serie `Avance esperado`.
- Mantiene visibles las etiquetas de valor de las series registradas.
- Segmenta el eje X por meses usando `plotBands` con fondos alternados y bordes verticales.
- Formatea las etiquetas del eje X como `DD/MMM`, por ejemplo `16/ago`.
- Muestra una tabla `Resumen por fecha` con el promedio de `avance`, `p`, `i`, `r`, `a` y `f`.
- Muestra `No hay datos de avance para graficar.` si no hay puntos validos para ninguna serie.

Campos usados desde `semanas`:

- `fecha_fin`: fecha del punto esperado.
- `avance_esperado`: porcentaje esperado.
- `semana` o `nombre`: etiqueta secundaria del punto.

Campos usados desde `avances`:

- `fecha`: fecha del registro.
- `linea_investigacion`: linea que define la serie registrada.
- `avance`: porcentaje usado para la grafica.
- `p`, `i`, `r`, `a`, `f`: porcentajes usados en el resumen por fecha.

Normalizacion de columnas:

- `normalizeColumnName` convierte encabezados a formato comparable con `toClassName`.
- `getFieldValue` permite leer columnas aunque lleguen con espacios, tildes o mayusculas.
- Esto evita depender estrictamente de encabezados como `fecha_fin` o `linea_investigacion`.

Series actuales:

```text
Avance esperado
Cultura Ciudadana
Sector Cultura
```

Los colores de las series registradas se resuelven con `lineaSeriesColors` usando las claves de
`lineasInvestigacion`. Si aparece una linea no declarada, se usa un color de respaldo.

## Flujo de interaccion

1. El usuario entra a `/pai/:year`.
2. `PaiView.vue` obtiene la vigencia desde la ruta.
3. `PaiView.vue` normaliza `tab`, `seccion` e `investigacion_id` desde la URL.
4. Se consulta `gio_investigaciones` en Supabase filtrando por `year_vigencia`.
5. Se consulta `gio_productos` en Supabase y se ordena por `orden`.
6. Mientras carga, se muestra `Cargando investigaciones...`.
7. Si hay error, se muestra un mensaje de error.
8. Si no hay registros, se muestra un mensaje de estado vacio.
9. Si hay registros y `tab=portada`, `PaiPortada.vue` muestra columnas de avance y KPIs.
10. Al hacer clic en una columna de avance, `ColumnasAvance.vue` navega a
   `?tab=listado&seccion=details&investigacion_id={id}`.
11. Si `tab=listado&seccion=list`, `PaiList.vue` muestra el buscador y las tarjetas.
12. Al hacer clic en una tarjeta, `PaiList.vue` navega a
    `?tab=listado&seccion=details&investigacion_id={id}`.
13. Si `seccion=details`, `PaiList.vue` muestra `InvestigacionView.vue` con la investigacion
    seleccionada.
14. `InvestigacionView.vue` filtra los productos por `investigacion_id` y los muestra en la
    tercera columna del detalle.
15. Si `tab=avance`, `PaiView.vue` muestra `AvanceSemanal.vue` con `semanas` y `avances`
    cargados desde Google Sheets.

## Comportamiento visual y accesibilidad

La UI usa Bootstrap y clases locales.

Patrones aplicados:

- Pestanas con `nav nav-tabs`.
- Tarjetas de investigacion como `RouterLink`, para permitir enlaces compartibles.
- Columnas de avance como `RouterLink`, con foco visible y tooltip.
- Barras de progreso con `role="progressbar"`, `aria-valuenow`, `aria-valuemin` y
  `aria-valuemax`.
- Texto `visually-hidden` para que los porcentajes compactos de avance sean legibles por
  tecnologias asistivas.
- Estados de foco visibles en tarjetas, boton de volver y campo de busqueda.
- Tooltips de Bootstrap en columnas e IDs para exponer `nombre_clave`.
- Iconos de productos con foco visible cuando son enlace.
- Enlaces de productos con `target="_blank"` y `rel="noopener noreferrer"`.
- Los iconos de productos usan `aria-label` cuando son enlace; si no tienen URL publica, se
  renderizan como `span` decorativo con `aria-hidden`.

La grilla del listado cambia por breakpoint:

- 1 columna en movil.
- 2 columnas desde `576px`.
- 3 columnas desde `768px`.
- 6 columnas desde `1200px`.

## Contratos importantes para cambios futuros

- `linea_investigacion` debe ser consistente con las lineas declaradas en `constants.js`, o
  al menos normalizable con `toClassName`.
- Los campos de avance deben poder convertirse a numero.
- Las hojas de `semanas` y `avances` pueden usar encabezados con espacios, tildes o mayusculas,
  pero deben conservar el significado de los campos esperados.
- `year_vigencia` se compara como numero en el filtro local, pero se envia como string al filtro
  de Supabase.
- `id` se usa como clave de render y como identificador de seleccion.
- `gio_productos.investigacion_id` debe apuntar a `gio_investigaciones.id`.
- `tipo_producto` debe ser consistente con `tiposProducto.nombre` si se quiere resolver icono y
  color especifico. Si no coincide, se usa icono y color base.
- `url_publica` y `url_editable` son los campos preferidos para enlaces de producto. `url` se
  mantiene como respaldo para el enlace publico.
- `gio_productos` debe tener policy de lectura publica si la app usa publishable key desde el
  frontend.
- Los enlaces al detalle deben conservar `tab=listado`, `seccion=details` e
  `investigacion_id={id}` para que la URL reconstruya el estado.
- `ColumnasAvance.vue` es reutilizable: cualquier vista que le pase `investigaciones` puede
  obtener la misma navegacion hacia detalle.
- `AvanceSemanal.vue` necesita `semanas_gid` y/o `avances_gid` configurados para la vigencia si
  se quiere mostrar la pestana `Avance`.
- `PaiPortada`, `PaiList` e `InvestigacionView` son componentes presentacionales respecto a
  datos remotos: no deben consultar Supabase directamente salvo que se decida cambiar la
  arquitectura.

## Guia para agentes IA de desarrollo web

Cuando extiendas esta funcionalidad:

1. Lee primero `PaiView.vue`, porque ahi esta el contrato de datos remoto.
2. Revisa `constants.js` antes de duplicar nombres de etapas, lineas o tipos de producto.
3. Si agregas campos visibles, agregalos tambien al `select` de Supabase en `PaiView.vue`.
4. Si agregas nuevas lineas, actualiza `lineasInvestigacion` y los estilos `.bg-*`.
   Si esa linea aparece en `AvanceSemanal.vue`, considera agregar un color en
   `lineaSeriesColors`.
5. Si agregas nuevos tipos de producto, actualiza `tiposProducto` y opcionalmente agrega una
   clase `.tipo-producto-{slug}` en `pai.css`.
6. Si agregas nuevas etapas, actualiza el mapeo de campos en `PaiList.vue` e
   `InvestigacionView.vue`.
7. Conserva la normalizacion de texto para busqueda, iconos y clases CSS; evita comparar textos con
   acentos o mayusculas directamente.
8. Mantiene los componentes hijos sin dependencia directa de Supabase mientras la vista siga
   organizada con `PaiView.vue` como contenedor.
9. Si cambias la navegacion de detalle, revisa la relacion entre `tab`, `seccion`,
   `investigacion_id`, `activeView`, `currentListSection` y `currentInvestigacionId`.
10. Si reutilizas `ColumnasAvance.vue` en otra seccion, confirma que esa seccion pueda resolver
   la ruta con `tab=listado&seccion=details&investigacion_id={id}` o ajusta el componente para
   aceptar una funcion/prop de destino.
11. Evita que watchers iniciales pisen `seccion=details`: si hay `investigacion_id`, el estado
    de detalle debe tener prioridad sobre defaults locales como `list`.
12. Si `gio_productos` devuelve cero filas desde la app pero hay registros en Supabase, revisa
    primero las policies RLS de lectura para `anon`/`authenticated`.
13. Si `AvanceSemanal.vue` muestra `No hay datos de avance para graficar.`, revisa que la
    vigencia tenga `semanas_gid` o `avances_gid`, y que las fechas y porcentajes de la hoja sean
    parseables.

## Posibles mejoras detectadas

- Agregar `palabras_clave` al `select` si la busqueda debe cubrir ese campo.
- Extraer `campoAvancePorEtapa`, `clasePorEtapa`, `getAvanceValue` y `formatAvance` a un helper
  compartido para evitar duplicacion entre listado, detalle y columnas de avance.
- Evaluar si `avance` debe calcularse desde los pesos de etapas o si debe seguir viniendo como
  campo persistido desde Supabase.
- Considerar migrar de query params a rutas nombradas si se necesita una jerarquia de URLs mas
  explicita para el detalle.
- Agregar pruebas unitarias ligeras para normalizacion de busqueda, calculo de promedios y
  normalizacion de porcentajes.
- Separar `loading` y `errorMessage` de investigaciones y productos para que un error auxiliar de
  productos no oculte la vista principal de investigaciones.
- Evaluar filtrar productos en Supabase con un join o RPC si el volumen de `gio_productos` crece.
- Agregar pruebas ligeras para el join local `investigacion.id`/`producto.investigacion_id` y la
  resolucion de iconos por `tiposProducto`.
