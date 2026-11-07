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
  () =>
    props.datasets.find((dataset) => dataset.id === activeDatasetId.value) ??
    props.datasets[0] ??
    emptyDataset,
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
  <section class="tables-section avisos-panel" aria-labelledby="avisos-tablas-title">
    <header class="avisos-panel-header">
      <div>
        <h2 id="avisos-tablas-title" class="avisos-panel-title">Tablas de seguimiento</h2>
        <p class="avisos-panel-description">
          Consulta los registros de origen de avisos y barrios.
        </p>
      </div>
      <nav class="dataset-tabs" aria-label="Tablas disponibles">
        <button
          v-for="dataset in datasets"
          :key="dataset.id"
          type="button"
          class="dataset-tab avisos-button"
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
    </header>

    <div>
      <div class="dataset-heading">
        <div>
          <h3 id="avisos-active-dataset-title">
            {{ activeDataset.title }}
            <span v-if="!activeDataset.loading && !activeDataset.error" class="dataset-count">
              {{ displayedRows.length }} registro{{ displayedRows.length === 1 ? '' : 's' }}
              visibles
            </span>
          </h3>
          <p class="avisos-note">{{ activeDataset.description }}</p>
        </div>
        <button
          v-if="activeDataset.error"
          type="button"
          class="avisos-button"
          @click="requestRetry"
        >
          Reintentar
        </button>
      </div>

      <div v-if="activeDataset.loading" class="avisos-state" role="status">
        <span class="spinner" aria-hidden="true"></span>
        Cargando {{ activeDataset.title.toLocaleLowerCase('es-CO') }}…
      </div>

      <div v-else-if="activeDataset.error" class="avisos-state" role="alert">
        {{ activeDataset.error }}
      </div>

      <div v-else-if="displayedRows.length === 0" class="avisos-state">
        {{
          activeDataset.rows.length === 0
            ? 'Esta tabla no contiene registros.'
            : 'No hay avisos en el rango seleccionado.'
        }}
      </div>

      <div
        v-else
        class="table-scroll avisos-scroll"
        role="region"
        aria-labelledby="avisos-active-dataset-title"
        tabindex="0"
      >
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
.dataset-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dataset-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--avisos-muted);
}

.dataset-tab--active {
  border-color: #b8d4bf;
  color: var(--avisos-green-text);
  background: var(--avisos-green-soft);
}

.row-count {
  min-width: 1.65rem;
  padding: 0.08rem 0.35rem;
  border-radius: 5px;
  background: var(--avisos-soft);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.dataset-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem var(--avisos-panel-padding);
  border-bottom: 1px solid var(--avisos-divider);
}

.dataset-heading h3 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.55rem;
  margin: 0 0 0.25rem;
  font-size: 0.98rem;
  font-weight: 800;
}

.dataset-count {
  color: var(--avisos-green-text);
  font-size: 0.75rem;
  font-weight: 750;
}

.spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid #c9d8ce;
  border-top-color: var(--avisos-green);
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
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid var(--avisos-divider);
  text-align: left;
  vertical-align: top;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--avisos-ink);
  background: var(--avisos-soft);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  max-width: 30rem;
  color: var(--avisos-ink);
  line-height: 1.45;
}

tbody tr:nth-child(even) td {
  background: #fafbfa;
}

tbody tr:hover td {
  background: var(--avisos-soft);
}

tbody tr:last-child td {
  border-bottom: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
