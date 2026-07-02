<template>
  <div v-if="investigacion" class="mt-2">
    <button class="btn btn-light border rounded-pill mb-3 fw-bold" type="button" @click="emit('back')">
      &larr; Volver
    </button>
    <div class="row">
      <div class="col-lg-4 mb-4 order-lg-2">
        <img
          :src="`${baseUrl}content/investigaciones/thumbnails/${investigacion.id}.jpg`"
          class="w-100 rounded-4 mb-4 object-fit-cover shadow-sm"
          style="aspect-ratio: 16/9"
          :alt="investigacion.titulo"
          @error="(event) => (event.target.src = `${baseUrl}content/investigaciones/thumbnails/nd.jpg`)"
        />

        <h4 v-if="hallazgos.length > 0" class="findings-title text-center fw-bold mb-3">
          Principales hallazgos
        </h4>

        <section v-if="hallazgos.length > 0" class="findings-carousel">
          <div
            :key="carouselProgressKey"
            class="findings-timer"
            aria-hidden="true"
          ></div>

          <div class="findings-indicators" aria-label="Seleccionar hallazgo">
            <button
              v-for="(hallazgo, idx) in hallazgos"
              :key="`${hallazgo.investigacion_id}-${hallazgo.orden}-${idx}-indicator`"
              type="button"
              class="finding-indicator"
              :class="{ active: idx === activeHallazgoIndex }"
              :aria-label="`Ver hallazgo ${idx + 1}`"
              :aria-current="idx === activeHallazgoIndex ? 'true' : undefined"
              @click="setActiveHallazgo(idx)"
            >
              {{ hallazgo.orden || idx + 1 }}
            </button>
          </div>

          <article class="finding-slide">
            <div class="finding-content">
              <h5 class="finding-heading fw-bold mb-2">{{ activeHallazgo.titulo }}</h5>
              <p class="finding-text mb-0">{{ activeHallazgo.texto }}</p>
              <div
                v-if="activeHallazgo.valor || activeHallazgo.unidad_medida"
                class="finding-value fw-semibold mt-3"
              >
                {{ [activeHallazgo.valor, activeHallazgo.unidad_medida].filter(Boolean).join(' ') }}
              </div>
            </div>
          </article>
        </section>

        <div v-else class="findings-empty-light">
          No hay hallazgos registrados.
        </div>
      </div>

      <div class="col-lg-8 mb-4 order-lg-1">
        <div class="p-4 rounded-4 detail-purple-block">
          <div class="row">
            <div class="col-md-7 mb-4 mb-md-0">
              <div
                v-if="investigacion.tema || investigacion.anio"
                class="d-flex flex-wrap align-items-center gap-2 mb-3"
              >
                <span v-if="investigacion.anio" class="detail-year-label">
                  {{ investigacion.anio }}
                </span>
                <span v-if="investigacion.tema" class="detail-eyebrow">
                  {{ investigacion.tema }}
                </span>
              </div>
              <h3 class="fw-bold mb-3 detail-yellow-title">
                {{ investigacion.titulo }}
              </h3>
              <p class="mb-0 text-white mt-2 investigacion-descripcion">
                {{ investigacion.descripcion || 'Sin descripción disponible.' }}
              </p>
            </div>

            <div class="col-md-5 ps-md-4">
              <div v-if="productos.length === 0" class="small opacity-75 mt-2">
                No hay productos asociados registrados.
              </div>
              <ul v-else class="list-unstyled mb-0">
                <li v-for="(prod, idx) in productos" :key="idx" class="mb-2">
                  <a
                    v-if="prod.url && prod.url !== ''"
                    :href="prod.url"
                    target="_blank"
                    rel="noopener"
                    class="d-flex align-items-center px-3 py-2 text-white text-decoration-none rounded product-link"
                  >
                    <div
                      class="product-icon-wrapper"
                      :class="getProductoIconObj(prod.tipo_producto).colorClass"
                    >
                      <i class="bi" :class="getProductoIconObj(prod.tipo_producto).iconClass"></i>
                    </div>
                    <span class="text-truncate flex-grow-1" style="min-width: 0">
                      {{ prod.titulo }}
                    </span>
                  </a>
                  <div
                    v-else
                    class="d-flex align-items-center px-3 py-2 text-white opacity-75 border-bottom border-light border-opacity-25"
                  >
                    <div
                      class="product-icon-wrapper"
                      :class="getProductoIconObj(prod.tipo_producto).colorClass"
                    >
                      <i class="bi" :class="getProductoIconObj(prod.tipo_producto).iconClass"></i>
                    </div>
                    <span class="text-truncate flex-grow-1" style="min-width: 0">
                      {{ prod.titulo }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section class="detail-meta-panel mt-4" aria-label="Detalles adicionales">
          <div class="detail-meta-list">
            <div v-if="investigacion.entidad_solicitante" class="detail-meta-item">
              <span class="text-muted">Entidad solicitante</span>
              <strong>{{ investigacion.entidad_solicitante }}</strong>
            </div>

            <div v-if="investigacion.linea_investigacion" class="detail-meta-item">
              <span class="text-muted">Línea de investigación</span>
              <strong>{{ investigacion.linea_investigacion }}</strong>
            </div>

            <div v-if="investigacion.investigadores" class="detail-meta-item">
              <span class="text-muted">Investigador(es)</span>
              <strong>{{ investigacion.investigadores }}</strong>
            </div>

            <div v-if="investigacion.expediente_orfeo" class="detail-meta-item">
              <span class="text-muted">Expediente</span>
              <strong>{{ investigacion.expediente_orfeo }}</strong>
            </div>

            <div v-if="investigacion.carpeta_productos" class="detail-meta-item">
              <span class="text-muted">Carpeta productos</span>
              <strong>
                <a
                  :href="investigacion.carpeta_productos"
                  target="_blank"
                  rel="noopener"
                  class="folder-products-icon-link"
                  aria-label="Ver carpeta de productos"
                >
                  <i class="bi bi-folder-fill" aria-hidden="true"></i>
                </a>
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  investigacion: {
    type: Object,
    default: null,
  },
  productos: {
    type: Array,
    default: () => [],
  },
  hallazgos: {
    type: Array,
    default: () => [],
  },
  baseUrl: {
    type: String,
    default: '/',
  },
})

const emit = defineEmits(['back'])
const activeHallazgoIndex = ref(0)
const carouselProgressKey = ref(0)
let hallazgosInterval = null

const activeHallazgo = computed(() => props.hallazgos[activeHallazgoIndex.value] ?? {})

const stopHallazgosCarousel = () => {
  if (!hallazgosInterval) return
  clearInterval(hallazgosInterval)
  hallazgosInterval = null
}

const startHallazgosCarousel = () => {
  stopHallazgosCarousel()
  if (props.hallazgos.length <= 1) return

  hallazgosInterval = setInterval(() => {
    activeHallazgoIndex.value = (activeHallazgoIndex.value + 1) % props.hallazgos.length
    carouselProgressKey.value += 1
  }, 8000)
}

const setActiveHallazgo = (index) => {
  activeHallazgoIndex.value = index
  carouselProgressKey.value += 1
  startHallazgosCarousel()
}

watch(
  () => props.hallazgos,
  () => {
    activeHallazgoIndex.value = 0
    carouselProgressKey.value += 1
    startHallazgosCarousel()
  },
  { deep: true },
)

onMounted(startHallazgosCarousel)
onBeforeUnmount(stopHallazgosCarousel)

const normalizeTipoProducto = (tipo) =>
  String(tipo ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const getProductoIconObj = (tipo) => {
  const normalizedTipo = normalizeTipoProducto(tipo)
  let iconClass = 'bi-file-earmark'
  let colorClass = 'producto-general'

  if (normalizedTipo === 'informe final') {
    iconClass = 'bi-file-earmark-text'
    colorClass = 'producto-pdf'
  } else if (normalizedTipo === 'presentacion') {
    iconClass = 'bi-display'
    colorClass = 'producto-presentacion'
  } else if (['visualizacion/infografia', 'visualizacion', 'geovisor'].includes(normalizedTipo)) {
    iconClass = 'bi-bar-chart'
    colorClass = 'producto-dataviz'
  } else if (normalizedTipo === 'base de datos') {
    iconClass = 'bi-table'
    colorClass = 'producto-db'
  } else if (normalizedTipo === 'informe cuantitativo') {
    iconClass = 'bi-file-earmark-text'
    colorClass = 'producto-cuantitativo'
  } else if (normalizedTipo === 'audiovisual') {
    iconClass = 'bi-play-circle'
    colorClass = 'producto-audiovisual'
  }

  return { iconClass, colorClass }
}
</script>

<style scoped>
.investigacion-descripcion {
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.detail-purple-block {
  background: linear-gradient(135deg, #261446 0%, #4f2d84 100%);
  color: white;
  min-height: 450px;
}

.detail-yellow-title {
  color: #f8be4b;
  font-size: 2.15rem;
  font-weight: 900 !important;
  line-height: 1.12;
}

.detail-eyebrow,
.detail-year-label {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.detail-eyebrow {
  color: #f8be4b;
  text-transform: uppercase;
}

.detail-year-label {
  padding: 0.25rem 0.75rem;
  background-color: rgba(255, 217, 111, 0.16);
  color: #ffd96f;
}

.findings-carousel,
.findings-empty-light {
  min-height: 230px;
  border: 1px solid #ededf0;
  border-radius: 12px;
  background-color: #ffffff;
  padding: 1rem;
}

.findings-timer {
  width: 100%;
  height: 0.2rem;
  border-radius: 999px;
  margin-bottom: 0.9rem;
  background-color: #7c3a95;
  transform-origin: left center;
  animation: finding-timer-shrink 8s linear forwards;
}

.findings-indicators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}

.finding-indicator {
  display: inline-flex;
  min-width: 1.85rem;
  min-height: 1.55rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8d8de;
  border-radius: 999px;
  background-color: #ffffff;
  padding: 0.1rem 0.55rem;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
}

.finding-indicator.active {
  border-color: #7c3a95;
  background-color: #7c3a95;
  color: #ffffff;
}

.finding-slide {
  min-width: 0;
}

.findings-title {
  color: #7c3a95;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.finding-heading {
  color: #50328c;
  font-size: 0.98rem;
  line-height: 1.35;
}

.finding-text {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.finding-value {
  color: #50328c;
  font-size: 0.9rem;
}

.findings-empty-light {
  color: #6b7280;
}

.detail-meta-panel {
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 1rem 1.15rem;
}

.detail-meta-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0;
  align-items: center;
}

.detail-meta-item {
  display: inline-flex;
  gap: 0.4rem;
  align-items: baseline;
  color: #111827;
  font-size: 0.85rem;
  line-height: 1.25;
}

.detail-meta-item:not(:last-child)::after {
  margin: 0 0.85rem;
  color: #c9cdd3;
  content: '·';
  font-weight: 400;
}

.detail-meta-item span {
  color: #8a9099 !important;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.detail-meta-item strong {
  color: #171717;
  font-weight: 750;
}

.product-link {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.product-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.product-icon-wrapper {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  margin-right: 10px;
  background-color: white;
  font-size: 0.9rem;
}

.producto-general {
  color: #50328c;
}

.producto-pdf,
.producto-audiovisual {
  color: #ea4335;
}

.producto-db {
  color: #30a338;
}

.producto-presentacion {
  color: #cc9111;
}

.producto-cuantitativo {
  color: #1450b3;
}

.producto-dataviz {
  color: #c99e05;
}

.folder-products-icon-link {
  display: inline-flex;
  align-items: center;
  color: #171717;
  font-size: 1.05rem;
  line-height: 1;
  text-decoration: none;
}

.folder-products-icon-link:hover,
.folder-products-icon-link:focus {
  color: #4b5563;
}

@keyframes finding-timer-shrink {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

@media (max-width: 575.98px) {
  .detail-purple-block {
    min-height: 0;
  }
}
</style>
