# Catálogos de aplicación

Cada archivo agrupa opciones estables de un módulo. Una opción tiene una `key` que
usa la aplicación y un `label` que se muestra al usuario. Las vistas deben importar
los catálogos y helpers desde `src/constants/catalogs`.

- `posts.js`: tipo y visibilidad de publicaciones.
- `profiles.js`: roles y géneros de perfiles.
- `pai.js`: entidades con los metadatos que requiere el módulo PAI.
- `rigcc.js`: países, ciudades y tipos de detalle para el demo Red de Observatorios.
- `index.js`: punto único de exportación.

Para añadir una opción, actualizar primero su catálogo y luego consumir el array
en el formulario. Usar las constantes `*_KEYS` en comparaciones y los helpers
`get*Label` al mostrar valores. Los normalizadores sirven para leer variantes
conocidas; una opción nueva no debe surgir de un valor desconocido.

Los catálogos estáticos no sustituyen tablas relacionales. Por ejemplo, la lista
de publicaciones disponibles para asociar un archivo se obtiene de Supabase.

## Valores persistidos

Las keys de `posts.visibility` y `profiles.gender` conservan los valores actuales
de Supabase, incluidos mayúsculas y tildes. Mover los catálogos no modifica datos.
Los roles de perfiles corresponden al enum `user_role` de la base de datos.
Antes de reemplazar esas keys por slugs hay que inventariar los valores existentes,
revisar restricciones y consultas, migrar los registros y retirar la compatibilidad
temporal solo después de verificar el resultado.

`pai.js` conserva los metadatos de `ENTIDADES` (`orden`, `sigla`, `sector` y `color`)
porque el filtro usa `sigla` como valor.

## Países y ciudades del demo RIGCC

`RIGCC_COUNTRIES` contiene los 22 países iberoamericanos y Puerto Rico. Cada
opción tiene `key` (ISO de tres letras), `label` y `color` hexadecimal pastel,
inspirado en las banderas. `RIGCC_COUNTRY_KEYS` ofrece las constantes para
comparaciones. Ajustar la paleta aquí para mantener coherencia entre el mapa,
su leyenda y los gráficos de Conexiones.

`getRigccCountry` resuelve un código a su opción o `null`;
`normalizeRigccCountry` devuelve su key o `''` si es desconocido. Ambos admiten
espacios y diferencias de mayúsculas. `getRigccCountryLabel` muestra la etiqueta
y conserva un código desconocido. `getRigccCountryColor` devuelve el color o
`RIGCC_DEFAULT_COUNTRY_COLOR` para un código sin correspondencia.

Los puntos GeoJSON se enriquecen con el país y su color desde este catálogo.
MapLibre aplica el color con `circle-color`; los bordes y el halo de selección
permiten distinguir los puntos sin cambiar su color de país.

`RIGCC_CITIES` contiene las 23 ciudades de la tabla `ciudades` revisada el
2026-10-22. Cada opción tiene `key`, `label`, `pais` (código de tres letras de la
hoja), `latitud` y `longitud` numéricas en grados decimales. Las keys incluyen el
país para distinguir ciudades homónimas y están disponibles en `RIGCC_CITY_KEYS`.
Los nombres de la hoja se conservan como etiquetas; no se modifican sus valores
persistidos.

Importar el catálogo y sus helpers desde `src/constants/catalogs`. Por ejemplo,
`getRigccCity(entidad.ciudad, entidad.pais_territorio)` devuelve la opción completa
o `null` si no hay una coincidencia única. `normalizeRigccCity` resuelve una key o
un nombre conocido a su key y devuelve `''` para valores desconocidos o ambiguos.
Admite variantes de mayúsculas, tildes, espacios y apóstrofos. `getRigccCityLabel`
devuelve la etiqueta canónica, conserva el texto desconocido y usa `Sin ciudad`
para un valor vacío.

Las coordenadas son puntos representativos de las ciudades, no direcciones de
entidades o personas. Las fuentes están documentadas en las notas de la tabla
`ciudades`; las decisiones de ubicación permanecen en `rigcc_entidades.notas`.
Actualizar este catálogo al revisar esa tabla, sin duplicarlo en otro archivo
estático.

## Tipos de detalle del demo RIGCC

`RIGCC_DETAIL_TYPES` conserva las siete keys de `tipo_detalle` de la hoja
`rigcc_entidades_detalles`: `tema`, `investigacion`, `metodologia`, `fuente`,
`producto`, `capacidad_compartida` y `enlace`. Cada opción tiene `key`, `label`,
`groupLabel` para agrupar en el perfil e `icon` de Bootstrap Icons.
`RIGCC_DETAIL_TYPE_KEYS` permite comparar valores sin repetir cadenas.

`getRigccDetailType` devuelve una opción o `null`;
`normalizeRigccDetailType` acepta variantes conocidas de tildes, mayúsculas,
espacios y guiones, y devuelve `''` para tipos desconocidos.
`getRigccDetailTypeLabel` conserva el texto de un tipo desconocido, sin añadir
opciones al catálogo.

`src/utils/redObservatoriosDetalles.js` lee remotamente la pestaña con gid
`195791648` mediante `fetchGoogleSheetCsv`. Los detalles se asocian por
`entidad_id`, se ordenan por `orden` y se agrupan con este catálogo. Las filas
sin ID reciben una clave local para la interfaz, sin inventar IDs persistidos.
Los tipos desconocidos se conservan en «Otros detalles».

La selección pública solo incluye `publicado`; `borrador` requiere activar
`includeDrafts` y `archivado` se excluye. El perfil del demo pasa `include-drafts`
a `RedObservatoriosPerfilDetalles.vue` porque los 930 registros revisados el
2026-10-24 están en borrador; se muestran etiquetados. La carga de estos detalles
es independiente de los datos principales del perfil y ofrece reintento.
