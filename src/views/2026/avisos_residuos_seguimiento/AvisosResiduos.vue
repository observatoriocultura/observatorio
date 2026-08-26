<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchGoogleSheetCsv } from '../../../utils/googleSheets'
import AvisosResiduosDataviz from './AvisosResiduosDataviz.vue'
import AvisosResiduosMenu from './AvisosResiduosMenu.vue'
import AvisosResiduosTablas from './AvisosResiduosTablas.vue'

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
  return ['calendario', 'tablas'].includes(tab) ? tab : 'calendario'
})

const avisosDataset = computed(() => datasets.value.find((dataset) => dataset.id === 'avisos'))

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
      <AvisosResiduosMenu />

      <header class="page-header">
        <div class="page-header-copy">
          <p class="eyebrow">Seguimiento 2026</p>
          <h1>Avisos de residuos</h1>
          <p class="lead">
            Consulta los avisos registrados y la información de los barrios vinculados al
            seguimiento.
          </p>
        </div>

        <form class="date-filter" @submit.prevent>
          <div class="date-filter-heading">
            <span>Filtrar por fechas</span>
            <button
              type="button"
              class="date-filter-reset"
              :disabled="avisosDataset.loading || !avisosDateBounds.min"
              @click="resetDateFilter"
            >
              Restablecer
            </button>
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
          <p v-if="dateFilterError" class="date-filter-error" role="alert">
            {{ dateFilterError }}
          </p>
          <p v-else-if="dateFrom && dateTo" class="date-filter-range">
            {{ formatDateForInputLabel(dateFrom) }} – {{ formatDateForInputLabel(dateTo) }}
          </p>
        </form>
      </header>

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
  padding: 3.5rem 1.5rem;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}

.page-header-copy {
  max-width: 760px;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #317449;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 1rem;
  font-size: clamp(2.25rem, 5vw, 4rem);
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0;
  color: #607068;
  font-size: 1.08rem;
  line-height: 1.65;
}

.date-filter {
  width: min(100%, 340px);
  flex: 0 0 340px;
  padding: 1rem;
  border: 1px solid #d8e2da;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 28px rgba(29, 54, 38, 0.06);
}

.date-filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #33493b;
  font-size: 0.8rem;
  font-weight: 800;
}

.date-filter-reset {
  padding: 0;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.date-filter-fields label {
  display: grid;
  gap: 0.3rem;
  color: #6a7871;
  font-size: 0.68rem;
  font-weight: 750;
  text-transform: uppercase;
}

.date-filter-fields input {
  width: 100%;
  min-width: 0;
  padding: 0.55rem 0.6rem;
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
  margin: 0.65rem 0 0;
  font-size: 0.72rem;
}

.date-filter-range {
  color: #738078;
}

.date-filter-error {
  color: #a03636;
}

@media (max-width: 980px) {
  .page-header {
    flex-direction: column;
  }

  .page-header-copy,
  .date-filter {
    width: 100%;
    max-width: none;
  }

  .date-filter {
    flex-basis: auto;
  }
}

@media (max-width: 767px) {
  .avisos-view {
    padding: 2.25rem 1rem;
  }

  .page-header {
    margin-bottom: 1.75rem;
  }

}
</style>
