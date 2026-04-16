<template>
  <div class="solicitudes-pai-page container-fluid pb-4 pt-1">
    <!-- Navegación por Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-tabs justify-content-center">
          <li class="nav-item">
            <router-link
              class="nav-link text-secondary"
              exact-active-class="active text-light"
              to="/2026/solicitudes-pai"
              exact
            >
              Inicio
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link text-secondary"
              active-class="active text-light"
              to="/2026/solicitudes-pai/listado"
            >
              Listado
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link text-secondary"
              active-class="active text-light"
              to="/2026/solicitudes-pai/detalle"
            >
              Detalles
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link text-secondary"
              active-class="active text-light"
              to="/2026/solicitudes-pai/tablero"
            >
              <i class="bi bi-bar-chart-fill me-1"></i> Tablero
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Vistas Hijas -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Papa from 'papaparse'

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1_teRgJgAa9IlbAoX4K0PFSGJ3Pi0PffLZL4JiU8n50M/export?format=csv&gid=101779797'

const route = useRoute()
const router = useRouter()

const solicitudes = ref([])
const loading = ref(true)
const error = ref(null)
const solicitudActual = ref(null)

const entidadFiltro = ref('')
const dependenciaFiltro = ref('')
const lineaFiltro = ref('')
const seleccionadaFiltro = ref('')
const lineasInvestigacion = ref(['Sector Cultura', 'Cultura Ciudadana', 'Mixta'])

const opcionesSeleccionada = ref([
  { value: 'Sí', icon: 'bi bi-check-circle text-success', background: '#d4edbc', valueSum: 1 },
  { value: 'No', icon: 'bi bi-x-circle text-danger', background: '#f8d7da', valueSum: 0 },
  { value: 'Por revisar', icon: 'bi bi-clock text-warning', background: '#fff3cd', valueSum: 0 },
  {
    value: 'Sí (Agrupada)',
    icon: 'bi bi-collection text-info',
    background: '#cfe2ff',
    valueSum: 0,
  },
  { value: 'Por convenio', icon: 'bi bi-handshake text-info', background: '#cff4fc', valueSum: 1 },
])

const opcionesEntidades = ref([
  {
    nombreCorto: 'SCRD',
    nombreCompleto: 'Secretaría Distrital de Cultura, Recreación y Deporte',
    background: '#D9D2E9',
  },
  {
    nombreCorto: 'IDARTES',
    nombreCompleto: 'Instituto Distrital de las Artes',
    background: '#EAD1DC',
  },
  { nombreCorto: 'Canal Capital', nombreCompleto: 'Canal Capital', background: '#F4CCCC' },
  {
    nombreCorto: 'IDPC',
    nombreCompleto: 'Instituto Distrital de Patrimonio Cultural',
    background: '#FFE599',
  },
  {
    nombreCorto: 'IDRD',
    nombreCompleto: 'Instituto Distrital de Recreación y Deporte',
    background: '#C9DAF8',
  },
  {
    nombreCorto: 'IDPYBA',
    nombreCompleto: 'Instituto Distrital de Protección y Bienestar Animal',
    background: '#D5E3B3',
  },
])

const dependenciasUnicas = computed(() => {
  return solicitudes.value
    .filter((item) => {
      const mostrarM = item.mostrar && item.mostrar.trim() === 'Sí'
      const entidadM = entidadFiltro.value === '' || item.entidad_corto === entidadFiltro.value
      return mostrarM && entidadM
    })
    .map((item) => item.dependencia_corto?.trim())
    .filter((v, i, a) => v && v.trim() !== '' && a.indexOf(v) === i)
    .sort()
})

const solicitudesFiltradas = computed(() => {
  return solicitudes.value.filter((item) => {
    const mostrarM = item.mostrar && item.mostrar.trim() === 'Sí'
    const entidadM = entidadFiltro.value === '' || item.entidad_corto === entidadFiltro.value
    const dependenciaM =
      dependenciaFiltro.value === '' || item.dependencia_corto?.trim() === dependenciaFiltro.value
    const lineaM = lineaFiltro.value === '' || item.linea_investigacion === lineaFiltro.value
    const seleccionadaM =
      seleccionadaFiltro.value === '' || item.seleccionada === seleccionadaFiltro.value
    return mostrarM && entidadM && dependenciaM && lineaM && seleccionadaM
  })
})

const totalDisponibles = computed(() => {
  return solicitudes.value.filter((item) => item.mostrar && item.mostrar.trim() === 'Sí').length
})

provide('solicitudesData', {
  solicitudes,
  loading,
  error,
  opcionesSeleccionada,
  entidadFiltro,
  dependenciaFiltro,
  lineaFiltro,
  seleccionadaFiltro,
  lineasInvestigacion,
  opcionesEntidades,
  dependenciasUnicas,
  solicitudesFiltradas,
  totalDisponibles,
  solicitudActual,
})
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
        solicitudes.value = results.data
        loading.value = false

        const numTarget = route.query.num_solicitud || '1'
        const encontrada = solicitudes.value.find((s) => String(s.num) === String(numTarget))
        if (encontrada) {
          solicitudActual.value = encontrada
        } else if (solicitudes.value.length > 0) {
          solicitudActual.value =
            solicitudes.value.find((s) => String(s.num) === '1') || solicitudes.value[0]
        }
      },
      error: (err) => {
        console.error('Error parseando CSV:', err)
        error.value = 'Error al procesar los datos.'
        loading.value = false
      },
    })
  } catch (err) {
    console.error('Error de red:', err)
    error.value = 'No se pudo cargar la información. Verifique su conexión.'
    loading.value = false
  }
})

watch(solicitudActual, (newVal) => {
  if (newVal && newVal.num) {
    if (route.query.num_solicitud !== String(newVal.num)) {
      router.replace({ ...route, query: { ...route.query, num_solicitud: newVal.num } })
    }
  }
})

watch(entidadFiltro, () => {
  if (dependenciaFiltro.value && !dependenciasUnicas.value.includes(dependenciaFiltro.value)) {
    dependenciaFiltro.value = ''
  }
})
</script>

<style>
.solicitudes-pai-page {
  --solicitudes-pai-bg: #fcfcfc;
  min-height: 100vh;
  background-color: var(--solicitudes-pai-bg);
}

.solicitudes-pai-page .nav-tabs {
  background-color: var(--solicitudes-pai-bg);
}

.solicitudes-pai-page .nav-tabs .nav-link {
  background-color: transparent;
}

.solicitudes-pai-page .nav-tabs .nav-link.active {
  background-color: transparent;
  border-color: transparent transparent #654096;
  border-bottom-width: 2px;
  color: #654096 !important;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.table td {
  font-size: 0.95rem;
}

.linea-cultura-ciudadana {
  background-color: #ffe5a0;
}
.linea-sector-cultura {
  background-color: #e6cff2;
}
.linea-mixta {
  background-color: #bfe1f6;
}

/** Clases para las entidades */
.entidad-scrd {
  background-color: #d9d2e9;
}
.entidad-idartes {
  background-color: #ead1dc;
}
.entidad-canal-capital {
  background-color: #f4cccc;
}
.entidad-idpc {
  background-color: #ffe599;
}
.entidad-idrd {
  background-color: #c9daf8;
}
</style>
