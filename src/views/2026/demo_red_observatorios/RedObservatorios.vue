<template>
  <main class="red-observatorios">
    <div class="red-observatorios-shell">
      <RedObservatoriosMenu />

      <div class="red-observatorios-content">
        <header v-if="currentTab === 'explorar'" class="directory-hero">
          <div>
            <p class="directory-eyebrow">Red de Observatorios · Iberoamérica</p>
            <h1>Conocimiento cultural que conecta Iberoamérica.</h1>
          </div>
          <p class="directory-intro">
            Conoce a las entidades y personas que investigan la cultura. Descubre sus miradas,
            encuentra afinidades y abre nuevas conversaciones.
          </p>
        </header>
        <RedObservatoriosCarousel v-if="currentTab === 'explorar'" />
        <div v-if="currentTab !== 'informacion' && loading" class="data-status" role="status">
          Cargando entidades y personas de la red...
        </div>
        <div v-else-if="currentTab !== 'informacion' && error" class="data-status" role="alert">
          <p>{{ error }}</p>
          <button type="button" class="btn btn-outline-secondary" @click="loadEntities">
            Reintentar
          </button>
        </div>
        <template v-if="!loading && !error">
          <RedObservatoriosLista v-show="currentTab === 'explorar'" :entidades="entidades" />
          <RedObservatoriosMapa v-if="currentTab === 'mapa'" :entidades="entidades" />
          <RedObservatoriosDataviz v-if="currentTab === 'conexiones'" :entidades="entidades" />
        </template>
        <RedObservatoriosInfo v-if="currentTab === 'informacion'" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchRedObservatoriosEntities } from '../../../utils/redObservatorios.js'
import RedObservatoriosCarousel from './RedObservatoriosCarousel.vue'
import RedObservatoriosDataviz from './RedObservatoriosDataviz.vue'
import RedObservatoriosInfo from './RedObservatoriosInfo.vue'
import RedObservatoriosLista from './RedObservatoriosLista.vue'
import RedObservatoriosMenu from './RedObservatoriosMenu.vue'
import './redObservatorios.css'

const RedObservatoriosMapa = defineAsyncComponent(() => import('./RedObservatoriosMapa.vue'))

const route = useRoute()
const entidades = ref([])
const loading = ref(true)
const error = ref('')

const loadEntities = async () => {
  loading.value = true
  error.value = ''

  try {
    entidades.value = await fetchRedObservatoriosEntities()
  } catch (loadError) {
    console.error('Error cargando las entidades de la red:', loadError)
    error.value = 'No se pudo cargar el directorio. Intenta nuevamente más tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(loadEntities)

const currentTab = computed(() => {
  const tab = route.query.tab

  return ['explorar', 'mapa', 'conexiones', 'informacion'].includes(tab) ? tab : 'explorar'
})
</script>

<style scoped>
.red-observatorios {
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3.4vw, 3.25rem) 5rem;
  background: var(--red-background);
  color: var(--red-ink);
}

.red-observatorios-shell {
  width: min(100%, 1320px);
  margin: 0 auto;
}

.red-observatorios-content {
  animation: fade-in 0.35s ease-out;
}

.data-status {
  padding: 3rem 1.5rem;
  border-radius: 28px;
  background: var(--red-surface);
  color: var(--red-muted);
  text-align: center;
}

.data-status button {
  border-color: var(--red-border);
  border-radius: 999px;
  padding: 0.65rem 1.4rem;
  color: var(--red-ink);
}

.data-status button:hover {
  background: var(--red-ink);
  color: var(--red-surface);
}

.directory-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(1.25rem, 3vw, 2.5rem);
  padding: 1.25rem 0 1.5rem;
}

.directory-eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.directory-hero h1 {
  max-width: 24ch;
  margin: 0;
  color: var(--red-ink);
  font-size: clamp(1.8rem, 3vw, 2.75rem);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1.12;
  text-wrap: balance;
}

.directory-intro {
  max-width: 38ch;
  margin: 0 0 0 auto;
  color: var(--red-muted);
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  line-height: 1.6;
  text-align: right;
}

@media (max-width: 760px) {
  .directory-hero {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .directory-hero h1 {
    font-size: clamp(1.75rem, 5.5vw, 2.25rem);
  }

  .directory-intro {
    max-width: 48ch;
    margin: 0;
    text-align: left;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
