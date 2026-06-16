<template>
  <section class="pai-explorer-layout" aria-label="Explorar investigaciones PAI">
    <SearchForm
      v-model:search-term="searchTerm"
      v-model:selected-linea="selectedLinea"
      v-model:selected-entidad="selectedEntidad"
      :result-count="investigacionesFiltradas.length"
      :total-count="props.investigaciones.length"
    />

    <div v-if="investigacionesFiltradas.length > 0" class="explorer-container">
      <article
        v-for="investigacion in investigacionesFiltradas"
        :key="investigacion.id"
        class="explorer-card"
      >
        <header class="explorer-card-header">
          <p class="explorer-tema">{{ getInvestigacionTema(investigacion) }}</p>
        </header>

        <h2>{{ getInvestigacionTitulo(investigacion) }}</h2>

        <p class="explorer-description">{{ getInvestigacionDescripcion(investigacion) }}</p>

        <footer class="explorer-tags">
          <span class="explorer-id">i{{ investigacion.id }}</span>
          <span
            v-if="investigacion.linea_investigacion"
            class="label"
            :class="getLineaClass(investigacion.linea_investigacion)"
          >
            {{ investigacion.linea_investigacion }}
          </span>
          <span v-else class="explorer-muted">Sin linea registrada</span>
          <span
            v-if="getInvestigacionEntidad(investigacion)"
            class="label"
            :class="getEntidadClass(getInvestigacionEntidad(investigacion))"
          >
            {{ getInvestigacionEntidad(investigacion) }}
          </span>
          <span v-else class="explorer-muted">Sin entidad solicitante</span>
        </footer>
      </article>
    </div>

    <div v-else class="explorer-empty">
      <p>No hay investigaciones que coincidan con la busqueda.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { toClassName } from '../../../utils/text'
import SearchForm from './SearchForm.vue'

const props = defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
})

const searchTerm = ref('')
const selectedLinea = ref('')
const selectedEntidad = ref('')

const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const getInvestigacionEntidad = (investigacion) =>
  investigacion.entidad_solicitante ??
  investigacion.entidad_corto ??
  investigacion.entidad ??
  investigacion.entidad_responsable ??
  ''

const getInvestigacionTema = (investigacion) =>
  String(investigacion.tema ?? investigacion.tematica ?? 'Sin tema registrado').trim()

const getInvestigacionTitulo = (investigacion) =>
  String(investigacion.titulo ?? investigacion.nombre_clave ?? 'Investigacion sin titulo').trim()

const getInvestigacionDescripcion = (investigacion) =>
  String(investigacion.descripcion ?? 'Sin descripcion registrada.').trim()

const matchesSelectedEntidad = (investigacion, entidad) => {
  if (!entidad) return true

  return [
    investigacion.entidad_solicitante,
    investigacion.entidad_corto,
    investigacion.entidad,
    investigacion.entidad_responsable,
  ].some((value) => normalizeSearchText(value) === entidad)
}

const investigacionesFiltradas = computed(() => {
  const search = normalizeSearchText(searchTerm.value)
  const linea = normalizeSearchText(selectedLinea.value)
  const entidad = normalizeSearchText(selectedEntidad.value)
  if (!search && !linea && !entidad) return props.investigaciones

  return props.investigaciones.filter((investigacion) => {
    const matchesLinea =
      !linea || normalizeSearchText(investigacion.linea_investigacion) === linea
    const matchesEntidad = matchesSelectedEntidad(investigacion, entidad)

    if (!matchesLinea || !matchesEntidad) return false
    if (!search) return true

    const searchableText = [
      investigacion.id,
      investigacion.nombre_clave,
      investigacion.titulo,
      investigacion.descripcion,
      investigacion.linea_investigacion,
      getInvestigacionEntidad(investigacion),
      getInvestigacionTema(investigacion),
      investigacion.palabras_clave,
    ]
      .map(normalizeSearchText)
      .join(' ')

    return searchableText.includes(search)
  })
})

const getLineaClass = (linea) => `bg-${toClassName(linea)}`
const getEntidadClass = (entidad) => `bg-${toClassName(entidad)}`
</script>

<style scoped>
.pai-explorer-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  width: 100%;
}

.explorer-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  width: 100%;
}

.explorer-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  min-height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
}

.explorer-card-header {
  min-width: 0;
}

.explorer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.25rem;
}

.explorer-id {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  background-color: #f0ebf7;
  padding: 0.2rem 0.45rem;
  color: #32204a;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
}

.explorer-card h2 {
  margin: 0;
  color: #212529;
  font-size: 1.18rem;
  font-weight: 900;
  line-height: 1.22;
}

.explorer-tema {
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.25;
  text-transform: uppercase;
}

.explorer-description {
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.4;
}

.explorer-muted {
  color: #6c757d;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
}

.explorer-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
  color: #6c757d;
}

.explorer-empty p {
  margin: 0;
}

@media (min-width: 576px) {
  .explorer-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .explorer-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1600px) {
  .explorer-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

</style>
