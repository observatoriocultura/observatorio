# Catálogos de aplicación

Cada archivo agrupa opciones estables de un módulo. Una opción tiene una `key` que
usa la aplicación y un `label` que se muestra al usuario. Las vistas deben importar
los catálogos y helpers desde `src/constants/catalogs`.

- `posts.js`: tipo y visibilidad de publicaciones.
- `profiles.js`: roles y géneros de perfiles.
- `pai.js`: entidades con los metadatos que requiere el módulo PAI.
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
