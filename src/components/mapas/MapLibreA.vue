<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Referencia al div donde MapLibre monta el mapa.
const mapContainer = ref(null)

// Id de la fuente GeoJSON de localidades.
const LOCALIDADES_SOURCE_ID = 'localidades-urbanas'

// Id de la capa de relleno de polígonos.
const LOCALIDADES_FILL_LAYER_ID = 'localidades-urbanas-fill'

// Id de la capa de bordes de polígonos.
const LOCALIDADES_LINE_LAYER_ID = 'localidades-urbanas-line'

// Id de la capa de etiquetas de localidades.
const LOCALIDADES_LABEL_LAYER_ID = 'localidades-urbanas-label'

// Ruta publica al GeoJSON de localidades.
const LOCALIDADES_URL = `${import.meta.env.BASE_URL}resources/maps/localidad_urbano_simple.json`

// Datos externos para definir la intensidad de cada localidad.
const props = defineProps({
  localidadesValores: {
    type: Array,
    default: () => [],
  },
})

// Instancia activa de MapLibre.
let map = null

// Construye expresiones de MapLibre para color y opacidad segun valor.
function getLocalidadesValorExpression() {
  // Usa solo localidades con valor numerico.
  const localidadesValidas = props.localidadesValores.filter((localidad) =>
    Number.isFinite(Number(localidad.valor)),
  )

  // Estilo base cuando no hay datos validos.
  if (!localidadesValidas.length) {
    return {
      fillColor: '#0f766e',
      fillOpacity: 0.28,
    }
  }

  // Rango de valores usado para normalizar la intensidad.
  const valores = localidadesValidas.map((localidad) => Number(localidad.valor))
  const min = Math.min(...valores)
  const max = Math.max(...valores)

  // Evita una interpolacion invalida cuando todos los valores son iguales.
  const maxInterpolacion = min === max ? min + 1 : max

  // Relaciona cada LocCodigo del GeoJSON con su valor numerico.
  const matchExpression = [
    'match',
    ['get', 'LocCodigo'],
    ...localidadesValidas.flatMap((localidad) => [
      String(localidad.LocCodigo),
      Number(localidad.valor),
    ]),
    min,
  ]

  return {
    fillColor: [
      'interpolate',
      ['linear'],
      matchExpression,
      min,
      '#0f766e',
      maxInterpolacion,
      '#67e8f9',
    ],
    fillOpacity: [
      'interpolate',
      ['linear'],
      matchExpression,
      min,
      0.22,
      maxInterpolacion,
      0.72,
    ],
  }
}

// Agrega fuente GeoJSON y capas visuales al mapa.
function addLocalidadesLayer() {
  if (!map || map.getSource(LOCALIDADES_SOURCE_ID)) return
  const localidadesValorExpression = getLocalidadesValorExpression()

  map.addSource(LOCALIDADES_SOURCE_ID, {
    type: 'geojson',
    data: LOCALIDADES_URL,
  })

  map.addLayer({
    id: LOCALIDADES_FILL_LAYER_ID,
    type: 'fill',
    source: LOCALIDADES_SOURCE_ID,
    paint: {
      'fill-color': localidadesValorExpression.fillColor,
      'fill-opacity': localidadesValorExpression.fillOpacity,
    },
  })

  map.addLayer({
    id: LOCALIDADES_LINE_LAYER_ID,
    type: 'line',
    source: LOCALIDADES_SOURCE_ID,
    paint: {
      'line-color': '#e0f2fe',
      'line-width': 1.6,
      'line-opacity': 0.85,
    },
  })

  map.addLayer({
    id: LOCALIDADES_LABEL_LAYER_ID,
    type: 'symbol',
    source: LOCALIDADES_SOURCE_ID,
    layout: {
      'text-field': ['get', 'NOMBRE'],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-transform': 'uppercase',
      'text-letter-spacing': 0.04,
      'text-anchor': 'center',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
    },
    paint: {
      'text-color': '#f8fafc',
      'text-halo-color': '#020617',
      'text-halo-width': 1.4,
      'text-halo-blur': 0.4,
    },
  })
}

// Actualiza color y opacidad cuando cambian los valores externos.
function updateLocalidadesPaint() {
  if (!map?.getLayer(LOCALIDADES_FILL_LAYER_ID)) return
  const localidadesValorExpression = getLocalidadesValorExpression()

  map.setPaintProperty(
    LOCALIDADES_FILL_LAYER_ID,
    'fill-color',
    localidadesValorExpression.fillColor,
  )
  map.setPaintProperty(
    LOCALIDADES_FILL_LAYER_ID,
    'fill-opacity',
    localidadesValorExpression.fillOpacity,
  )
}

// Reacciona a cambios profundos en localidadesValores.
watch(() => props.localidadesValores, updateLocalidadesPaint, { deep: true })

// Crea el mapa base y espera a que cargue para agregar localidades.
onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-74.12, 4.67], // Bogotá
    zoom: 11,
    pitch: 0,
    bearing: 105,
  })

  map.addControl(new maplibregl.NavigationControl())
  map.on('load', addLocalidadesLayer)
})

// Libera recursos al desmontar el componente.
onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<style scoped>
.map {
  width: 100%;
  height: 600px;
}
</style>
