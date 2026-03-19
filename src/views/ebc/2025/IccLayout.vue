<script setup>
import { ref, onMounted, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import IccPortada from './icc/IccPortada.vue'
import IccResultados from './icc/IccResultados.vue'
import IccFicha from './icc/IccFicha.vue'
import IccDocs from './icc/IccDocs.vue'

const route = useRoute()
const codigoMedicion = 'm194'
const surveyInfo = ref(null)
const loading = ref(true)
const error = ref(null)

// Determinar la pestaña actual basada en el parámetro ?tab=
const currentTab = computed(() => route.query.tab || 'inicio')

// Proveemos los datos y el código para que cualquier subvista los use
provide('surveyInfo', surveyInfo)
provide('codigoMedicion', codigoMedicion)
provide('loading', loading)

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL
    const response = await fetch(`${baseUrl}content/mediciones/${codigoMedicion}/info.json`)
    if (!response.ok) throw new Error('No se pudo cargar la información de la medición')
    surveyInfo.value = await response.json()
  } catch (e) {
    console.error(e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="icc-layout">
    <div class="icc-shell">
      <nav class="survey-nav">
        <!-- Navegación basada en Query Params -->
        <RouterLink
          :to="{ path: route.path, query: { tab: 'inicio' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'inicio' }"
        >
          <i class="bi bi-house-door me-2"></i>Inicio
        </RouterLink>
        <RouterLink
          :to="{ path: route.path, query: { tab: 'resultados' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'resultados' }"
        >
          <i class="bi bi-bar-chart me-2"></i>Resultados
        </RouterLink>
        <RouterLink
          :to="{ path: route.path, query: { tab: 'ficha' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'ficha' }"
        >
          <i class="bi bi-file-earmark-text me-2"></i>Ficha Técnica
        </RouterLink>
        <RouterLink
          :to="{ path: route.path, query: { tab: 'docs' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'docs' }"
        >
          <i class="bi bi-journal-code me-2"></i>Docs Técnica
        </RouterLink>
      </nav>

      <main class="icc-view-content">
        <div v-if="loading" class="placeholder-loading">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>
        <div v-else-if="error" class="error-box">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ error }}</p>
        </div>
        <div v-else class="icc-tabs-container">
          <!-- Usamos v-show para que el estado de los componentes se mantenga al cambiar de pestaña -->
          <IccPortada v-show="currentTab === 'inicio'" />
          <IccResultados v-show="currentTab === 'resultados'" />
          <IccFicha v-show="currentTab === 'ficha'" />
          <IccDocs v-show="currentTab === 'docs'" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.icc-layout {
  min-height: 100vh;
  padding: 0.3rem 1.5em; /* Padding lateral de 1.5em como se solicitó */
  background-color: #ffffff;
}

.icc-shell {
  width: 100%;
  margin: 0;
}

.icc-header-main {
  margin-bottom: 2.5rem;
}

.eyebrow {
  display: block;
  margin-bottom: 0.5rem;
  color: #8c96a0;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.main-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: #32204a;
  line-height: 1.1;
}

.survey-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eef0f2;
  padding-bottom: 0.25rem;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #5c6972;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.45rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: #32204a;
  background: #f9f9fb;
}

.nav-tab.active {
  color: #32204a;
  background: #f0ebf7;
}

.icc-view-content {
  animation: fadeIn 0.4s ease-out;
}

.placeholder-loading {
  text-align: center;
  padding: 4rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #32204a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-box {
  text-align: center;
  padding: 3rem;
  background: #fff5f5;
  border-radius: 12px;
  color: #c53030;
}

.error-box i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .survey-nav {
    gap: 0.25rem;
  }
  .nav-tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
