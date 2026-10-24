<template>
  <main class="red-observatorios red-observatorios-perfil">
    <div class="profile-shell">
      <RedObservatoriosMenu />
      <RouterLink :to="directoryLocation" class="profile-back">
        <i class="bi bi-arrow-left" aria-hidden="true"></i>
        Volver a Explorar
      </RouterLink>

      <div v-if="loading" class="profile-status" role="status">Cargando el perfil…</div>
      <div v-else-if="error" class="profile-status" role="alert">
        <h1>No pudimos cargar el perfil</h1>
        <p>{{ error }}</p>
        <button type="button" class="profile-button" @click="loadEntities">Reintentar</button>
      </div>
      <article
        v-else-if="entidad"
        class="entity-profile"
        :style="{ '--profile-country-color': getRigccCountryColor(entidad.pais_territorio) }"
        aria-labelledby="entity-profile-title"
      >
        <header class="profile-header">
          <div class="profile-heading">
            <p class="profile-country">
              <i class="bi bi-geo-alt" aria-hidden="true"></i>
              {{ getRigccCountryLabel(entidad.pais_territorio) }}
            </p>
            <p class="profile-kicker">
              {{ getEntityFieldLabel('tipo_actor', entidad.tipo_actor) }} · Red de Observatorios
            </p>
            <h1 id="entity-profile-title">{{ entidad.nombre }}</h1>
            <p v-if="entidad.subtitulo" class="profile-subtitle">{{ entidad.subtitulo }}</p>
          </div>
          <div v-if="entidad.logo_url && !logoFailed" class="profile-logo-box">
            <img :src="entidad.logo_url" class="profile-logo" alt="" @error="logoFailed = true" />
          </div>
        </header>

        <div class="profile-body">
          <section class="profile-description" aria-labelledby="profile-description-title">
            <p class="profile-kicker">Descripción</p>
            <h2 id="profile-description-title">Su mirada sobre la cultura</h2>
            <p>{{ entidad.descripcion || 'Este registro aún no cuenta con una descripción.' }}</p>
          </section>

          <section class="profile-facts" aria-labelledby="profile-facts-title">
            <h2 id="profile-facts-title">Información del perfil</h2>
            <dl>
              <div>
                <dt>Tipo de actor</dt>
                <dd>{{ getEntityFieldLabel('tipo_actor', entidad.tipo_actor) }}</dd>
              </div>
              <div>
                <dt>Tipo de entidad</dt>
                <dd>{{ getEntityFieldLabel('tipo_entidad', entidad.tipo_entidad) }}</dd>
              </div>
              <div>
                <dt>Naturaleza institucional</dt>
                <dd>
                  {{
                    getEntityFieldLabel(
                      'naturaleza_institucional',
                      entidad.naturaleza_institucional,
                    )
                  }}
                </dd>
              </div>
              <div>
                <dt>Escala territorial</dt>
                <dd>{{ getEntityFieldLabel('escala_territorial', entidad.escala_territorial) }}</dd>
              </div>
              <div>
                <dt>País o territorio</dt>
                <dd>{{ getRigccCountryLabel(entidad.pais_territorio) }}</dd>
              </div>
              <div v-if="entidad.ciudad">
                <dt>Ciudad</dt>
                <dd>{{ entidad.ciudad }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <RedObservatoriosPerfilDetalles :entidad-id="entidad.id" include-drafts />

        <section v-if="entidad.notas" class="profile-notes" aria-labelledby="profile-notes-title">
          <h2 id="profile-notes-title">Notas del registro</h2>
          <p>{{ entidad.notas }}</p>
        </section>

        <footer v-if="entidad.url_principal" class="profile-footer">
          <a
            :href="entidad.url_principal"
            class="profile-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visitar sitio o perfil
            <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
          </a>
        </footer>
      </article>
      <div v-else class="profile-status" role="status">
        <h1>No encontramos este perfil</h1>
        <p>No hay una entidad o persona disponible para esta dirección.</p>
        <RouterLink :to="directoryLocation" class="profile-button"
          >Explorar el directorio</RouterLink
        >
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getRigccCountryColor, getRigccCountryLabel } from '../../../constants/catalogs/index.js'
import {
  fetchRedObservatoriosEntities,
  getEntityFieldLabel,
} from '../../../utils/redObservatorios.js'
import RedObservatoriosMenu from './RedObservatoriosMenu.vue'
import RedObservatoriosPerfilDetalles from './RedObservatoriosPerfilDetalles.vue'
import './redObservatorios.css'

const route = useRoute()
const directoryLocation = { name: 'Demo Red de Observatorios', query: { tab: 'explorar' } }
const entities = ref([])
const loading = ref(true)
const error = ref('')
const logoFailed = ref(false)
const entidad = computed(() => entities.value.find((entity) => entity.slug === route.params.slug))
let requestVersion = 0

async function loadEntities() {
  const version = ++requestVersion
  loading.value = true
  error.value = ''
  try {
    const rows = await fetchRedObservatoriosEntities()
    if (version === requestVersion) entities.value = rows
  } catch (loadError) {
    if (version !== requestVersion) return
    console.error('Error cargando el perfil de la red:', loadError)
    error.value = 'No se pudo consultar el directorio. Intenta nuevamente más tarde.'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

watch(entidad, (entity) => {
  logoFailed.value = false
  document.title = entity
    ? `${entity.nombre} | Red de Observatorios`
    : 'Perfil | Red de Observatorios'
})
watch(
  () => route.params.slug,
  () => window.scrollTo(0, 0),
)

onMounted(() => {
  window.scrollTo(0, 0)
  loadEntities()
})
onBeforeUnmount(() => {
  requestVersion++
})
</script>

<style scoped>
.red-observatorios-perfil {
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3.4vw, 3.25rem) 5rem;
  background: var(--red-background);
}
.profile-shell {
  width: min(100%, 1320px);
  margin: 0 auto;
}
.profile-back {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  margin: 0.75rem 0 1.25rem;
  color: var(--red-muted);
  font-size: 0.8rem;
  text-decoration: none;
}
.profile-back:hover {
  color: var(--red-ink);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.entity-profile {
  overflow: hidden;
  border: 1px solid var(--red-border);
  border-radius: 30px;
  background: var(--red-surface);
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: linear-gradient(120deg, var(--red-soft), var(--profile-country-color));
}
.profile-heading {
  flex: 1;
  min-width: 0;
}
.profile-country {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  background: var(--red-surface);
  font-size: 0.75rem;
}
.profile-kicker {
  margin: 0 0 0.75rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.profile-heading h1 {
  max-width: 25ch;
  margin: 0;
  color: var(--red-ink);
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}
.profile-subtitle {
  max-width: 65ch;
  margin: 1rem 0 0;
  color: var(--red-muted);
  font-size: 1rem;
}
.profile-logo-box {
  display: grid;
  place-items: center;
  flex: 0 0 180px;
  width: 180px;
  min-height: 160px;
  border-radius: 24px;
  padding: 1.25rem;
  background: var(--red-surface);
}
.profile-logo {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: contain;
}
.profile-body {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 1fr);
  gap: 2.5rem;
  padding: clamp(1.5rem, 4vw, 3rem);
}
.profile-body h2,
.profile-notes h2 {
  margin: 0 0 1rem;
  color: var(--red-ink);
  font-size: 1.65rem;
  line-height: 1.2;
}
.profile-description p:last-child,
.profile-notes p {
  margin: 0;
  color: var(--red-muted);
  font-size: 0.95rem;
  line-height: 1.8;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.profile-facts {
  min-width: 0;
  border-left: 1px solid var(--red-border);
  padding-left: 2.5rem;
}
.profile-facts dl {
  display: grid;
  gap: 1.25rem;
  margin: 0;
}
.profile-facts dt {
  margin-bottom: 0.3rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.profile-facts dd {
  margin: 0;
  color: var(--red-ink);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.profile-notes {
  border-top: 1px solid var(--red-border);
  padding: clamp(1.5rem, 4vw, 3rem);
  background: var(--red-soft);
}
.profile-notes h2 {
  font-size: 1.25rem;
}
.profile-notes p {
  font-size: 0.8rem;
}
.profile-footer {
  border-top: 1px solid var(--red-border);
  padding: 1.5rem clamp(1.5rem, 4vw, 3rem);
}
.profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 44px;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  padding: 0.65rem 1.25rem;
  background: var(--red-surface);
  color: var(--red-ink);
  font-size: 0.8rem;
  text-decoration: none;
}
.profile-button:hover {
  border-color: var(--red-ink);
}
.profile-status {
  border-radius: 28px;
  padding: 3rem 1.5rem;
  background: var(--red-surface);
  color: var(--red-muted);
  text-align: center;
}
.profile-status h1 {
  margin-bottom: 1rem;
  color: var(--red-ink);
  font-size: 2rem;
}
.profile-status p {
  margin-bottom: 1.5rem;
}
@media (max-width: 760px) {
  .profile-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.5rem;
  }
  .profile-logo-box {
    flex-basis: auto;
    width: 140px;
    min-height: 120px;
    padding: 1rem;
  }
  .profile-logo {
    height: 90px;
  }
  .profile-body {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .profile-facts {
    border-left: 0;
    border-top: 1px solid var(--red-border);
    padding: 2rem 0 0;
  }
}
</style>
