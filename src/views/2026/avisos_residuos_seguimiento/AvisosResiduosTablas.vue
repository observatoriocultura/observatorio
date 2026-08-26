<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  datasets: {
    type: Array,
    default: () => [],
  },
  filteredAvisos: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['retry'])

const activeDatasetId = ref('avisos')
const emptyDataset = {
  id: '',
  title: 'Tabla',
  description: '',
  rows: [],
  loading: false,
  error: '',
}

const activeDataset = computed(
  () => props.datasets.find((dataset) => dataset.id === activeDatasetId.value) ?? props.datasets[0] ?? emptyDataset,
)

const displayedRows = computed(() =>
  activeDataset.value.id === 'avisos' ? props.filteredAvisos : activeDataset.value.rows,
)

const columns = computed(() => {
  const keys = new Set()

  activeDataset.value.rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.trim()) keys.add(key)
    })
  })

  return [...keys]
})

const formatHeading = (heading) => {
  const normalized = heading.replaceAll('_', ' ').trim()
  return normalized.charAt(0).toLocaleUpperCase('es-CO') + normalized.slice(1)
}

const requestRetry = () => emit('retry', activeDataset.value.id)
</script>

<template>
  <section class="tables-section" aria-labelledby="avisos-tablas-title">
    <div class="tables-section-heading">
      <div>
        <p class="section-kicker">Datos de origen</p>
        <h2 id="avisos-tablas-title">Tablas de seguimiento</h2>
      </div>
      <p class="tables-section-description">
        Explora los registros utilizados para construir la visualización.
      </p>
    </div>

    <nav class="dataset-tabs" aria-label="Tablas disponibles">
      <button
        v-for="dataset in datasets"
        :key="dataset.id"
        type="button"
        class="dataset-tab"
        :class="{ 'dataset-tab--active': activeDatasetId === dataset.id }"
        :aria-pressed="activeDatasetId === dataset.id"
        @click="activeDatasetId = dataset.id"
      >
        <span>{{ dataset.title }}</span>
        <span v-if="!dataset.loading && !dataset.error" class="row-count">
          {{ dataset.id === 'avisos' ? filteredAvisos.length : dataset.rows.length }}
        </span>
      </button>
    </nav>

    <div class="dataset-card">
      <div class="dataset-heading">
        <div>
          <h3>{{ activeDataset.title }}</h3>
          <p>
            {{ activeDataset.description }}
            <span v-if="!activeDataset.loading && !activeDataset.error" class="dataset-count">
              {{ displayedRows.length }} registro{{ displayedRows.length === 1 ? '' : 's' }} visibles
            </span>
          </p>
        </div>
        <button
          v-if="activeDataset.error"
          type="button"
          class="retry-button"
          @click="requestRetry"
        >
          Reintentar
        </button>
      </div>

      <div v-if="activeDataset.loading" class="state-message" role="status">
        <span class="spinner" aria-hidden="true"></span>
        Cargando {{ activeDataset.title.toLocaleLowerCase('es-CO') }}…
      </div>

      <div v-else-if="activeDataset.error" class="state-message state-message--error" role="alert">
        {{ activeDataset.error }}
      </div>

      <div v-else-if="displayedRows.length === 0" class="state-message">
        {{
          activeDataset.rows.length === 0
            ? 'Esta tabla no contiene registros.'
            : 'No hay avisos en el rango seleccionado.'
        }}
      </div>

      <div v-else class="table-scroll">
        <table>
          <thead>
            <tr>
              <th v-for="column in columns" :key="column" scope="col">
                {{ formatHeading(column) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in displayedRows" :key="`${activeDataset.id}-${rowIndex}`">
              <td v-for="column in columns" :key="column">
                {{ row[column] || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tables-section {
  min-width: 0;
}

.tables-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.section-kicker {
  margin: 0 0 0.35rem;
  color: #317449;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.tables-section h2 {
  margin: 0;
  color: #1e2923;
  font-size: 1.35rem;
  font-weight: 800;
}

.tables-section-description {
  max-width: 28rem;
  margin: 0;
  color: #6a7871;
  font-size: 0.9rem;
  text-align: right;
}

.dataset-tabs {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.dataset-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 1rem;
  border: 1px solid #d9e0dc;
  border-radius: 999px;
  color: #506058;
  background: rgba(255, 255, 255, 0.7);
  font-weight: 750;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.dataset-tab:hover {
  border-color: #8dac98;
  color: #225e37;
}

.dataset-tab--active {
  border-color: #276a3e;
  color: #fff;
  background: #276a3e;
}

.row-count {
  min-width: 1.65rem;
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  color: inherit;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.75rem;
  text-align: center;
}

.dataset-tab:not(.dataset-tab--active) .row-count {
  background: #e8eeea;
}

.dataset-card {
  overflow: hidden;
  border: 1px solid #dfe5e1;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 45px rgba(29, 54, 38, 0.08);
}

.dataset-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.5rem;
  border-bottom: 1px solid #e7ebe8;
}

.dataset-heading h3 {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 800;
}

.dataset-heading p {
  margin: 0;
  color: #6a7871;
  font-size: 0.9rem;
}

.dataset-count {
  display: block;
  margin-top: 0.28rem;
  color: #317449;
  font-size: 0.75rem;
  font-weight: 750;
}

.retry-button {
  padding: 0.55rem 0.85rem;
  border: 1px solid #276a3e;
  border-radius: 8px;
  color: #276a3e;
  background: #fff;
  font-weight: 750;
}

.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 14rem;
  padding: 2rem;
  color: #647169;
  text-align: center;
}

.state-message--error {
  color: #a03636;
}

.spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid #c9d8ce;
  border-top-color: #276a3e;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.table-scroll {
  max-height: 68vh;
  overflow: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.87rem;
}

th,
td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #edf0ee;
  text-align: left;
  vertical-align: top;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: #405048;
  background: #f2f6f3;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  max-width: 30rem;
  color: #3e4943;
  line-height: 1.45;
}

tbody tr:nth-child(even) td {
  background: #fafbfa;
}

tbody tr:hover td {
  background: #f0f7f2;
}

tbody tr:last-child td {
  border-bottom: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .tables-section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .tables-section-description {
    text-align: left;
  }
}

@media (max-width: 767px) {
  .dataset-tabs {
    overflow-x: auto;
  }

  .dataset-tab {
    flex: 0 0 auto;
  }

  .dataset-heading {
    align-items: flex-start;
    padding: 1.15rem;
  }
}
</style>
