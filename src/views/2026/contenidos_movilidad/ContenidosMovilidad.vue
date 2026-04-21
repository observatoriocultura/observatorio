<template>
  <section class="contenidos-movilidad container py-4">
    <h1 class="h3 mb-4 text-center">Productos y Contenidos</h1>
    <p class="text-center">Convenio 611</p>
    <p class="text-center">
      Secretaría Distrital de Movilidad y Secretaría de Cultura, Recreación y Deporte
    </p>

    <div class="busqueda-contenidos mx-auto mb-4">
      <input
        v-model="busqueda"
        class="form-control busqueda-input"
        type="search"
        placeholder="Buscar contenidos"
        aria-label="Buscar contenidos"
      />
    </div>

    <p class="contador-contenidos text-center text-secondary mb-4">
      {{ contenidosFiltrados.length }} de {{ contenidos.length }} contenidos
    </p>

    <p v-if="loading" class="text-secondary">Cargando contenidos...</p>
    <p v-else-if="error" class="text-danger">{{ error }}</p>

    <div v-else class="row g-3">
      <article
        v-for="contenido in contenidosFiltrados"
        :key="contenido.nombre"
        class="col-12 col-md-6"
      >
        <a
          :href="contenido.link"
          class="contenido-card h-100 p-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="d-flex align-items-start gap-3">
            <i
              :class="[contenido.tipo.icon, contenido.tipo.colorClass]"
              class="contenido-icon"
              aria-hidden="true"
            ></i>

            <div>
              <h2 class="h5 mb-2">{{ contenido.nombre }}</h2>
              <p class="mb-0 text-secondary">{{ contenido.descripcion }}</p>
            </div>
          </div>

          <p v-if="contenido.fecha_actualizacion" class="contenido-fecha mb-0 mt-auto">
            Actualizado: {{ contenido.fecha_actualizacion }}
            <span class="text-secondary">({{ contenido.actualizacion_relativa }})</span>
          </p>
        </a>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Papa from 'papaparse'
import { getTipoContenido } from './constants'

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GwVEnK8omcqSUf_LSMsb7wTTYC6m2FbBnnkL6dzU_xI/export?format=csv&gid=1554384367'

const contenidos = ref([])
const loading = ref(true)
const error = ref(null)
const busqueda = ref('')

const normalizarTextoBusqueda = (texto) => {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const contenidosFiltrados = computed(() => {
  const textoBusqueda = normalizarTextoBusqueda(busqueda.value.trim())

  if (!textoBusqueda) {
    return contenidos.value
  }

  return contenidos.value.filter((contenido) => {
    const textoContenido = normalizarTextoBusqueda(
      [
        contenido.nombre,
        contenido.descripcion,
        contenido.tipo.nombre,
        contenido.tipo_publicacion,
      ].join(' '),
    )

    return textoContenido.includes(textoBusqueda)
  })
})

const obtenerTipoDesdeFila = (fila) => {
  return fila.tipo || fila.tipo_contenido || fila['tipo de contenido'] || ''
}

const parsearFecha = (fecha) => {
  if (!fecha) return null

  const fechaLimpia = fecha.trim()
  const fechaIso = new Date(fechaLimpia)

  if (!Number.isNaN(fechaIso.getTime())) {
    return fechaIso
  }

  const partes = fechaLimpia.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)

  if (!partes) return null

  const [, dia, mes, anio] = partes
  const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia))

  return Number.isNaN(fechaLocal.getTime()) ? null : fechaLocal
}

const obtenerActualizacionRelativa = (fecha) => {
  const fechaActualizacion = parsearFecha(fecha)

  if (!fechaActualizacion) {
    return 'fecha no disponible'
  }

  const diferenciaMs = Date.now() - fechaActualizacion.getTime()
  const diferenciaDias = Math.floor(diferenciaMs / 86400000)

  if (diferenciaDias < 1) {
    return 'hace menos de un día'
  }

  if (diferenciaDias < 30) {
    return `hace ${diferenciaDias} ${diferenciaDias === 1 ? 'día' : 'días'}`
  }

  const diferenciaMeses = Math.floor(diferenciaDias / 30)

  if (diferenciaMeses < 12) {
    return `hace ${diferenciaMeses} ${diferenciaMeses === 1 ? 'mes' : 'meses'}`
  }

  const diferenciaAnios = Math.floor(diferenciaMeses / 12)

  return `hace ${diferenciaAnios} ${diferenciaAnios === 1 ? 'año' : 'años'}`
}

const normalizarContenido = (fila) => {
  const tipo = getTipoContenido(obtenerTipoDesdeFila(fila))
  const fechaActualizacion = fila.fecha_actualizacion?.trim() || ''

  return {
    nombre: fila.nombre?.trim() || '',
    descripcion: fila.descripcion?.trim() || '',
    link: fila.link?.trim() || '#',
    fecha_actualizacion: fechaActualizacion,
    actualizacion_relativa: obtenerActualizacionRelativa(fechaActualizacion),
    tipo_publicacion: fila.tipo_publicacion?.trim() || '',
    tipo,
  }
}

onMounted(async () => {
  try {
    const response = await fetch(CSV_URL)

    if (!response.ok) {
      throw new Error('Error al descargar el archivo CSV')
    }

    const csvText = await response.text()

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        contenidos.value = results.data
          .map(normalizarContenido)
          .filter((contenido) => contenido.tipo_publicacion)
        loading.value = false
      },
      error: (err) => {
        console.error('Error parseando CSV:', err)
        error.value = 'Error al procesar los contenidos.'
        loading.value = false
      },
    })
  } catch (err) {
    console.error('Error de red:', err)
    error.value = 'No se pudieron cargar los contenidos.'
    loading.value = false
  }
})
</script>

<style scoped>
.contenidos-movilidad {
  --movilidad-accent: #a2ae00;
}

.contenidos-movilidad h1::after {
  display: block;
  width: 72px;
  height: 3px;
  margin: 0.75rem auto 0;
  border-radius: 999px;
  background: var(--movilidad-accent);
  content: '';
}

.busqueda-contenidos {
  max-width: 720px;
}

.busqueda-input {
  border-color: #d6dc8a;
  border-radius: 19px;
  height: 38px;
}

.busqueda-input:focus {
  border-color: var(--movilidad-accent);
  box-shadow: 0 0 0 0.2rem rgba(162, 174, 0, 0.18);
}

.contador-contenidos {
  color: var(--movilidad-accent) !important;
  font-size: 0.9rem;
  font-weight: 600;
}

.contenido-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.contenido-card:hover,
.contenido-card:focus {
  border-color: var(--movilidad-accent);
  box-shadow: 0 0.5rem 1.25rem rgba(33, 37, 41, 0.08);
  color: inherit;
  transform: translateY(-2px);
}

.contenido-icon {
  flex: 0 0 auto;
  font-size: 1.5rem;
  line-height: 1;
}

.contenido-fecha {
  border-top: 1px solid rgba(162, 174, 0, 0.22);
  color: #495057;
  font-size: 0.85rem;
  padding-top: 0.75rem;
}

.tipo-documento {
  color: #0d6efd;
}

.tipo-hoja-calculo {
  color: #198754;
}

.tipo-carpeta {
  color: #f0ad00;
}

.tipo-presentacion {
  color: #dc3545;
}

.tipo-dataviz {
  color: #6f42c1;
}

.tipo-default {
  color: #6c757d;
}
</style>
