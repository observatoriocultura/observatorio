<template>
  <section class="red-observatorios-mapa" aria-label="Mapa de la Red de Observatorios">
    <div class="map-panel">
      <div ref="mapToolbar" class="map-toolbar">
        <label class="map-city-picker">
          <span>Ir a una ciudad</span>
          <select
            :value="selectedCityKey"
            :disabled="!ready || !mapData.groups.length"
            @change="selectCity($event.target.value)"
          >
            <option value="">Selecciona una ciudad</option>
            <option v-for="group in mapData.groups" :key="group.city.key" :value="group.city.key">
              {{ group.city.label }} · {{ getCountryName(group.city.pais) }} ({{
                group.entities.length
              }})
            </option>
          </select>
        </label>
        <button class="map-reset" type="button" :disabled="!ready" @click="resetView()">
          <i class="bi bi-arrows-fullscreen" aria-hidden="true"></i>
          Ver Iberoamérica
        </button>
      </div>

      <div ref="mapStage" class="map-stage" :aria-busy="loading">
        <div
          ref="mapContainer"
          class="map-canvas"
          role="region"
          aria-label="Mapa de ciudades de la Red de Observatorios de Iberoamérica"
          aria-describedby="directory-map-help"
        ></div>
        <RedObservatoriosMapaAbanico
          v-if="fanVisible && selectedGroup && fanPoint"
          :key="selectedCityKey"
          ref="fan"
          :group="selectedGroup"
          :point="fanPoint"
          :width="mapSize.width"
          :height="mapSize.height"
          :country-name="getCountryName(selectedGroup.city.pais)"
          :color="getRigccCountryColor(selectedGroup.city.pais)"
          @close="closeFan(true)"
        />
        <div v-if="loading" class="map-status" role="status">Cargando el mapa de la red…</div>
        <div v-else-if="error" class="map-status" role="alert">
          <p>{{ error }}</p>
          <button class="map-reset" type="button" @click="initializeMap">Reintentar</button>
        </div>
      </div>

      <footer class="map-caption">
        <p id="directory-map-help">
          Cada círculo representa una ciudad y reúne sus entidades y personas. También puedes
          elegirla en el selector para consultar las fichas con el teclado.
        </p>
        <p>
          Las ubicaciones son representativas de las ciudades, no direcciones de sedes. Consulta las
          notas de cada registro para conocer las asignaciones aproximadas.
        </p>
        <ul
          class="map-country-legend"
          aria-label="Colores de los países y territorios representados"
        >
          <li v-for="country in representedCountries" :key="country.key">
            <span
              class="map-legend-dot"
              :style="{ backgroundColor: country.color }"
              aria-hidden="true"
            ></span>
            {{ country.label }}
          </li>
        </ul>
        <dl class="map-metrics" aria-label="Cobertura del mapa">
          <div>
            <dt>registros ubicados</dt>
            <dd>{{ locatedCount }}</dd>
          </div>
          <div>
            <dt>ciudades</dt>
            <dd>{{ mapData.groups.length }}</dd>
          </div>
          <div>
            <dt>países y territorios</dt>
            <dd>{{ countryCount }}</dd>
          </div>
        </dl>
      </footer>
    </div>

    <p v-if="!loading && !error && !locatedCount" class="map-empty" role="status">
      Aún no hay registros con una ubicación disponible para mostrar en el mapa.
    </p>
    <details v-if="mapData.unlocated.length" class="map-unlocated">
      <summary>{{ mapData.unlocated.length }} registros sin ubicación disponible</summary>
      <p>Estos registros siguen disponibles en Explorar mientras se completa su ubicación.</p>
      <ul>
        <li v-for="entity in mapData.unlocated" :key="entity.id">
          {{ entity.nombre }} · {{ entity.ciudad || 'Ciudad no informada' }} ·
          {{ getCountryName(entity.pais_territorio) }}
        </li>
      </ul>
    </details>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { RIGCC_COUNTRIES, getRigccCountryColor } from '../../../constants/catalogs/index.js'
import { createObservatoriosMapData } from '../../../utils/redObservatoriosMapa.js'
import RedObservatoriosMapaAbanico from './RedObservatoriosMapaAbanico.vue'

const COUNTRIES_URL = `${import.meta.env.BASE_URL}content/2026/demo_red_observatorios/iberoamerica.geojson`
const POINTS_SOURCE = 'rigcc-cities'
const HIT_LAYER = 'rigcc-city-targets'
const props = defineProps({ entidades: { type: Array, required: true } })

const mapContainer = ref(null)
const mapStage = ref(null)
const mapToolbar = ref(null)
const fan = ref(null)
const fanPoint = ref(null)
const fanVisible = ref(false)
const mapSize = ref({ width: 0, height: 0 })
const loading = ref(true)
const ready = ref(false)
const error = ref('')
const countries = ref([])
const selectedCityKey = ref('')
const mapData = computed(() => createObservatoriosMapData(props.entidades))
const locatedCount = computed(() => props.entidades.length - mapData.value.unlocated.length)
const countryCount = computed(() => new Set(mapData.value.groups.map(({ city }) => city.pais)).size)
const representedCountries = computed(() => {
  const codes = new Set(mapData.value.groups.map(({ city }) => city.pais))
  return RIGCC_COUNTRIES.filter(({ key }) => codes.has(key)).sort((a, b) =>
    a.label.localeCompare(b.label, 'es'),
  )
})
const selectedGroup = computed(() =>
  mapData.value.groups.find(({ city }) => city.key === selectedCityKey.value),
)
const countriesByCode = computed(
  () => new Map(countries.value.map((country) => [country.properties.iso_a3, country.properties])),
)

let map = null
let selectionPending = false
let selectionTrigger = null
let compactMode = null
let resizeObserver = null
let requestController = null
let countryBounds = null

const getCountryName = (code) =>
  countriesByCode.value.get(code)?.nombre || code || 'País no informado'
function closeFan(restoreFocus = false) {
  const trigger = selectionTrigger
  if (selectedCityKey.value && map?.getSource(POINTS_SOURCE)) {
    map.setFeatureState({ source: POINTS_SOURCE, id: selectedCityKey.value }, { selected: false })
  }
  selectionPending = false
  selectionTrigger = null
  fanVisible.value = false
  fanPoint.value = null
  selectedCityKey.value = ''
  if (restoreFocus) {
    if (trigger?.isConnected && typeof trigger.focus === 'function')
      trigger.focus({ preventScroll: true })
    else map?.getCanvas().focus({ preventScroll: true })
  }
}

function updateFanPosition() {
  if (!map || !mapContainer.value) return
  const { clientWidth: width, clientHeight: height } = mapContainer.value
  if (width !== mapSize.value.width || height !== mapSize.value.height)
    mapSize.value = { width, height }
  const group = selectedGroup.value
  if (!group) return
  const point = map.project([group.city.longitud, group.city.latitud])
  if (!selectionPending && (point.x < 0 || point.x > width || point.y < 0 || point.y > height)) {
    closeFan()
    return
  }
  fanPoint.value = { x: point.x, y: point.y }
}

function finishSelection() {
  if (!selectionPending || !selectedGroup.value) return
  selectionPending = false
  updateFanPosition()
  if (!selectedCityKey.value) return
  fanVisible.value = true
  const key = selectedCityKey.value
  nextTick(() => {
    if (fanVisible.value && selectedCityKey.value === key) fan.value?.focusClose()
  })
}

function handleMapResize() {
  const wasCompact = compactMode
  const key = selectedCityKey.value
  updateFanPosition()
  const isCompact = mapSize.value.width < 760 || mapSize.value.height < 500
  compactMode = isCompact
  if (key && wasCompact !== null && wasCompact !== isCompact) selectCity(key)
}

function selectCity(key) {
  if (!ready.value || !map) return
  const group = mapData.value.groups.find(({ city }) => city.key === key)
  const trigger = document.activeElement
  closeFan()
  map.stop()
  if (!group) return
  selectedCityKey.value = key
  selectionTrigger = trigger
  selectionPending = true
  updateFanPosition()
  map.setFeatureState({ source: POINTS_SOURCE, id: key }, { selected: true })
  const compact = mapSize.value.width < 760 || mapSize.value.height < 500
  compactMode = compact
  map.easeTo({
    center: [group.city.longitud, group.city.latitud],
    zoom: Math.max(map.getZoom(), 4),
    offset: [0, compact ? -Math.min(160, mapSize.value.height * 0.28) : 0],
    duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 450,
  })
  if (!map.isMoving()) finishSelection()
}

function handleOutsideInteraction(event) {
  if (!selectedCityKey.value || !(event.target instanceof Node)) return
  if (mapStage.value?.contains(event.target) || mapToolbar.value?.contains(event.target)) return
  closeFan()
}

function handleEscape(event) {
  if (event.key !== 'Escape' || !selectedCityKey.value) return
  event.preventDefault()
  closeFan(true)
}

function resetView(duration = 450) {
  if (!map || !countryBounds) return
  closeFan()
  map.fitBounds(countryBounds, { padding: window.innerWidth < 600 ? 24 : 48, duration })
}

function countryFill() {
  return [
    'case',
    [
      'in',
      ['get', 'iso_a3'],
      ['literal', [...new Set(mapData.value.groups.map(({ city }) => city.pais))]],
    ],
    '#dccbb6',
    '#e9e2d7',
  ]
}

function handleMapClick(event) {
  const features = map.queryRenderedFeatures(event.point, { layers: [HIT_LAYER] })
  if (!features.length) {
    closeFan()
    return
  }
  // En puntos próximos, elegir el centro más cercano al clic.
  const closest = features.sort((a, b) => {
    const pa = map.project(a.geometry.coordinates)
    const pb = map.project(b.geometry.coordinates)
    return (
      Math.hypot(pa.x - event.point.x, pa.y - event.point.y) -
      Math.hypot(pb.x - event.point.x, pb.y - event.point.y)
    )
  })[0]
  selectCity(closest.properties.cityKey)
}

function disposeMap() {
  ready.value = false
  requestController?.abort()
  requestController = null
  resizeObserver?.disconnect()
  resizeObserver = null
  closeFan()
  map?.remove()
  map = null
}

function handleMapError(event) {
  if (!map) return
  closeFan()
  console.error('Error mostrando el mapa de la red:', event.error || event)
  ready.value = false
  loading.value = false
  error.value =
    'No fue posible mostrar el mapa. Puedes reintentar o consultar el directorio en Explorar.'
}

function syncMapData() {
  const currentMap = map
  if (!currentMap?.getSource(POINTS_SOURCE)) return
  currentMap.setPaintProperty('rigcc-country-fill', 'fill-color', countryFill())
  currentMap
    .getSource(POINTS_SOURCE)
    .setData(mapData.value.geojson)
    .catch((sourceError) => {
      if (map === currentMap) handleMapError(sourceError)
    })
}

async function initializeMap() {
  disposeMap()
  loading.value = true
  error.value = ''
  const controller = new AbortController()
  requestController = controller

  try {
    const response = await fetch(COUNTRIES_URL, { signal: controller.signal })
    if (!response.ok) throw new Error(`No se pudo cargar la cartografía (${response.status}).`)
    const data = await response.json()
    if (data.type !== 'FeatureCollection' || !data.features?.length || data.bbox?.length !== 4) {
      throw new Error('La cartografía no tiene el formato esperado.')
    }
    if (requestController !== controller) return

    countries.value = data.features
    countryBounds = [
      [data.bbox[0], data.bbox[1]],
      [data.bbox[2], data.bbox[3]],
    ]
    // Vite debe emitir el worker de MapLibre 6 con la ruta base de la aplicación.
    setWorkerUrl(mapWorkerUrl)
    map = new MapLibreMap({
      container: mapContainer.value,
      center: [-55, 2],
      zoom: 1,
      maxZoom: 8,
      renderWorldCopies: false,
      dragRotate: false,
      pitchWithRotate: false,
      cooperativeGestures: true,
      locale: {
        'Map.Title': 'Mapa de la Red de Observatorios',
        'NavigationControl.ZoomIn': 'Acercar',
        'NavigationControl.ZoomOut': 'Alejar',
        'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl y la rueda para acercar el mapa',
        'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ y la rueda para acercar el mapa',
        'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
      },
      // Base local sin proveedor de teselas ni claves de API.
      style: {
        version: 8,
        sources: {
          countries: {
            type: 'geojson',
            data,
            attribution:
              '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a>',
          },
          [POINTS_SOURCE]: { type: 'geojson', data: mapData.value.geojson, promoteId: 'cityKey' },
        },
        layers: [
          { id: 'rigcc-background', type: 'background', paint: { 'background-color': '#f7f4ee' } },
          {
            id: 'rigcc-country-fill',
            type: 'fill',
            source: 'countries',
            paint: { 'fill-color': countryFill() },
          },
          {
            id: 'rigcc-country-borders',
            type: 'line',
            source: 'countries',
            paint: { 'line-color': '#b9a893', 'line-width': 0.8 },
          },
          {
            id: 'rigcc-city-selection',
            type: 'circle',
            source: POINTS_SOURCE,
            paint: {
              'circle-radius': 14,
              'circle-color': ['get', 'color'],
              'circle-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.4, 0],
            },
          },
          {
            id: 'rigcc-city-points',
            type: 'circle',
            source: POINTS_SOURCE,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 5, 10, 8],
              'circle-color': ['get', 'color'],
              'circle-stroke-color': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                '#5d432f',
                '#8a7562',
              ],
              'circle-stroke-width': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                2,
                1.2,
              ],
            },
          },
          {
            id: HIT_LAYER,
            type: 'circle',
            source: POINTS_SOURCE,
            paint: { 'circle-radius': 16, 'circle-opacity': 0 },
          },
        ],
      },
    })
    map.touchZoomRotate.disableRotation()
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      if (requestController !== controller) return
      ready.value = true
      loading.value = false
      syncMapData()
      resetView(0)
      updateFanPosition()
      compactMode = mapSize.value.width < 760 || mapSize.value.height < 500
      map.on('move', updateFanPosition)
      map.on('moveend', finishSelection)
      map.on('resize', handleMapResize)
      map.on('click', handleMapClick)
      map.on('mouseenter', HIT_LAYER, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', HIT_LAYER, () => {
        map.getCanvas().style.cursor = ''
      })
    })
    map.on('error', handleMapError)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => map?.resize())
      resizeObserver.observe(mapContainer.value)
    }
  } catch (loadError) {
    if (requestController !== controller || controller.signal.aborted) return
    loading.value = false
    error.value =
      'No fue posible mostrar el mapa. Puedes reintentar o consultar el directorio en Explorar.'
    console.error('Error cargando el mapa de la red:', loadError)
  }
}

watch(mapData, () => {
  closeFan()
  if (!ready.value) return
  syncMapData()
})

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsideInteraction)
  document.addEventListener('keydown', handleEscape)
  initializeMap()
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsideInteraction)
  document.removeEventListener('keydown', handleEscape)
  disposeMap()
})
</script>

<style scoped>
.red-observatorios-mapa {
  padding: 1.25rem 0 1rem;
}
.map-metrics {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin: 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--red-border);
}
.map-metrics div {
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  border-left: 1px solid var(--red-border);
  padding-left: 1rem;
}
.map-metrics dt {
  max-width: 12ch;
  color: var(--red-muted);
  font-size: 0.75rem;
  font-weight: 400;
}
.map-metrics dd {
  margin: 0;
  color: var(--red-ink);
  font-size: 2rem;
  line-height: 1.2;
}
.map-panel {
  overflow: hidden;
  border: 1px solid var(--red-border);
  border-radius: 28px;
  background: var(--red-surface);
}
.map-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--red-border);
}
.map-city-picker {
  display: grid;
  gap: 0.45rem;
  width: min(100%, 420px);
  min-width: 0;
  color: var(--red-muted);
  font-size: 0.75rem;
}
.map-city-picker select {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--red-border);
  border-radius: 12px;
  padding: 0.6rem 0.75rem;
  background: var(--red-soft);
  color: var(--red-ink);
  font-size: 0.85rem;
}
.map-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  padding: 0.65rem 1rem;
  background: var(--red-surface);
  color: var(--red-ink);
  font-size: 0.8rem;
}
.map-reset:hover:not(:disabled) {
  border-color: var(--red-ink);
}
.map-reset:disabled,
.map-city-picker select:disabled {
  opacity: 0.55;
}
.map-stage {
  position: relative;
  overflow: hidden;
}
.map-canvas {
  width: 100%;
  height: 640px;
  background: var(--red-soft);
}
.map-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: var(--red-soft);
  color: var(--red-muted);
  text-align: center;
}
.map-status p {
  max-width: 44ch;
  margin: 0;
}
.map-caption {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--red-border);
  color: var(--red-muted);
  font-size: 0.75rem;
}
.map-caption p {
  margin: 0;
}
.map-legend-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 0.4rem;
  border: 1px solid #8a7562;
  border-radius: 50%;
}
.map-country-legend {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.map-country-legend li {
  display: inline-flex;
  align-items: center;
}
.map-unlocated,
.map-empty {
  margin: 1.25rem 0 0;
  color: var(--red-muted);
  font-size: 0.85rem;
}
.map-unlocated summary {
  min-height: 44px;
  padding: 0.6rem 0;
  cursor: pointer;
}
.map-unlocated ul {
  margin-bottom: 0;
}
.map-canvas :deep(.maplibregl-ctrl-group) {
  overflow: hidden;
  border: 1px solid var(--red-border);
  border-radius: 12px;
  box-shadow: none;
}
.map-canvas :deep(.maplibregl-ctrl-group button) {
  width: 40px;
  height: 40px;
}
.map-canvas :deep(.maplibregl-ctrl-attrib) {
  font-family: var(--red-font);
  font-size: 10px;
}
@media (max-width: 600px) {
  .map-toolbar {
    align-items: stretch;
    flex-direction: column;
    padding: 1rem;
  }
  .map-city-picker {
    width: 100%;
  }
  .map-canvas {
    height: 540px;
  }
  .map-caption {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
}
</style>
