<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  geoJsonGeometryToSvgPath,
  getGeoJsonBounds,
  getSvgViewBox,
} from '../../utils/geojsonToSvg'
import { getScaledHexColor } from '../../utils/colorScale'

// Entradas configurables desde la vista que usa el mapa.
const props = defineProps({
  colorMin: {
    type: String,
    default: '#dbeafe',
  },
  colorMax: {
    type: String,
    default: '#1d4ed8',
  },
  strokeColor: {
    type: String,
    default: '#1d4ed8',
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  localidadesValores: {
    type: Array,
    default: () => [],
  },
  rotation: {
    type: Number,
    default: 0,
  },
  zoom: {
    type: Number,
    default: 1,
  },
})

// Recurso GeoJSON simplificado servido desde public.
const MAP_URL = `${import.meta.env.BASE_URL}resources/maps/localidad_urbano_simple.json`
const MAP_WIDTH = 800
const MAP_PADDING = 0.000001

// Estado interno del mapa cargado y de la interaccion del usuario.
const localidades = ref([])
const selectedCodigo = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const bounds = ref(null)

// Caja visible del SVG calculada con la proporcion real del GeoJSON.
const viewBox = computed(() => {
  if (!bounds.value) return `0 0 ${MAP_WIDTH} ${MAP_WIDTH}`

  return getSvgViewBox(bounds.value, MAP_WIDTH)
})

// Variables CSS que permiten cambiar colores sin recalcular los paths.
const mapStyles = computed(() => ({
  '--localidades-color-min': isHexColor(props.colorMin) ? props.colorMin : '#dbeafe',
  '--localidades-color-max': isHexColor(props.colorMax) ? props.colorMax : '#1d4ed8',
  '--localidades-stroke-color': isHexColor(props.strokeColor) ? props.strokeColor : '#1d4ed8',
  '--localidades-background-color': isHexColor(props.backgroundColor)
    ? props.backgroundColor
    : '#ffffff',
}))

// Rotacion visual del SVG; la geometria original permanece intacta.
const svgStyles = computed(() => ({
  transform: `rotate(${props.rotation}deg) scale(${props.zoom})`,
}))

// Prepara min, max y busqueda rapida por codigo para el mapa de calor.
const valoresNormalizados = computed(() => {
  const valoresValidos = props.localidadesValores
    .map((item) => Number(item.valor))
    .filter((valor) => Number.isFinite(valor))

  if (!valoresValidos.length) {
    return {
      min: 0,
      max: 0,
      valores: new Map(),
    }
  }

  const min = Math.min(...valoresValidos)
  const max = Math.max(...valoresValidos)
  const valores = new Map(
    props.localidadesValores.map((item) => [String(item.localidad_cod), Number(item.valor)]),
  )

  return { min, max, valores }
})

// Evita aplicar valores no validos como colores SVG.
function isHexColor(color) {
  return /^#([\da-f]{3}|[\da-f]{6})$/i.test(color)
}

// Guarda la localidad seleccionada para resaltar el path.
function selectLocalidad(localidad) {
  selectedCodigo.value = localidad.codigo
}

// Atenua las localidades que no tienen valor asociado.
function getLocalidadFillOpacity(codigo) {
  const { valores } = valoresNormalizados.value
  const valor = valores.get(String(codigo))

  return Number.isFinite(valor) ? 1 : 0.2
}

// Interpola el color de la localidad usando el valor dentro del rango min/max.
function getLocalidadFillColor(codigo) {
  const { min, max, valores } = valoresNormalizados.value
  const valor = valores.get(String(codigo))
  const colorMin = isHexColor(props.colorMin) ? props.colorMin : '#dbeafe'
  const colorMax = isHexColor(props.colorMax) ? props.colorMax : '#1d4ed8'

  return getScaledHexColor(valor, min, max, colorMin, colorMax)
}

// Carga el GeoJSON y deja lista cada localidad con codigo, nombre y path SVG.
onMounted(async () => {
  try {
    const response = await fetch(MAP_URL)

    if (!response.ok) {
      throw new Error(`No se pudo cargar el mapa (${response.status})`)
    }

    const geojson = await response.json()
    const currentBounds = getGeoJsonBounds(geojson.features, MAP_PADDING)
    bounds.value = currentBounds

    localidades.value = geojson.features.map((feature) => ({
      codigo: feature.properties.CODIGO_LOC,
      nombre: feature.properties.NOMBRE,
      path: geoJsonGeometryToSvgPath(feature.geometry, currentBounds, MAP_WIDTH),
    }))
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <p v-if="isLoading" class="localidades-urbanas__status">Cargando mapa...</p>
  <p v-else-if="errorMessage" class="localidades-urbanas__status localidades-urbanas__status--error">
    {{ errorMessage }}
  </p>

  <section v-else class="localidades-urbanas" :style="mapStyles">
    <figure class="localidades-urbanas__figure">
      <svg
        class="localidades-urbanas__map"
        :style="svgStyles"
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Mapa urbano de localidades de Bogota"
      >
        <path
          v-for="localidad in localidades"
          :key="localidad.codigo"
          class="localidades-urbanas__localidad"
          :class="{ 'localidades-urbanas__localidad--selected': selectedCodigo === localidad.codigo }"
          :d="localidad.path"
          :style="{
            '--localidad-fill-color': getLocalidadFillColor(localidad.codigo),
            fillOpacity: getLocalidadFillOpacity(localidad.codigo),
          }"
          :data-codigo-loc="localidad.codigo"
          :data-nombre="localidad.nombre"
          tabindex="0"
          @click="selectLocalidad(localidad)"
          @keydown.enter="selectLocalidad(localidad)"
        >
          <title>{{ localidad.nombre }}</title>
        </path>
      </svg>
    </figure>

  </section>
</template>

<style scoped>
.localidades-urbanas {
  height: 100%;
  min-height: 0;
  background: var(--localidades-background-color);
  overflow: hidden;
}

.localidades-urbanas__figure {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.localidades-urbanas__map {
  width: auto;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: block;
  transform-origin: center;
}

.localidades-urbanas__localidad {
  fill: var(--localidad-fill-color, var(--localidades-color-min));
  stroke: var(--localidades-stroke-color);
  stroke-width: 0.6;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
  transition:
    fill 0.18s ease,
    fill-opacity 0.18s ease,
    stroke 0.18s ease;
}

.localidades-urbanas__localidad:hover,
.localidades-urbanas__localidad:focus-visible {
  fill: #93c5fd;
  stroke: #1e40af;
  outline: none;
}

.localidades-urbanas__localidad--selected {
  fill: #fbbf24;
  stroke: #92400e;
}

.localidades-urbanas__status {
  margin: 0;
  color: #475569;
}

.localidades-urbanas__status--error {
  color: #b91c1c;
}

</style>
