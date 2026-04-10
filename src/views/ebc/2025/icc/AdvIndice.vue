<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import IndiceResumen from './indice/IndiceResumen.vue'
import IndiceTabla from './indice/IndiceTabla.vue'
import IndiceSubindices from './indice/IndiceSubindices.vue'
import IndiceLocalidades from './indice/IndiceLocalidades.vue'
import IndiceInfo from './indice/IndiceInfo.vue'

const codigoMedicion = inject('codigoMedicion')
const loading = ref(true)
const error = ref(null)
const iccData = ref([])
const indicesRef = ref([]) // especificación canónica de índices desde indices.json

/** Vista activa: resumen o tabla */
const vistaActiva = ref('tabla')

/**
 * Normaliza un string para comparación: minúsculas, sin acentos, sin espacios extra.
 */
const normalizar = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

/**
 * Cruza indices.json (referencia) con los indice_cod encontrados en icc.json.
 * Empareja por nombre normalizado para resolver la diferencia de códigos.
 * Cada objeto resultante tiene:
 *   - cod: indice_cod de icc.json (usado para buscar valores)
 *   - num: num de indices.json (orden canónico)
 *   - nombre, nombre_corto, nombre_largo, abreviatura, key, nivel (de indices.json)
 */
const indices = computed(() => {
  // Extraer indice_cod únicos de icc.json con su nombre
  const iccIndicesMap = new Map()
  iccData.value.forEach((d) => {
    if (!iccIndicesMap.has(d.indice_cod)) {
      iccIndicesMap.set(d.indice_cod, d.indice)
    }
  })

  // Cruzar con la referencia de indices.json por nombre normalizado
  return indicesRef.value
    .map((ref) => {
      const nombreRef = normalizar(ref.nombre)
      let matchedCod = null

      for (const [cod, nombre] of iccIndicesMap) {
        if (normalizar(nombre) === nombreRef) {
          matchedCod = cod
          break
        }
      }

      if (matchedCod === null) return null // sin match

      return {
        cod: matchedCod, // indice_cod de icc.json
        num: ref.num, // orden canónico
        nombre: ref.nombre,
        nombre_largo: ref.nombre_largo,
        nombre_corto: ref.nombre_corto,
        abreviatura: ref.abreviatura,
        key: ref.key,
        nivel: ref.nivel,
        descripcion: ref.descripcion,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.num - b.num)
})

/** Localidades únicas extraídas del JSON */
const localidades = computed(() => {
  const mapa = new Map()
  iccData.value.forEach((d) => {
    if (!mapa.has(d.localidad_cod)) {
      mapa.set(d.localidad_cod, { cod: d.localidad_cod, nombre: d.localidad })
    }
  })
  return Array.from(mapa.values()).sort((a, b) => a.cod - b.cod)
})

/**
 * Detecta cuántas mediciones (periodos) hay en el JSON.
 * Cuenta las ocurrencias de una combinación localidad+índice para deducir los periodos.
 */
const numPeriodos = computed(() => {
  if (!iccData.value.length) return 0
  const primeraLocalidad = iccData.value[0].localidad_cod
  const primerIndice = iccData.value[0].indice_cod
  return iccData.value.filter(
    (d) => d.localidad_cod === primeraLocalidad && d.indice_cod === primerIndice,
  ).length
})

/**
 * Datos organizados por localidad.
 * Estructura: { localidad_cod, localidad, indices: { [indice_cod]: [valor_p1, valor_p2, …] } }
 */
const datosPorLocalidad = computed(() => {
  const mapa = new Map()

  iccData.value.forEach((d) => {
    if (!mapa.has(d.localidad_cod)) {
      mapa.set(d.localidad_cod, {
        localidad_cod: d.localidad_cod,
        localidad: d.localidad,
        indices: {},
      })
    }
    const entry = mapa.get(d.localidad_cod)
    if (!entry.indices[d.indice_cod]) {
      entry.indices[d.indice_cod] = []
    }
    entry.indices[d.indice_cod].push(d.valor)
  })

  return Array.from(mapa.values()).sort((a, b) => a.localidad_cod - b.localidad_cod)
})

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL

    const [resIcc, resIndices] = await Promise.all([
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/icc.json`),
      fetch(`${baseUrl}content/mediciones/${codigoMedicion}/indices.json`),
    ])

    if (!resIcc.ok) throw new Error('No se pudo cargar los datos del índice (icc.json)')
    if (!resIndices.ok) throw new Error('No se pudo cargar la referencia de índices (indices.json)')

    iccData.value = await resIcc.json()
    indicesRef.value = await resIndices.json()
  } catch (e) {
    console.error(e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="adv-indice">
    <!-- Encabezado -->
    <header class="indice-header">
      <!-- Selector de vista -->
      <div class="vista-selector d-flex justify-content-center">
        <button
          class="vista-btn"
          :class="{ active: vistaActiva === 'info' }"
          @click="vistaActiva = 'info'"
        >
          <i class="bi bi-info-circle me-1"></i>Info
        </button>
        <button
          class="vista-btn"
          :class="{ active: vistaActiva === 'tabla' }"
          @click="vistaActiva = 'tabla'"
        >
          <i class="bi bi-table me-1"></i>Tabla
        </button>
        <button
          class="vista-btn"
          :class="{ active: vistaActiva === 'subindices' }"
          @click="vistaActiva = 'subindices'"
        >
          <i class="bi bi-layers me-1"></i>Subíndices
        </button>
        <button
          class="vista-btn"
          :class="{ active: vistaActiva === 'localidades' }"
          @click="vistaActiva = 'localidades'"
        >
          <i class="bi bi-geo-alt me-1"></i>Localidades
        </button>
        <button
          class="vista-btn"
          :class="{ active: vistaActiva === 'resumen' }"
          @click="vistaActiva = 'resumen'"
        >
          <i class="bi bi-grid-3x3-gap me-1"></i>Resumen
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="placeholder-loading">
      <div class="spinner"></div>
      <p>Cargando datos del índice...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-box">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Contenido -->
    <div v-else>
      <IndiceInfo v-show="vistaActiva === 'info'" :indices="indicesRef" />
      <IndiceResumen
        v-show="vistaActiva === 'resumen'"
        :datos-por-localidad="datosPorLocalidad"
        :indices="indices"
        :localidades="localidades"
        :num-periodos="numPeriodos"
      />
      <IndiceTabla
        v-show="vistaActiva === 'tabla'"
        :datos-por-localidad="datosPorLocalidad"
        :indices="indices"
        :localidades="localidades"
        :num-periodos="numPeriodos"
        :icc-data="iccData"
      />
      <IndiceSubindices
        v-show="vistaActiva === 'subindices'"
        :datos-por-localidad="datosPorLocalidad"
        :indices="indices"
        :localidades="localidades"
        :num-periodos="numPeriodos"
        :icc-data="iccData"
      />
      <IndiceLocalidades
        v-show="vistaActiva === 'localidades'"
        :datos-por-localidad="datosPorLocalidad"
        :indices="indices"
        :localidades="localidades"
        :num-periodos="numPeriodos"
        :icc-data="iccData"
      />
    </div>
  </div>
</template>

<style scoped>
.adv-indice {
  padding: 0.5rem 0;
}

.indice-header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.vista-selector {
  display: flex;
  gap: 0.25rem;
  background: #f4f5f7;
  border-radius: 10px;
  padding: 3px;
}

.vista-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vista-btn:hover {
  color: var(--color-primary);
}

.vista-btn.active {
  background: #fff;
  color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.placeholder-loading {
  text-align: center;
  padding: 4rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-box {
  text-align: center;
  padding: 3rem;
  background: #fff5f5;
  border-radius: var(--radius-premium);
  color: #c53030;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .indice-header {
    flex-direction: column;
  }
  .indice-title {
    font-size: 1.15rem;
  }
}
</style>
