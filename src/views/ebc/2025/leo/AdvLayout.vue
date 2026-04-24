<script setup>
import { ref, onMounted, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdvPortada from './AdvPortada.vue'
import AdvResultados from '../icc/AdvResultados.vue'
import AdvIndice from '../icc/AdvIndice.vue'
import AdvFicha from '../icc/AdvFicha.vue'
import AdvCreditos from '../icc/AdvCreditos.vue'
import * as surveyConstants from './constants'

const route = useRoute()
const codigoMedicion = 'm196'
const surveyInfo = ref(null)
const loading = ref(true)
const error = ref(null)

// Proveemos las constantes locales para que cualquier subvista las use
provide('surveyConstants', surveyConstants)

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
  <div class="adv-layout">
    <div class="adv-shell">
      <nav class="survey-nav">
        <!-- Navegación basada en Query Params -->
        <RouterLink
          :to="{ query: { tab: 'inicio' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'inicio' }"
        >
          <i class="bi bi-house-door me-2"></i>Inicio
        </RouterLink>
        <RouterLink
          :to="{ query: { tab: 'resultados' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'resultados' }"
        >
          <i class="bi bi-bar-chart me-2"></i>Resultados
        </RouterLink>
        <RouterLink
          :to="{ query: { tab: 'ficha' } }"
          class="nav-tab"
          :class="{ active: currentTab === 'ficha' }"
        >
          <i class="bi bi-file-earmark-text me-2"></i>Ficha Técnica
        </RouterLink>
      </nav>

      <main class="adv-view-content">
        <div v-if="loading" class="placeholder-loading">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>
        <div v-else-if="error" class="error-box">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ error }}</p>
        </div>
        <div v-else class="adv-tabs-container">
          <!-- Usamos v-show para que el estado de los componentes se mantenga al cambiar de pestaña -->
          <AdvPortada v-show="currentTab === 'inicio'" />
          <AdvResultados v-show="currentTab === 'resultados'" />
          <AdvIndice v-show="currentTab === 'indice'" />
          <AdvFicha v-show="currentTab === 'ficha'" />
          <AdvCreditos v-show="currentTab === 'creditos'" />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* ==========================================================================
   DESIGN SYSTEM GLOBAL (Variables y Utilidades)
   ========================================================================== */
:root {
  --color-primary: #32204a;
  --color-primary-light: #f0ebf7;
  --color-secondary: #5c6972;
  --color-muted: #8c96a0;
  --color-contrast: #ffca28;
  --radius-premium: 12px;
  --radius-pill: 50px;
  --shadow-premium: 0 4px 12px rgba(50, 32, 74, 0.05);
}

/* Selectores Premium Unificados */
.select-premium {
  border: 1px solid #eef0f2 !important;
  border-radius: var(--radius-premium) !important;
  padding: 0.75rem 1rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  background-color: #f8fafc !important;
  color: var(--color-primary) !important;
}

.select-premium.active-filter {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary-light) !important;
  box-shadow: 0 0 0 4px rgba(50, 32, 74, 0.03) !important;
}

.select-premium:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 4px rgba(50, 32, 74, 0.05) !important;
  background-color: #fff !important;
}

/* Tarjetas y Contenedores */
.card-premium {
  background: #ffffff;
  border: 0 !important;
  border-radius: var(--radius-premium) !important;
  box-shadow: var(--shadow-premium) !important;
}

/* Tipografía */
.text-premium {
  color: var(--color-primary);
}

.title-premium {
  color: var(--color-primary);
  font-weight: 800;
  letter-spacing: -0.01em;
}
</style>

<style scoped>
.adv-layout {
  min-height: 100vh;
  padding: 0.3rem 1.5em; /* Padding lateral de 1.5em como se solicitó */
  background-color: #ffffff;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

.adv-shell {
  width: 100%;
  margin: 0;
}

.survey-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-secondary);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.45rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: var(--color-primary);
  background: #f9f9fb;
}

.nav-tab.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.adv-view-content {
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
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-box {
  text-align: center;
  padding: 3rem;
  background: #fff5f5;
  border-radius: var(--radius-premium);
  color: #c53030;
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
  .nav-tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
