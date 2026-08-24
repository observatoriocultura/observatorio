<template>
  <section class="red-observatorios-lista">
    <section class="red-observatorios-search" aria-label="Buscar entidades">
      <ListSearchInput
        v-model="searchTerm"
        id="red-observatorios-search"
        placeholder="Buscar por nombre, sigla, país o tema..."
        aria-label="Buscar entidades de la Red de Observatorios"
        clear-label="Limpiar búsqueda de entidades"
      />
      <p class="explorer-count" aria-live="polite">
        <strong>{{ entidadesFiltradas.length }}</strong>
        de {{ entidades.length }} entidades
      </p>
    </section>

    <p v-if="loading" class="red-observatorios-message" role="status">
      Cargando entidades...
    </p>

    <p v-else-if="error" class="red-observatorios-message red-observatorios-message-error">
      {{ error }}
    </p>

    <section
      v-else-if="entidadesFiltradas.length"
      class="entities-grid"
      aria-label="Entidades de la Red de Observatorios"
    >
      <article
        v-for="entidad in entidadesFiltradas"
        :key="entidad.id"
        class="entity-card"
        role="button"
        tabindex="0"
        :aria-label="`Ver información de ${entidad.nombre_entidad}`"
        @click="openEntity(entidad)"
        @keydown.enter="openEntity(entidad)"
        @keydown.space.prevent="openEntity(entidad)"
      >
        <div class="entity-card-topline">
          <span class="entity-country-flag-slot">
            <img
              v-if="getCountryFlagUrl(entidad.pais_ubicacion_principal)"
              class="entity-country-flag"
              :src="getCountryFlagUrl(entidad.pais_ubicacion_principal)"
              alt=""
              aria-hidden="true"
            />
            <i v-else class="bi bi-geo-alt" aria-hidden="true"></i>
          </span>
          <span class="entity-country">
            {{ getCountryName(entidad.pais_ubicacion_principal) }}
          </span>
        </div>

        <div class="entity-card-content">
          <h3>{{ entidad.nombre_entidad }}</h3>
          <p class="entity-purpose">{{ entidad.proposito_principal }}</p>

          <dl class="entity-facts">
            <div>
              <dt>Naturaleza</dt>
              <dd>{{ entidad.naturaleza_institucional }}</dd>
            </div>
            <div>
              <dt>Escala de trabajo</dt>
              <dd>{{ entidad.escala_territorial_trabajo }}</dd>
            </div>
            <div>
              <dt>Desde</dt>
              <dd>{{ entidad.anio_inicio_actividades }}</dd>
            </div>
          </dl>

          <div v-if="entidad.tema_prioritario_accion_investigacion" class="entity-topics">
            <span
              v-for="tema in getTopics(entidad.tema_prioritario_accion_investigacion)"
              :key="tema"
              class="entity-topic"
            >
              {{ tema }}
            </span>
          </div>
        </div>

        <a
          v-if="entidad.sitio_web"
          :href="entidad.sitio_web"
          class="entity-link"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          Visitar sitio web
          <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
        </a>
      </article>
    </section>

    <p v-else class="red-observatorios-message" role="status">
      No encontramos entidades que coincidan con “{{ searchTerm }}”. Prueba con otro término.
    </p>

    <RedObservatoriosModal
      :entidad="selectedEntity"
      :country-name="getCountryName"
      :country-flag-url="getCountryFlagUrl"
      @close="closeEntity"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ListSearchInput from '../../../components/ListSearchInput.vue'
import RedObservatoriosModal from './RedObservatoriosModal.vue'

const ENTIDADES_URL = `${import.meta.env.BASE_URL}content/2026/demo_red_observatorios/entidades.json`
const PAISES_URL = `${import.meta.env.BASE_URL}resources/general/paises_ibero.js`

const entidades = ref([])
const searchTerm = ref('')
const loading = ref(true)
const error = ref('')
const countryCatalog = ref(null)
const selectedEntity = ref(null)

const normalizeText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const searchableEntityText = (entidad) => {
  return normalizeText(
    [
      entidad.nombre_entidad,
      entidad.sigla,
      entidad.pais_ubicacion_principal,
      getCountryName(entidad.pais_ubicacion_principal),
      entidad.naturaleza_institucional,
      entidad.escala_territorial_trabajo,
      entidad.proposito_principal,
      entidad.tema_prioritario_accion_investigacion,
    ].join(' '),
  )
}

const entidadesFiltradas = computed(() => {
  const query = normalizeText(searchTerm.value.trim())

  if (!query) {
    return entidades.value
  }

  return entidades.value.filter((entidad) => searchableEntityText(entidad).includes(query))
})

const getCountryName = (countryCode) => {
  return countryCatalog.value?.codeTo(countryCode) || countryCode || 'País no disponible'
}

const getCountryFlagUrl = (countryCode) => {
  return countryCatalog.value?.flagIconUrl(countryCode) || ''
}

const getTopics = (topics) => {
  return String(topics)
    .split(';')
    .map((topic) => topic.trim())
    .filter(Boolean)
}

const openEntity = (entidad) => {
  selectedEntity.value = entidad
}

const closeEntity = () => {
  selectedEntity.value = null
}

const loadCountryCatalog = () => {
  if (globalThis.RciPaises) {
    countryCatalog.value = globalThis.RciPaises
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = PAISES_URL
    script.async = true
    script.dataset.rciPaises = 'true'
    script.onload = () => {
      countryCatalog.value = globalThis.RciPaises || null
      resolve()
    }
    script.onerror = () => reject(new Error('No se pudo cargar el catálogo de países.'))
    document.head.appendChild(script)
  })
}

const loadEntities = async () => {
  try {
    const response = await fetch(ENTIDADES_URL)

    if (!response.ok) {
      throw new Error('No se pudo cargar el directorio de entidades.')
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('El archivo de entidades no tiene un formato válido.')
    }

    entidades.value = data
  } catch (loadError) {
    console.error('Error cargando las entidades de la red:', loadError)
    error.value = 'No se pudieron cargar las entidades. Intenta nuevamente más tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await loadCountryCatalog()
  } catch (catalogError) {
    console.error('Error cargando el catálogo de países:', catalogError)
  }

  await loadEntities()
})
</script>

<style scoped>
.red-observatorios-lista {
  padding-top: clamp(1rem, 2.5vw, 2rem);
}

.red-observatorios-search {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.8rem;
  margin-right: auto;
  margin-left: auto;
  width: min(100%, 720px);
}

.explorer-count {
  margin: 0;
  color: var(--red-muted);
  font-size: 0.9rem;
  text-align: center;
}

.explorer-count strong {
  color: var(--red-purple);
  font-size: 1.1rem;
}

.entities-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.entity-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid var(--red-border);
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.entity-card:hover {
  border-color: #cbb9df;
  box-shadow: 0 14px 32px rgba(50, 32, 74, 0.1);
  transform: translateY(-2px);
}

.entity-card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
}

.entity-country {
  min-width: 0;
  color: var(--red-muted);
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
}

.entity-country-flag-slot {
  display: inline-flex;
  width: 28px;
  min-width: 28px;
  height: 21px;
  align-items: center;
  justify-content: center;
}

.entity-country-flag-slot i {
  color: var(--red-purple);
  font-size: 1.1rem;
}

.entity-country-flag {
  display: inline-block;
  width: 28px;
  height: auto;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(24, 35, 43, 0.08);
}

.entity-card-content {
  flex: 1;
  padding: 0 1rem 1rem;
}

.entity-card h3 {
  margin: 0 0 0.7rem;
  color: var(--red-ink);
  font-size: 1.08rem;
  line-height: 1.25;
}

.entity-purpose {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 1rem;
  color: var(--red-muted);
  font-size: 0.88rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
}

.entity-facts {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.7rem 1rem;
  margin: 0;
  padding-top: 0.85rem;
  border-top: 1px solid #edf0f2;
}

.entity-facts div:first-child {
  grid-column: 1 / -1;
}

.entity-facts dt {
  margin-bottom: 0.15rem;
  color: #7a858c;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.entity-facts dd {
  margin: 0;
  color: var(--red-ink);
  font-size: 0.8rem;
  line-height: 1.35;
}

.entity-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 1rem;
}

.entity-topic {
  border-radius: 5px;
  background: #f4f6f7;
  padding: 0.28rem 0.45rem;
  color: #53616a;
  font-size: 0.72rem;
  line-height: 1.25;
}

.entity-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid #edf0f2;
  padding: 0.85rem 1rem;
  color: var(--red-purple);
  font-size: 0.83rem;
  font-weight: 800;
  text-decoration: none;
}

.entity-link:hover,
.entity-link:focus {
  background: #faf8fc;
  color: var(--red-purple-dark);
}

.entity-link:focus-visible {
  outline: 3px solid rgba(101, 64, 150, 0.2);
  outline-offset: -3px;
}

.red-observatorios-message {
  margin: 2rem auto 0;
  color: var(--red-muted);
  text-align: center;
}

.red-observatorios-message-error {
  color: #a23838;
}

@media (max-width: 900px) {
  .entities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 580px) {
  .entities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
