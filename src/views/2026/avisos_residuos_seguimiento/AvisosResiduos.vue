<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchGoogleSheetCsv } from '../../../utils/googleSheets'
import AvisosResiduosBarrios from './AvisosResiduosBarrios.vue'
import AvisosResiduosDataviz from './AvisosResiduosDataviz.vue'
import AvisosResiduosMenu from './AvisosResiduosMenu.vue'
import AvisosResiduosTablas from './AvisosResiduosTablas.vue'
import { summarizeAvisosByBarrio } from './avisosResiduos.js'

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
  return ['calendario', 'tablas'].includes(tab) ? tab : 'barrios'
})

const avisosDataset = computed(() => datasets.value.find((dataset) => dataset.id === 'avisos'))
const barriosDataset = computed(() => datasets.value.find((dataset) => dataset.id === 'barrios'))

const sheetDateToIso = (value) => {
  const match = String(value ?? '')
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (!match) return ''

  const [, day, month, year] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

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
      date &&
      (!dateFrom.value || date >= dateFrom.value) &&
      (!dateTo.value || date <= dateTo.value)
    )
  })
})

const indicadoresPorBarrio = computed(() =>
  summarizeAvisosByBarrio(filteredAvisos.value, barriosDataset.value.rows),
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

  const dates = rows.map((row) => sheetDateToIso(row.fecha)).filter(Boolean).sort()
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
      <AvisosResiduosMenu :current-tab="currentTab" />

      <header class="page-header">
        <div class="page-header-copy">
          <p class="eyebrow">Seguimiento 2026</p>
          <h1>Avisos de residuos</h1>
          <p class="lead">
            Consulta los avisos registrados y la información de los barrios vinculados al
            seguimiento.
          </p>
        </div>

        <form class="date-filter" aria-labelledby="avisos-date-filter-title" @submit.prevent>
          <div class="date-filter-heading">
            <span id="avisos-date-filter-title">Filtrar por fechas</span>
            <p v-if="!dateFilterError && dateFrom && dateTo" class="date-filter-range">
              {{ formatDateForInputLabel(dateFrom) }} – {{ formatDateForInputLabel(dateTo) }}
            </p>
          </div>
          <div class="date-filter-fields">
            <label>
              <span>Desde</span>
              <input
                type="date"
                :value="dateFrom"
                :min="avisosDateBounds.min"
                :max="dateTo || avisosDateBounds.max"
                :disabled="avisosDataset.loading || !avisosDateBounds.min"
                @change="handleDateFromChange"
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
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
            class="date-filter-reset"
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

      <AvisosResiduosBarrios
        v-if="currentTab === 'barrios'"
        :rows="indicadoresPorBarrio"
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

<style scoped>
.avisos-view {
  min-height: 100vh;
  min-width: 0;
  overflow-x: hidden;
  padding: 1.25rem 1.5rem 2rem;
  color: #18201c;
  background:
    radial-gradient(circle at top right, rgba(91, 157, 112, 0.16), transparent 30rem),
    #f5f7f5;
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
  margin-bottom: 1.25rem;
}

.page-header-copy {
  min-width: 0;
  max-width: 44rem;
  flex: 1 1 19rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #317449;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 0.4rem;
  font-size: clamp(1.75rem, 3.2vw, 2.75rem);
  font-weight: 850;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0;
  color: #607068;
  font-size: 0.95rem;
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
  border: 1px solid #d8e2da;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 28px rgba(29, 54, 38, 0.06);
}

.date-filter-heading {
  color: #33493b;
  font-size: 0.8rem;
  font-weight: 800;
}

.date-filter-reset {
  min-height: 2.25rem;
  margin-left: auto;
  padding: 0.3rem 0.45rem;
  align-self: end;
  border: 0;
  color: #317449;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 750;
}

.date-filter-reset:hover:not(:disabled) {
  text-decoration: underline;
}

.date-filter-reset:disabled {
  color: #a5b1aa;
  cursor: not-allowed;
}

.date-filter-fields {
  display: grid;
  min-width: 0;
  flex: 1 1 15rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.date-filter-fields label {
  display: grid;
  gap: 0.15rem;
  color: #6a7871;
  font-size: 0.68rem;
  font-weight: 750;
  text-transform: uppercase;
}

.date-filter-fields input {
  width: 100%;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid #cbd8cf;
  border-radius: 8px;
  color: #293a30;
  background: #fff;
  font: inherit;
  font-size: 0.82rem;
  text-transform: none;
}

.date-filter-fields input:focus {
  outline: 2px solid rgba(49, 116, 73, 0.28);
  outline-offset: 1px;
  border-color: #317449;
}

.date-filter-fields input:disabled {
  color: #9aa69f;
  background: #f3f6f4;
}

.date-filter-range,
.date-filter-error {
  margin: 0;
  font-size: 0.72rem;
}

.date-filter-range {
  color: #607068;
  font-weight: 500;
}

.date-filter-error {
  flex-basis: 100%;
  color: #a03636;
}

@media (max-width: 767px) {
  .avisos-view {
    padding: 0.85rem 1rem 1.5rem;
  }
}

@media (max-width: 600px) {
  .date-filter-heading {
    display: flex;
    flex: 1 0 100%;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 0.65rem;
  }

  .date-filter-fields {
    flex-basis: 13rem;
  }
}
</style>
