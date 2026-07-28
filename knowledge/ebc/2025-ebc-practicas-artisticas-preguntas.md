---
type: Survey Question Catalog
title: Preguntas de la Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025
description: Listado estructurado de 215 preguntas y registros de caracterización de la Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025.
resource: ./2025-ebc-practicas-artisticas-preguntas.json
resource_format: application/json
record_count: 215
tags:
  - encuesta-bienal-de-culturas
  - preguntas
  - practicas-artisticas
  - cultura
  - patrimonio
  - bogota
language: es
survey_year: 2025
---

# Alcance

Este concepto describe el listado estructurado de preguntas y registros de caracterización del módulo **Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025** de la Encuesta Bienal de Culturas.

La encuesta recoge información sobre las características sociodemográficas de las personas encuestadas y profundiza en su relación con la vida artística, cultural, creativa y patrimonial de Bogotá. Indaga por sus prácticas, trayectorias de formación, asistencia y participación en actividades culturales, uso y valoración de equipamientos, vínculos con el patrimonio, medios de acceso a contenidos culturales y percepciones sobre el aporte de la cultura al bienestar emocional y la salud mental.

# Recurso

El campo `resource` del frontmatter referencia el archivo canónico [2025-ebc-practicas-artisticas-preguntas.json](./2025-ebc-practicas-artisticas-preguntas.json), con tipo de contenido `application/json`.

El recurso es un arreglo JSON de 215 objetos. Cada objeto corresponde a una posición del formulario y contiene seis campos. `indice_pregunta` es único y consecutivo en esta versión, desde `0` hasta `214`.

Los registros se distribuyen entre los roles declarados en el propio archivo:

| Rol | Registros |
|---|---:|
| `Registro` | 1 |
| `Caracterización` | 67 |
| `Objetivo` | 147 |

# Schema

| Campo | Tipo observado | Descripción de uso |
|---|---|---|
| `indice_pregunta` | número | Posición única y consecutiva del registro en la versión actual del archivo. |
| `nombre` | texto | Nombre breve de la pregunta o del dato de caracterización. |
| `descripcion` | nulo | Campo reservado para descripción. Los 215 registros tienen valor `null`. |
| `rol` | texto | Clasificación del registro: `Registro`, `Caracterización` u `Objetivo`. |
| `enunciado_1` | texto | Enunciado principal asociado al registro. |
| `palabras_clave` | texto o nulo | Términos de apoyo para búsqueda. Está informado en 10 registros y es `null` en 205. |

# Consideraciones para agentes de IA

- Use el documento Markdown para determinar el alcance y las restricciones antes de cargar el JSON completo.
- Trate los valores nulos como ausencia de información, no como respuestas negativas.
- No use `nombre` ni `enunciado_1` como identificadores únicos: ambos contienen valores repetidos.
- Use `indice_pregunta` como índice único de la versión actual, sin asumir que permanecerá estable en versiones futuras.
- No interprete `palabras_clave` como una taxonomía exhaustiva; la mayoría de los registros no tiene este campo informado.
- El archivo no incluye códigos de variable, secciones, opciones de respuesta ni instrucciones de salto.
- No use este catálogo para inferir respuestas, indicadores, frecuencias ni resultados estadísticos.
- Este recurso contiene preguntas y metadatos de formulario; no contiene resultados de la encuesta.

# Estado de procedencia y verificación

Este concepto no declara `sources` ni `verified` porque la procedencia documental y una verificación humana formal todavía no están registradas en el catálogo. Los consumidores OKF deben tratarlo como conocimiento sin verificación declarada hasta que esos metadatos sean incorporados.

# Relaciones

- Pertenece a la colección [Encuesta Bienal de Culturas](./README.md).
- Se descubre desde el [índice de la colección](./index.md).
