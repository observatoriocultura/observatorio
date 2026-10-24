<template>
  <section class="red-observatorios-lista">
    <section class="red-observatorios-search" aria-label="Buscar entidades">
      <ListSearchInput
        v-model="searchTerm"
        id="red-observatorios-search"
        placeholder="Buscar por nombre, país, ciudad o descripción..."
        aria-label="Buscar entidades de la Red de Observatorios"
        clear-label="Limpiar búsqueda de entidades"
      />
      <p class="explorer-count" aria-live="polite">
        <strong>{{ entidadesFiltradas.length }}</strong>
        de {{ entidades.length }} entidades y personas
      </p>
    </section>

    <section
      v-if="entidadesFiltradas.length"
      class="entities-grid"
      aria-label="Entidades de la Red de Observatorios"
    >
      <article v-for="entidad in entidadesFiltradas" :key="entidad.id" class="entity-card">
        <div class="entity-cover" :class="getCoverClass(entidad)">
          <span class="entity-country">
            <img
              v-if="getCountryFlagUrl(entidad.pais_territorio)"
              class="entity-country-flag"
              :src="getCountryFlagUrl(entidad.pais_territorio)"
              alt=""
              aria-hidden="true"
            />
            <i v-else class="bi bi-geo-alt" aria-hidden="true"></i>
            {{ getCountryName(entidad.pais_territorio) }}
          </span>
          <img
            v-if="entidad.logo_url && !failedLogos.has(entidad.logo_url)"
            :src="entidad.logo_url"
            class="entity-logo"
            alt=""
            loading="lazy"
            @error="failedLogos.add(entidad.logo_url)"
          />
          <span v-else class="entity-monogram" aria-hidden="true">{{
            getInitials(entidad.nombre)
          }}</span>
          <span class="entity-cover-caption" aria-hidden="true">
            {{ getEntityFieldLabel('tipo_actor', entidad.tipo_actor) }} · Red de Observatorios
          </span>
        </div>

        <div class="entity-card-content">
          <h2>{{ entidad.nombre }}</h2>
          <p v-if="entidad.subtitulo" class="entity-subtitle">{{ entidad.subtitulo }}</p>
          <p v-if="entidad.descripcion" class="entity-purpose">{{ entidad.descripcion }}</p>

          <p class="entity-meta">
            <span>{{ getEntityFieldLabel('tipo_entidad', entidad.tipo_entidad) }}</span>
            <span aria-hidden="true">/</span>
            <span>{{ getEntityFieldLabel('escala_territorial', entidad.escala_territorial) }}</span>
          </p>

          <div class="entity-card-actions">
            <button
              type="button"
              class="entity-open-button"
              :aria-label="`Conocer a ${entidad.nombre}`"
              aria-haspopup="dialog"
              @click="openEntity(entidad)"
            >
              Conocer <span aria-hidden="true">→</span>
            </button>
            <RouterLink
              :to="{ name: 'Perfil Red de Observatorios', params: { slug: entidad.slug } }"
              class="entity-profile-link"
              :aria-label="`Ver más sobre ${entidad.nombre}`"
            >
              Ver más <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
            </RouterLink>
          </div>
        </div>
      </article>
    </section>

    <p v-else class="red-observatorios-message" role="status">
      {{
        searchTerm.trim()
          ? `No encontramos registros que coincidan con “${searchTerm}”. Prueba con otro término.`
          : 'Aún no hay entidades o personas registradas en el directorio.'
      }}
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
import { RouterLink } from 'vue-router'
import ListSearchInput from '../../../components/ListSearchInput.vue'
import { getEntityFieldLabel } from '../../../utils/redObservatorios.js'
import RedObservatoriosModal from './RedObservatoriosModal.vue'

const PAISES_URL = `${import.meta.env.BASE_URL}resources/general/paises_ibero.js`

const props = defineProps({
  entidades: {
    type: Array,
    required: true,
  },
})

const searchTerm = ref('')
const countryCatalog = ref(null)
const selectedEntity = ref(null)
const failedLogos = ref(new Set())

const getInitials = (name) => {
  const words = String(name)
    .split(/\s+/)
    .filter((word) => !/^(de|del|la|el|los|las|y|e|do|da|dos|das|o|a)$/i.test(word))
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toUpperCase()
}

const getCoverClass = (entidad) => {
  if (entidad.tipo_actor === 'persona') return 'entity-cover-sage'
  return (
    {
      observatorio: 'entity-cover-blue',
      red: 'entity-cover-peach',
      'grupo-investigacion': 'entity-cover-sand',
      entidad: 'entity-cover-yellow',
    }[entidad.tipo_entidad] || 'entity-cover-sand'
  )
}

const normalizeText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const searchableEntityText = (entidad) => {
  return normalizeText(
    [
      entidad.nombre,
      entidad.subtitulo,
      entidad.pais_territorio,
      getCountryName(entidad.pais_territorio),
      entidad.ciudad,
      getEntityFieldLabel('tipo_actor', entidad.tipo_actor),
      getEntityFieldLabel('tipo_entidad', entidad.tipo_entidad),
      getEntityFieldLabel('naturaleza_institucional', entidad.naturaleza_institucional),
      getEntityFieldLabel('escala_territorial', entidad.escala_territorial),
      entidad.descripcion,
    ].join(' '),
  )
}

const entidadesFiltradas = computed(() => {
  const query = normalizeText(searchTerm.value.trim())

  if (!query) {
    return props.entidades
  }

  return props.entidades.filter((entidad) => searchableEntityText(entidad).includes(query))
})

const getCountryName = (countryCode) => {
  const name = countryCatalog.value?.codeTo(countryCode)
  return (name && name !== 'ND' ? name : countryCode) || 'País no disponible'
}

const getCountryFlagUrl = (countryCode) => {
  return countryCatalog.value?.flagIconUrl(countryCode) || ''
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

onMounted(async () => {
  try {
    await loadCountryCatalog()
  } catch (catalogError) {
    console.error('Error cargando el catálogo de países:', catalogError)
  }
})
</script>

<style scoped>
.red-observatorios-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.red-observatorios-search :deep(.list-search-input) {
  max-width: 680px;
}
.red-observatorios-search :deep(.list-search-control) {
  min-height: 58px;
  padding: 0.65rem 0.85rem 0.65rem 1.25rem;
  gap: 0.8rem;
  border-color: var(--red-border);
  background: var(--red-surface);
}
.red-observatorios-search :deep(.list-search-control:focus-within) {
  border-color: var(--red-focus);
  box-shadow: 0 0 0 3px rgb(104 82 62 / 12%);
}
.red-observatorios-search :deep(.list-search-field) {
  color: var(--red-ink);
  font-weight: 400;
}
.red-observatorios-search :deep(.list-search-field::placeholder),
.red-observatorios-search :deep(.list-search-icon),
.red-observatorios-search :deep(.list-search-clear) {
  color: var(--red-muted);
}
.red-observatorios-search :deep(.list-search-clear-visible:hover),
.red-observatorios-search :deep(.list-search-clear-visible:focus) {
  background: var(--red-soft);
  color: var(--red-ink);
  outline-color: var(--red-focus);
}
.explorer-count {
  flex-shrink: 0;
  margin: 0;
  color: var(--red-muted);
  font-size: 0.8rem;
}
.explorer-count strong {
  color: var(--red-ink);
  font-weight: 600;
}
.entities-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}
.entity-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid rgb(36 18 7 / 3%);
  border-radius: 28px;
  background: var(--red-surface);
  box-shadow: 0 5px 16px rgb(36 18 7 / 3%);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.entity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgb(36 18 7 / 8%);
}
.entity-cover {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 27px 27px 0 0;
  background: var(--cover-background, #d9cfc0);
  color: var(--red-ink);
}
.entity-cover-blue {
  --cover-background: #aab8cc;
}
.entity-cover-peach {
  --cover-background: #dcb6a4;
}
.entity-cover-sand {
  --cover-background: #d9cfc0;
}
.entity-cover-yellow {
  --cover-background: #e8dcaa;
}
.entity-cover-sage {
  --cover-background: #c4cec0;
}
.entity-cover::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 83%;
  aspect-ratio: 1;
  top: 23%;
  left: -28%;
  border: 1px solid rgb(36 18 7 / 18%);
  border-radius: 50%;
}
.entity-cover::after {
  content: '';
  position: absolute;
  z-index: -1;
  width: 53%;
  aspect-ratio: 1;
  right: -13%;
  top: -12%;
  background: rgb(255 255 255 / 21%);
  transform: rotate(22deg);
}
.entity-country {
  position: absolute;
  top: 18px;
  left: 18px;
  display: inline-flex;
  max-width: calc(100% - 36px);
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  background: var(--red-surface);
  font-size: 0.7rem;
  font-weight: 500;
}
.entity-country-flag {
  width: 18px;
  height: auto;
  border-radius: 2px;
}
.entity-monogram {
  font-size: clamp(4rem, 7vw, 7rem);
  font-weight: 400;
  letter-spacing: -0.09em;
  line-height: 1;
}
.entity-logo {
  width: 60%;
  height: 54%;
  object-fit: contain;
}
.entity-cover-caption {
  position: absolute;
  bottom: 18px;
  left: 22px;
  right: 22px;
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.entity-card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 28px;
}
.entity-card h2 {
  margin: 0 0 0.75rem;
  color: var(--red-ink);
  font-size: clamp(1.5rem, 2.1vw, 1.9rem);
  font-weight: 400;
  line-height: 1.12;
  overflow-wrap: anywhere;
}
.entity-subtitle {
  margin: 0 0 1rem;
  color: var(--red-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}
.entity-purpose {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 1.2rem;
  color: var(--red-muted);
  font-size: 0.93rem;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
.entity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.5rem;
  margin: auto 0 1.25rem;
  padding-top: 0.4rem;
  color: var(--red-muted);
  font-size: 0.7rem;
}
.entity-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}
.entity-profile-link {
  position: relative;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  background: var(--red-soft);
  color: var(--red-ink);
  font-size: 0.75rem;
  text-decoration: none;
}
.entity-profile-link:hover {
  border-color: var(--red-ink);
}
.entity-open-button {
  align-self: flex-start;
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.6rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--red-ink);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.entity-open-button::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 28px;
  cursor: pointer;
}
.entity-open-button:focus-visible {
  outline: none;
}
.entity-open-button:focus-visible::after {
  outline: 2px solid var(--red-focus);
  outline-offset: 5px;
}
.entity-open-button span {
  font-size: 1rem;
  transition: transform 0.2s ease;
}
.entity-card:hover .entity-open-button span {
  transform: translateX(4px);
}
.red-observatorios-message {
  margin: 0;
  padding: 3rem 1.5rem;
  border-radius: 28px;
  background: var(--red-surface);
  color: var(--red-muted);
  text-align: center;
}
@media (max-width: 1050px) {
  .entities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .red-observatorios-search {
    align-items: stretch;
    flex-direction: column;
    gap: 0.75rem;
  }
  .red-observatorios-search :deep(.list-search-input) {
    max-width: none;
  }
  .explorer-count {
    text-align: right;
  }
}
@media (max-width: 620px) {
  .entities-grid {
    grid-template-columns: 1fr;
  }
  .entity-card-content {
    padding: 24px;
  }
  .entity-monogram {
    font-size: clamp(5rem, 20vw, 8rem);
  }
  .entity-card h2 {
    font-size: 1.75rem;
  }
}
</style>
