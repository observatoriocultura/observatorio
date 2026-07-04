<template>
  <div class="pai-list-search">
    <ListSearchInput
      :model-value="searchTerm"
      placeholder="Buscar investigaciones..."
      aria-label="Buscar investigaciones"
      @update:model-value="emit('update:searchTerm', $event)"
    />
    <p class="pai-list-filter-counter" aria-live="polite">
      <span>{{ resultCount }}</span> de {{ totalCount }} mediciones
    </p>
    <div class="pai-list-filters">
      <select
        :value="selectedLinea"
        class="pai-list-filter"
        :class="{ 'filter-active': selectedLinea }"
        aria-label="Filtrar investigaciones por linea"
        @change="emit('update:selectedLinea', $event.target.value)"
      >
        <option value="">Todas las lineas</option>
        <option v-for="item in lineasInvestigacion" :key="item.key" :value="item.nombre">
          {{ item.nombre }}
        </option>
      </select>
      <select
        :value="selectedEntidad"
        class="pai-list-filter"
        :class="{ 'filter-active': selectedEntidad }"
        aria-label="Filtrar investigaciones por entidad"
        @change="emit('update:selectedEntidad', $event.target.value)"
      >
        <option value="">Todas las entidades</option>
        <option v-for="item in ENTIDADES" :key="item.key" :value="item.sigla">
          {{ item.nombre }}
        </option>
      </select>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="pai-list-filter-clear"
        title="Limpiar todos los filtros"
        aria-label="Limpiar todos los filtros"
        @click="clearFilters"
      >
        <i class="bi bi-eraser" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ListSearchInput from '../../../components/ListSearchInput.vue'
import { ENTIDADES } from '../../../constants/catalogos'
import { lineasInvestigacion } from '../constants'

const props = defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
  selectedLinea: {
    type: String,
    default: '',
  },
  selectedEntidad: {
    type: String,
    default: '',
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedLinea',
  'update:selectedEntidad',
])

const hasActiveFilters = computed(
  () => props.searchTerm !== '' || props.selectedLinea !== '' || props.selectedEntidad !== '',
)

const clearFilters = () => {
  emit('update:searchTerm', '')
  emit('update:selectedLinea', '')
  emit('update:selectedEntidad', '')
}
</script>

<style scoped>
.pai-list-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  width: min(100%, 40rem);
  justify-self: center;
}

.pai-list-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.pai-list-filter {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: #fff;
  padding: 0.58rem 0.75rem;
  color: #212529;
  font-size: 0.92rem;
  line-height: 1.2;
}

.pai-list-filter:focus {
  border-color: #654096;
  outline: 3px solid rgba(101, 64, 150, 0.18);
}

.filter-active {
  border-color: #654096;
  background-color: #e7dff1;
  font-weight: 700;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.pai-list-filter-clear {
  display: inline-flex;
  width: 2.45rem;
  height: 2.45rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background-color: #fff;
  color: #5c6972;
  font-size: 1rem;
  line-height: 1;
}

.pai-list-filter-clear:hover,
.pai-list-filter-clear:focus {
  border-color: #654096;
  background-color: #f0ebf7;
  color: #32204a;
}

.pai-list-filter-clear:focus {
  outline: 3px solid rgba(101, 64, 150, 0.18);
  outline-offset: 2px;
}

.pai-list-filter-counter {
  margin: 0.25rem 0 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.2;
  text-align: center;
}

.pai-list-filter-counter span {
  color: #654096;
  font-weight: 800;
}

@media (min-width: 576px) {
  .pai-list-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  }
}

@media (max-width: 575.98px) {
  .pai-list-filter-clear {
    width: 100%;
  }
}
</style>
