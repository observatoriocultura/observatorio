# Documentacion de la exploracion PAI

Esta carpeta implementa una interfaz de exploracion para el Plan Anual de Investigaciones
(PAI). La experiencia actual permite consultar investigaciones por vigencia, ver una portada
con indicadores agregados y columnas de avance, navegar a un listado buscable y abrir el
detalle de avance de cada investigacion por etapas.

El objetivo funcional es convertir la tabla `gio_investigaciones` de Supabase en una vista web
simple para seguimiento: cuantas investigaciones hay por linea, cual es el avance promedio y en
que estado esta cada proyecto dentro del ciclo PAI.

## Entrada de la experiencia

- Ruta principal: `/pai/:year`.
- Redireccion: `/pai` redirige a `/pai/2025`.
- Componente de entrada: `src/views/pai/PaiView.vue`.
- Navegacion interna: pestanas locales `Portada` e `Investigaciones`, sincronizadas con
  variables GET en la URL.

`PaiView.vue` lee `route.params.year`; si no hay un valor numerico valido usa `2025` como
vigencia por defecto. Cada cambio de vigencia dispara una nueva carga contra Supabase.

## Variables GET de control

La herramienta usa query params para que el estado de navegacion sea compartible y recuperable.

| Variable | Valores esperados | Controla | Default |
| --- | --- | --- | --- |
| `tab` | `portada`, `listado` | Vista principal activa en `PaiView.vue` | `portada` |
| `seccion` | `list`, `details` | Seccion interna de `PaiList.vue` | `details` si hay `investigacion_id`; si no, `list` |
| `investigacion_id` | ID de `gio_investigaciones` | Investigacion seleccionada para el detalle | `null` |

Ejemplos de URL:

```text
/pai/2025?tab=portada
/pai/2025?tab=listado&seccion=list
/pai/2025?tab=listado&seccion=details&investigacion_id=12
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

Tabla consultada:

```text
gio_investigaciones
```

Campos solicitados actualmente:

```text
id,
nombre_clave,
titulo,
descripcion,
linea_investigacion,
year_vigencia,
avance,
avance_planeacion,
avance_instrumentos,
avance_recoleccion,
avance_documentacion,
avance_finalizacion
```

Filtro aplicado:

```text
year_vigencia == String(year)
```

Orden:

```text
id asc
```

Nota para agentes IA: `PaiList.vue` incluye `palabras_clave` dentro del texto buscable, pero
`PaiView.vue` no esta trayendo ese campo desde Supabase. Si se quiere que la busqueda cubra
palabras clave reales, se debe agregar `palabras_clave` al `select`.

## Modelo conceptual

Cada investigacion representa una fila de `gio_investigaciones` y se espera que tenga:

- Identificacion: `id`, `nombre_clave`, `titulo`, `descripcion`.
- Clasificacion: `linea_investigacion`.
- Vigencia: `year_vigencia`.
- Avance total: `avance`.
- Avances por etapa: `avance_planeacion`, `avance_instrumentos`,
  `avance_recoleccion`, `avance_documentacion`, `avance_finalizacion`.

Los avances se tratan como porcentajes numericos entre 0 y 100. La UI normaliza valores no
numericos a `0`, redondea al entero mas cercano y limita el resultado al rango `0..100`.

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

## Componentes y responsabilidades

### `PaiView.vue`

Responsable de orquestar la vista completa.

Hace:

- Lee la vigencia desde la ruta.
- Carga investigaciones desde Supabase.
- Gestiona estados de carga, error y vacio.
- Filtra investigaciones por `year_vigencia`.
- Controla la pestana activa: `portada` o `listado`, sincronizada con `?tab=`.
- Controla la seccion interna del listado mediante `currentListSection`, sincronizada con
  `?seccion=`.
- Lee `?investigacion_id=` para seleccionar una investigacion y abrir la vista de detalle.
- Entrega `investigacionesFiltradas` a los componentes hijos.

Estados principales:

- `investigaciones`: arreglo crudo cargado desde Supabase.
- `loading`: indicador de carga.
- `errorMessage`: mensaje visible si falla la consulta o si no hay Supabase configurado.
- `activeView`: pestana activa.
- `currentListSection`: seccion interna de `PaiList.vue`; puede ser `list` o `details`.
- `selectedInvestigacionId`: ID de la investigacion seleccionada desde la URL.
- `year`: vigencia derivada de `route.params.year`.

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
```

Emite:

```text
back
```

Hace:

- Muestra linea, nombre clave, titulo, descripcion y avance total.
- Renderiza cada etapa del PAI con descripcion, porcentaje, barra de progreso y peso.
- Usa `etapasInvestigacion` como fuente de verdad para el orden y la metadata de etapas.
- Expone un boton para volver al listado.

## Flujo de interaccion

1. El usuario entra a `/pai/:year`.
2. `PaiView.vue` obtiene la vigencia desde la ruta.
3. `PaiView.vue` normaliza `tab`, `seccion` e `investigacion_id` desde la URL.
4. Se consulta `gio_investigaciones` en Supabase filtrando por `year_vigencia`.
5. Mientras carga, se muestra `Cargando investigaciones...`.
6. Si hay error, se muestra un mensaje de error.
7. Si no hay registros, se muestra un mensaje de estado vacio.
8. Si hay registros y `tab=portada`, `PaiPortada.vue` muestra columnas de avance y KPIs.
9. Al hacer clic en una columna de avance, `ColumnasAvance.vue` navega a
   `?tab=listado&seccion=details&investigacion_id={id}`.
10. Si `tab=listado&seccion=list`, `PaiList.vue` muestra el buscador y las tarjetas.
11. Al hacer clic en una tarjeta, `PaiList.vue` navega a
    `?tab=listado&seccion=details&investigacion_id={id}`.
12. Si `seccion=details`, `PaiList.vue` muestra `InvestigacionView.vue` con la investigacion
    seleccionada.

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

La grilla del listado cambia por breakpoint:

- 1 columna en movil.
- 2 columnas desde `576px`.
- 3 columnas desde `768px`.
- 6 columnas desde `1200px`.

## Contratos importantes para cambios futuros

- `linea_investigacion` debe ser consistente con las lineas declaradas en `constants.js`, o
  al menos normalizable con `toClassName`.
- Los campos de avance deben poder convertirse a numero.
- `year_vigencia` se compara como numero en el filtro local, pero se envia como string al filtro
  de Supabase.
- `id` se usa como clave de render y como identificador de seleccion.
- Los enlaces al detalle deben conservar `tab=listado`, `seccion=details` e
  `investigacion_id={id}` para que la URL reconstruya el estado.
- `ColumnasAvance.vue` es reutilizable: cualquier vista que le pase `investigaciones` puede
  obtener la misma navegacion hacia detalle.
- `PaiPortada`, `PaiList` e `InvestigacionView` son componentes presentacionales respecto a
  datos remotos: no deben consultar Supabase directamente salvo que se decida cambiar la
  arquitectura.

## Guia para agentes IA de desarrollo web

Cuando extiendas esta funcionalidad:

1. Lee primero `PaiView.vue`, porque ahi esta el contrato de datos remoto.
2. Revisa `constants.js` antes de duplicar nombres de etapas o lineas.
3. Si agregas campos visibles, agregalos tambien al `select` de Supabase en `PaiView.vue`.
4. Si agregas nuevas lineas, actualiza `lineasInvestigacion` y los estilos `.bg-*`.
5. Si agregas nuevas etapas, actualiza el mapeo de campos en `PaiList.vue` e
   `InvestigacionView.vue`.
6. Conserva la normalizacion de texto para busqueda y clases CSS; evita comparar textos con
   acentos o mayusculas directamente.
7. Mantiene los componentes hijos sin dependencia directa de Supabase mientras la vista siga
   organizada con `PaiView.vue` como contenedor.
8. Si cambias la navegacion de detalle, revisa la relacion entre `tab`, `seccion`,
   `investigacion_id`, `activeView`, `currentListSection` y `currentInvestigacionId`.
9. Si reutilizas `ColumnasAvance.vue` en otra seccion, confirma que esa seccion pueda resolver
   la ruta con `tab=listado&seccion=details&investigacion_id={id}` o ajusta el componente para
   aceptar una funcion/prop de destino.
10. Evita que watchers iniciales pisen `seccion=details`: si hay `investigacion_id`, el estado
    de detalle debe tener prioridad sobre defaults locales como `list`.

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
