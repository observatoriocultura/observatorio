<template>
  <div v-if="investigacion" class="mt-2">
    <button class="btn btn-light border rounded-pill mb-3 fw-bold" type="button" @click="emit('back')">
      &larr; Volver
    </button>
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="p-4 p-md-5 rounded-4 h-100 detail-purple-block">
          <div class="row h-100">
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
      </div>

      <div class="col-lg-4 mb-4">
        <img
          :src="`${baseUrl}content/investigaciones/thumbnails/${investigacion.id}.jpg`"
          class="w-100 rounded-4 mb-4 object-fit-cover shadow-sm"
          style="aspect-ratio: 16/9"
          :alt="investigacion.titulo"
          @error="(event) => (event.target.src = `${baseUrl}content/investigaciones/thumbnails/nd.jpg`)"
        />

        <div class="bg-light p-4 rounded-4 border">
          <div v-if="investigacion.entidad_solicitante" class="mb-3">
            <h6 class="text-muted small mb-1 fw-bold">Entidad solicitante</h6>
            <div>{{ investigacion.entidad_solicitante }}</div>
          </div>

          <div v-if="investigacion.linea_investigacion" class="mb-3">
            <h6 class="text-muted small mb-1 fw-bold">Línea de investigación</h6>
            <div>{{ investigacion.linea_investigacion }}</div>
          </div>

          <div v-if="investigacion.investigadores" class="mb-3">
            <h6 class="text-muted small mb-1 fw-bold">Investigador(es)</h6>
            <div>{{ investigacion.investigadores }}</div>
          </div>

          <div v-if="investigacion.expediente_orfeo" class="mb-3">
            <h6 class="text-muted small mb-1 fw-bold">Expediente</h6>
            <div>{{ investigacion.expediente_orfeo }}</div>
          </div>

          <div v-if="investigacion.carpeta_productos" class="mt-4">
            <a
              :href="investigacion.carpeta_productos"
              target="_blank"
              rel="noopener"
              class="btn folder-products-btn w-100 rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2"
            >
              <i class="bi bi-folder-fill folder-products-icon" aria-hidden="true"></i>
              Ver carpeta de productos
            </a>
          </div>
        </div>
      </div>
    </div>

    <section v-if="hallazgos.length > 0" class="findings-section mt-4 mb-5">
      <h4 class="findings-title text-center fw-bold mb-4">Principales hallazgos</h4>
      <div class="findings-list mx-auto">
        <article
          v-for="(hallazgo, idx) in hallazgos"
          :key="`${hallazgo.investigacion_id}-${hallazgo.orden}-${idx}`"
          class="finding-item"
        >
          <div class="finding-number">{{ hallazgo.orden || idx + 1 }}</div>
          <div class="finding-content">
            <h5 class="finding-heading fw-bold mb-1">{{ hallazgo.titulo }}</h5>
            <p class="finding-text mb-0">{{ hallazgo.texto }}</p>
            <div
              v-if="hallazgo.valor || hallazgo.unidad_medida"
              class="finding-value fw-semibold mt-2"
            >
              {{ [hallazgo.valor, hallazgo.unidad_medida].filter(Boolean).join(' ') }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
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
  font-size: 0.95rem;
  white-space: pre-wrap;
}

.detail-purple-block {
  background: linear-gradient(135deg, #261446 0%, #4f2d84 100%);
  color: white;
}

.detail-yellow-title {
  color: #f8be4b;
  font-size: 2.25rem;
  font-weight: 900 !important;
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

.findings-section {
  color: #111827;
}

.findings-title {
  color: #f8be4b;
  letter-spacing: 0;
}

.findings-list {
  max-width: 860px;
}

.finding-item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 20px;
  margin-bottom: 1.5rem;
}

.finding-number {
  color: #f0a400;
  font-size: 2rem;
  line-height: 1;
  text-align: right;
}

.finding-heading {
  color: #50328c;
  font-size: 1rem;
  line-height: 1.35;
}

.finding-text {
  font-size: 1rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.finding-value {
  color: #50328c;
}

.product-link {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.product-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.product-icon-wrapper {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  margin-right: 12px;
  background-color: white;
  font-size: 1rem;
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

.folder-products-icon {
  color: #ffd96f;
}

.folder-products-btn {
  border: 2px solid #f8be4b;
  background-color: #ffffff;
  color: #50328c;
}

.folder-products-btn:hover,
.folder-products-btn:focus-visible {
  border-color: #f0a400;
  background-color: #fff8e5;
  color: #50328c;
}

@media (max-width: 575.98px) {
  .finding-item {
    grid-template-columns: 40px 1fr;
    gap: 14px;
  }

  .finding-number {
    font-size: 1.6rem;
  }
}
</style>
