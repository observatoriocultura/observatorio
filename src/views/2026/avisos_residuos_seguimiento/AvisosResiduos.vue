<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchGoogleSheetCsv } from '../../../utils/googleSheets'
import AvisosResiduosBarrios from './AvisosResiduosBarrios.vue'
import AvisosResiduosDataviz from './AvisosResiduosDataviz.vue'
import AvisosResiduosMenu from './AvisosResiduosMenu.vue'
import AvisosResiduosPorBarrio from './AvisosResiduosPorBarrio.vue'
import AvisosResiduosTablas from './AvisosResiduosTablas.vue'
import {
  sheetDateToIso,
  summarizeAvisosByBarrio,
  summarizeAvisosByBarrioAndMonth,
} from './avisosResiduos.js'

const SHEET_FILE_ID = '12EEkpPWrmgc7V-x69DpasVG78rojksTu8J_dUotTEjY'
const route = useRoute()

const datasets = ref([
  {
    id: 'avisos',
    title: 'Avisos',
    description: 'Registro de avisos y controles realizados por barrio.',
    gid: '975262668',
    rows: [],
    loading: true,
    error: '',
  },
  {
    id: 'barrios',
    title: 'Barrios',
    description: 'Información territorial y operativa de los barrios en seguimiento.',
    gid: '1714012506',
    rows: [],
    loading: true,
    error: '',
  },
])

const dateFrom = ref('')
const dateTo = ref('')

const currentTab = computed(() => {
  const tab = route.query.tab
  return ['por-barrio', 'calendario', 'tablas'].includes(tab) ? tab : 'barrios'
})

const avisosDataset = computed(() => datasets.value.find((dataset) => dataset.id === 'avisos'))
const barriosDataset = computed(() => datasets.value.find((dataset) => dataset.id === 'barrios'))

const avisosDateBounds = computed(() => {
  const dates = avisosDataset.value.rows
    .map((row) => sheetDateToIso(row.fecha))
    .filter(Boolean)
    .sort()

  return {
    min: dates[0] ?? '',
    max: dates.at(-1) ?? '',
  }
})

const filteredAvisos = computed(() => {
  const rows = avisosDataset.value.rows

  if (!dateFrom.value && !dateTo.value) return rows

  return rows.filter((row) => {
    const date = sheetDateToIso(row.fecha)

    return (
      date && (!dateFrom.value || date >= dateFrom.value) && (!dateTo.value || date <= dateTo.value)
    )
  })
})

const indicadoresPorBarrio = computed(() =>
  summarizeAvisosByBarrio(filteredAvisos.value, barriosDataset.value.rows),
)

const indicadoresPorBarrioYMes = computed(() =>
  summarizeAvisosByBarrioAndMonth(filteredAvisos.value, barriosDataset.value.rows),
)

const dateFilterError = computed(() => {
  if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
    return 'La fecha mínima no puede ser posterior a la fecha máxima.'
  }

  return ''
})

const formatDateForInputLabel = (value) => {
  if (!value) return ''

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

const resetDateFilter = () => {
  dateFrom.value = avisosDateBounds.value.min
  dateTo.value = avisosDateBounds.value.max
}

const syncDateBounds = (rows) => {
  if (!rows.length) return

  const dates = rows
    .map((row) => sheetDateToIso(row.fecha))
    .filter(Boolean)
    .sort()
  if (!dates.length) return

  if (!dateFrom.value) dateFrom.value = dates[0]
  if (!dateTo.value) dateTo.value = dates.at(-1)
}

const handleDateFromChange = (event) => {
  dateFrom.value = event.target.value
  if (dateTo.value && dateFrom.value > dateTo.value) dateTo.value = dateFrom.value
}

const handleDateToChange = (event) => {
  dateTo.value = event.target.value
  if (dateFrom.value && dateTo.value < dateFrom.value) dateFrom.value = dateTo.value
}

const loadDataset = async (dataset) => {
  dataset.loading = true
  dataset.error = ''

  try {
    dataset.rows = await fetchGoogleSheetCsv({
      fileId: SHEET_FILE_ID,
      gid: dataset.gid,
    })
    if (dataset.id === 'avisos') syncDateBounds(dataset.rows)
  } catch (error) {
    console.error(`No fue posible cargar la tabla ${dataset.title}.`, error)
    dataset.rows = []
    dataset.error = `No fue posible cargar la tabla ${dataset.title}. Inténtalo nuevamente.`
  } finally {
    dataset.loading = false
  }
}

const retryDataset = (datasetId) => {
  const dataset = datasets.value.find((item) => item.id === datasetId)
  if (dataset) return loadDataset(dataset)
}

const loadDatasets = () => Promise.all(datasets.value.map(loadDataset))

onMounted(loadDatasets)
</script>

<template>
  <main class="avisos-view">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header-copy">
          <p class="eyebrow">Seguimiento 2026</p>
          <h1>Avisos de residuos</h1>
          <p class="lead">Consulta el cumplimiento y los horarios de aviso por barrio.</p>
        </div>

        <form class="date-filter" aria-labelledby="avisos-date-filter-title" @submit.prevent>
          <div class="date-filter-heading">
            <span id="avisos-date-filter-title">Filtrar por fechas</span>
            <p v-if="!dateFilterError && dateFrom && dateTo" class="date-filter-range">
              {{ formatDateForInputLabel(dateFrom) }} – {{ formatDateForInputLabel(dateTo) }}
            </p>
          </div>
          <div class="date-filter-fields">
            <label class="avisos-field">
              <span>Desde</span>
              <input
                class="avisos-control"
                type="date"
                :value="dateFrom"
                :min="avisosDateBounds.min"
                :max="dateTo || avisosDateBounds.max"
                :disabled="avisosDataset.loading || !avisosDateBounds.min"
                @change="handleDateFromChange"
              />
            </label>
            <label class="avisos-field">
              <span>Hasta</span>
              <input
                class="avisos-control"
                type="date"
                :value="dateTo"
                :min="dateFrom || avisosDateBounds.min"
                :max="avisosDateBounds.max"
                :disabled="avisosDataset.loading || !avisosDateBounds.max"
                @change="handleDateToChange"
              />
            </label>
          </div>
          <button
            type="button"
            class="date-filter-reset avisos-button"
            :disabled="avisosDataset.loading || !avisosDateBounds.min"
            @click="resetDateFilter"
          >
            Restablecer
          </button>
          <p v-if="dateFilterError" class="date-filter-error" role="alert">
            {{ dateFilterError }}
          </p>
        </form>
      </header>

      <AvisosResiduosMenu :current-tab="currentTab" />

      <AvisosResiduosBarrios
        v-if="currentTab === 'barrios'"
        :rows="indicadoresPorBarrio"
        :loading="avisosDataset.loading || barriosDataset.loading"
        :error="avisosDataset.error || barriosDataset.error"
        @retry="loadDatasets"
      />

      <AvisosResiduosPorBarrio
        v-else-if="currentTab === 'por-barrio'"
        :rows="indicadoresPorBarrioYMes"
        :loading="avisosDataset.loading || barriosDataset.loading"
        :error="avisosDataset.error || barriosDataset.error"
        @retry="loadDatasets"
      />

      <AvisosResiduosDataviz
        v-show="currentTab === 'calendario'"
        :avisos="filteredAvisos"
        :loading="avisosDataset.loading"
        :error="avisosDataset.error"
      />

      <AvisosResiduosTablas
        v-show="currentTab === 'tablas'"
        :datasets="datasets"
        :filtered-avisos="filteredAvisos"
        @retry="retryDataset"
      />
    </div>
  </main>
</template>

<style src="./avisosResiduos.css"></style>

<style scoped>
.avisos-view {
  min-height: 100vh;
  min-width: 0;
  overflow-x: hidden;
  padding: 1.3rem clamp(0.85rem, 2.4vw, 2rem) 2rem;
  color: var(--avisos-ink);
  background: radial-gradient(circle at top right, rgb(49 138 81 / 7%), transparent 30rem), #f7faf7;
}

.page-shell {
  width: min(100%, 1440px);
  min-width: 0;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.5rem;
  margin-bottom: 0.8rem;
}

.page-header-copy {
  min-width: 0;
  max-width: 44rem;
  flex: 1 1 19rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--avisos-green-text);
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 0.4rem;
  font-size: clamp(1.75rem, 3vw, 2.55rem);
  font-weight: 850;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0;
  color: var(--avisos-muted);
  font-size: 0.94rem;
  line-height: 1.5;
}

.date-filter {
  display: flex;
  min-width: 0;
  max-width: 100%;
  flex: 0 1 35rem;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.65rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--avisos-border);
  border-radius: 10px;
  background: var(--avisos-surface);
  box-shadow: var(--avisos-shadow);
}

.date-filter-heading {
  color: var(--avisos-ink);
  font-size: 0.8rem;
  font-weight: 800;
}

.date-filter-reset {
  margin-left: auto;
  align-self: end;
  font-size: 0.77rem;
}

.date-filter-fields {
  display: grid;
  min-width: 0;
  flex: 1 1 15rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.date-filter-fields input {
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.date-filter-range,
.date-filter-error {
  margin: 0;
  font-size: 0.72rem;
}

.date-filter-range {
  color: var(--avisos-muted);
  font-weight: 500;
}

.date-filter-error {
  flex-basis: 100%;
  color: var(--avisos-error);
}

@media (max-width: 767px) {
  .avisos-view {
    padding: 0.85rem 1rem 1.5rem;
  }

  .page-header-copy {
    padding-left: 2.5rem;
  }
}

@media (max-width: 600px) {
  .date-filter {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .date-filter-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 0.65rem;
  }

  .date-filter-fields {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .date-filter-reset {
    grid-column: 2;
    grid-row: 1;
    min-height: 2rem;
    align-self: center;
  }

  .date-filter-error {
    grid-column: 1 / -1;
  }
}
</style>
