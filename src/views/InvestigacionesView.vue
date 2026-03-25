<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else>
      <div v-if="investigaciones.length === 0" class="alert alert-info">
        No hay investigaciones disponibles.
      </div>
      <div v-show="section === 'results'">
        <div class="d-flex justify-content-center mb-4 mt-2">
          <input
            type="text"
            v-model="searchInput"
            class="form-control px-4 border-0 shadow-sm"
            style="max-width: 920px; height: 40px; background-color: #f0f4f9; border-radius: 20px"
            placeholder="Buscar investigaciones..."
          />
        </div>

        <div
          v-if="investigacionesFiltradas.length === 0"
          class="alert alert-warning text-center mx-auto"
          style="max-width: 920px"
        >
          No se encontraron investigaciones para tu búsqueda.
        </div>

        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          <div v-for="inv in investigacionesFiltradas" :key="inv.id" class="col">
            <a
              href="#"
              @click.prevent="showDetail(inv)"
              rel="noopener"
              class="text-decoration-none text-dark d-block h-100 video-card-link"
            >
              <div class="card h-100 border-0 bg-transparent">
                <img
                  :src="`public/content/investigaciones/thumbnails/${inv.id}.jpg`"
                  class="card-img-top rounded-4 mb-2 object-fit-cover"
                  style="aspect-ratio: 16/9"
                  :alt="inv.titulo"
                  @error="
                    (e) => (e.target.src = 'public/content/investigaciones/thumbnails/nd.jpg')
                  "
                />
                <div class="card-body p-0">
                  <h6 class="card-title fw-bold mb-1 video-title" :title="inv.titulo">
                    {{ inv.titulo }}
                  </h6>
                  <div class="text-muted small video-subtitle">
                    <div class="text-truncate" :title="inv.entidad_solicitante">
                      {{ inv.entidad_solicitante }}
                    </div>
                    <div>{{ inv.anio }}</div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Detalle -->
      <div v-if="section === 'detail' && currentInvestigacion" class="mt-2">
        <button @click="goBack" class="btn btn-light border rounded-pill mb-3 fw-bold">
          &larr; Volver
        </button>
        <div class="row">
          <!-- Bloque Izquierdo: 68% (Aprox col-lg-8) -->
          <div class="col-lg-8 mb-4">
            <div class="p-4 p-md-5 rounded-4 h-100 detail-purple-block">
              <div class="row h-100">
                <!-- Interna Izquierda: Título y descripción -->
                <div class="col-md-7 mb-4 mb-md-0">
                  <h3 class="fw-bold mb-3 detail-yellow-title">
                    {{ currentInvestigacion.titulo }}
                  </h3>
                  <div class="d-flex align-items-center mb-4">
                    <span class="fw-bold me-2">{{ currentInvestigacion.entidad_solicitante }}</span>
                    <span class="small opacity-75">&bull; {{ currentInvestigacion.anio }}</span>
                  </div>
                  <p class="mb-0 text-white mt-2" style="white-space: pre-wrap; font-size: 0.95rem">
                    {{ currentInvestigacion.descripcion || 'Sin descripción disponible.' }}
                  </p>
                </div>

                <!-- Interna Derecha: Listado de productos -->
                <div class="col-md-5 ps-md-4">
                  <div v-if="productosFiltrados.length === 0" class="small opacity-75 mt-2">
                    No hay productos asociados registrados.
                  </div>
                  <ul v-else class="list-unstyled mb-0">
                    <li v-for="(prod, idx) in productosFiltrados" :key="idx" class="mb-2">
                      <a
                        v-if="prod.url && prod.url !== ''"
                        :href="prod.url"
                        target="_blank"
                        rel="noopener"
                        class="d-flex align-items-center px-3 py-2 text-white text-decoration-none rounded border border-light border-opacity-25 product-link"
                      >
                        <div
                          class="product-icon-wrapper"
                          :class="getProductoIconObj(prod.tipo_producto).colorClass"
                        >
                          <i
                            class="bi"
                            :class="getProductoIconObj(prod.tipo_producto).iconClass"
                          ></i>
                        </div>
                        <span class="text-truncate flex-grow-1" style="min-width: 0">{{
                          prod.titulo
                        }}</span>
                      </a>
                      <div
                        v-else
                        class="d-flex align-items-center px-3 py-2 text-white opacity-75 border-bottom border-light border-opacity-25"
                      >
                        <div
                          class="product-icon-wrapper"
                          :class="getProductoIconObj(prod.tipo_producto).colorClass"
                        >
                          <i
                            class="bi"
                            :class="getProductoIconObj(prod.tipo_producto).iconClass"
                          ></i>
                        </div>
                        <span class="text-truncate flex-grow-1" style="min-width: 0">{{
                          prod.titulo
                        }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Thumbnail y Detalles técnicos -->
          <div class="col-lg-4 mb-4">
            <img
              :src="`public/content/investigaciones/thumbnails/${currentInvestigacion.id}.jpg`"
              class="w-100 rounded-4 mb-4 object-fit-cover shadow-sm"
              style="aspect-ratio: 16/9"
              :alt="currentInvestigacion.titulo"
              @error="(e) => (e.target.src = 'public/content/investigaciones/thumbnails/nd.jpg')"
            />

            <div class="bg-light p-4 rounded-4 border">
              <h5 class="fw-bold mb-3">Detalles técnicos</h5>

              <div v-if="currentInvestigacion.linea_investigacion" class="mb-3">
                <h6 class="text-muted small mb-1 fw-bold">Línea de investigación</h6>
                <div>{{ currentInvestigacion.linea_investigacion }}</div>
              </div>

              <div v-if="currentInvestigacion.investigadores" class="mb-3">
                <h6 class="text-muted small mb-1 fw-bold">Investigador(es)</h6>
                <div>{{ currentInvestigacion.investigadores }}</div>
              </div>

              <div v-if="currentInvestigacion.estado" class="mb-3">
                <h6 class="text-muted small mb-1 fw-bold">Estado</h6>
                <div>{{ currentInvestigacion.estado }}</div>
              </div>

              <div v-if="currentInvestigacion.carpeta_productos" class="mt-4">
                <a
                  :href="currentInvestigacion.carpeta_productos"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-primary w-100 rounded-pill fw-bold"
                >
                  Ver carpeta de productos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const investigaciones = ref([])
const productos = ref([])
const loading = ref(true)
const section = ref('results')
const currentInvestigacion = ref(null)
const searchInput = ref('')

const removeDiacritics = (text) => {
  return text ? text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
}

const investigacionesFiltradas = computed(() => {
  if (!searchInput.value.trim()) return investigaciones.value

  // Separar los términos de búsqueda ignorando espacios múltiples y limpiando tildes
  const terms = removeDiacritics(searchInput.value).trim().split(/\s+/)

  return investigaciones.value.filter((inv) => {
    // Unir todos los campos en un solo bloque de texto y limpiarle tildes
    const fullText = removeDiacritics(
      [
        inv.titulo,
        inv.descripcion,
        inv.linea_investigacion,
        inv.palabras_clave,
        inv.anio
      ].filter(Boolean).join(' ')
    )

    // Retorna true si "todas" las palabras (every) están en los campos combinados del texto
    return terms.every(term => fullText.includes(term))
  })
})

const productosFiltrados = computed(() => {
  if (!currentInvestigacion.value) return []
  return productos.value.filter(
    (p) =>
      p.investigacion_id === currentInvestigacion.value.id &&
      p.titulo &&
      p.incluir_en_ficha === 'Sí' &&
      p.url &&
      p.url.trim() !== '',
  )
})

const showDetail = (inv) => {
  currentInvestigacion.value = inv
  section.value = 'detail'
  window.scrollTo(0, 0)

  router.push({ query: { investigacion_id: inv.id } })
}

const goBack = () => {
  section.value = 'results'
  currentInvestigacion.value = null

  const query = { ...route.query }
  delete query.investigacion_id
  router.push({ query })
}

const getProductoIconObj = (tipo) => {
  let iconClass = 'bi-file-earmark'
  let colorClass = 'producto-general'

  if (tipo === 'Informe final') {
    iconClass = 'bi-file-earmark-text'
    colorClass = 'producto-pdf'
  } else if (tipo === 'Presentación') {
    iconClass = 'bi-display'
    colorClass = 'producto-presentacion'
  } else if (['Visualización/Infografía', 'Visualización', 'Geovisor'].includes(tipo)) {
    iconClass = 'bi-bar-chart'
    colorClass = 'producto-dataviz'
  } else if (tipo === 'Base de datos') {
    iconClass = 'bi-table'
    colorClass = 'producto-db'
  } else if (tipo === 'Informe cuantitativo') {
    iconClass = 'bi-file-earmark-text'
    colorClass = 'producto-cuantitativo'
  } else if (tipo === 'Audiovisual') {
    iconClass = 'bi-play-circle'
    colorClass = 'producto-audiovisual'
  }

  return { iconClass, colorClass }
}

onMounted(async () => {
  try {
    const res = await fetch('public/content/investigaciones/investigaciones.json')
    if (!res.ok) throw new Error('No se pudo cargar el archivo de investigaciones')
    const data = await res.json()
    investigaciones.value = data

    try {
      const prodRes = await fetch('public/content/investigaciones/productos.json')
      if (prodRes.ok) {
        productos.value = await prodRes.json()
      }
    } catch (e) {
      console.error('Error cargando productos', e)
    }

    // Si la URL trae un ID por vue-router, cargamos esa investigación
    const invId = route.query.investigacion_id
    if (invId) {
      const found = data.find((i) => String(i.id) === String(invId))
      if (found) {
        currentInvestigacion.value = found
        section.value = 'detail'
      }
    }
  } catch {
    investigaciones.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.video-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 1rem;
  line-height: 1.25;
}

.video-card-link:hover .video-title {
  color: #0d6efd;
}

.video-subtitle {
  font-size: 0.875rem;
}

.detail-purple-block {
  background: linear-gradient(135deg, #261446 0%, #4f2d84 100%);
  color: white;
}

.detail-yellow-title {
  color: #f8be4b;
  font-weight: 900 !important;
  font-size: 2.25rem;
}

.product-link {
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.05);
}

.product-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.product-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid currentColor;
  background-color: white;
  margin-right: 12px;
  flex-shrink: 0;
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
</style>
