---
type: Knowledge Collection
title: Encuesta Bienal de Culturas
description: Colección OKF para descubrir y consultar catálogos de preguntas y registros de caracterización de la Encuesta Bienal de Culturas.
tags:
  - encuesta-bienal-de-culturas
  - cultura
  - bogota
language: es
---

# Encuesta Bienal de Culturas

Esta colección reúne conceptos y recursos estructurados sobre las preguntas de la Encuesta Bienal de Culturas. Su contenido actual corresponde al módulo **Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025**.

## Alcance actual

La versión actual permite consultar:

- 215 posiciones del formulario;
- el nombre y el enunciado principal de cada registro;
- la clasificación de cada registro como `Registro`, `Caracterización` u `Objetivo`;
- palabras clave en los registros donde están disponibles.

No contiene códigos de variable, secciones, opciones de respuesta, instrucciones de salto ni resultados de la encuesta.

## Descubrimiento progresivo

1. Consulte el [índice OKF de la colección](./index.md).
2. Abra el concepto [Preguntas de la Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025](./2025-ebc-practicas-artisticas-preguntas.md) para conocer el alcance, el esquema y las restricciones.
3. Siga el campo `resource` del concepto para procesar el [listado JSON](./2025-ebc-practicas-artisticas-preguntas.json) cuando necesite acceder a los registros.

El archivo `index.json` se conserva como manifiesto auxiliar para aplicaciones. La entrada canónica para consumidores OKF es `index.md`.

## Recurso disponible

| Concepto OKF | Recurso | Cobertura |
|---|---|---|
| [Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025](./2025-ebc-practicas-artisticas-preguntas.md) | [JSON](./2025-ebc-practicas-artisticas-preguntas.json) | 215 registros |

## Uso previsto

La colección puede ser consultada por:

- el sitio web del Observatorio;
- flujos de automatización en n8n;
- servicios de búsqueda;
- asistentes basados en inteligencia artificial;
- la API de Gemini.

Los consumidores de IA deben leer primero el concepto Markdown y cargar el JSON únicamente cuando necesiten recuperar o procesar registros concretos.

## Restricciones

Esta colección contiene preguntas y metadatos básicos del formulario, no respuestas ni resultados de la encuesta. No debe utilizarse para inferir indicadores, frecuencias, comportamientos o resultados estadísticos.

La ausencia de un valor debe interpretarse como información no disponible. Los nombres y enunciados pueden repetirse y no deben utilizarse como identificadores únicos.

## Estado de procedencia y verificación

La colección no declara todavía `sources` ni `verified`. Los consumidores OKF deben tratar su contenido como conocimiento sin procedencia documental ni verificación formal registradas, de acuerdo con lo indicado en cada concepto.
