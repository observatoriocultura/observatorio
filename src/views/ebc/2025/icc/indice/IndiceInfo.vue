<script setup>
import { computed } from 'vue'

const props = defineProps({
  indices: { type: Array, default: () => [] },
})

/** Índice General (nivel 1) */
const indiceGeneral = computed(() => props.indices.find((i) => i.nivel === 1))

/** Subíndices (nivel 2) */
const subindices = computed(() => props.indices.filter((i) => i.nivel === 2))

/** Mapeo de colores por llave (basado en constants.js MENU_PRINCIPAL) */
const getColor = (key) => {
  const colors = {
    indice: '#654096',
    inclusion: '#FF9800',
    genero: '#AB47BC',
    politica: '#2196F3',
    convivencia: '#FF4081',
    espacio: '#00BCD4',
    ambiental: '#4CAF50',
    movilidad: '#78909C',
  }
  return colors[key] || '#6c757d'
}

/** Iconos sugeridos por dimensión */
const getIcon = (key) => {
  const icons = {
    indice: 'bi-speedometer2',
    inclusion: 'bi-people-fill',
    genero: 'bi-gender-ambiguous',
    politica: 'bi-bank',
    convivencia: 'bi-chat-heart',
    espacio: 'bi-tree',
    ambiental: 'bi-leaf',
    movilidad: 'bi-bicycle',
  }
  return icons[key] || 'bi-info-circle'
}
</script>

<template>
  <div class="indice-info container">
    <div class="row g-4 justify-content-center">
      <!-- Sección Principal: Índice General -->
      <div v-if="indiceGeneral" class="col-12">
        <div class="info-card main-card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
          <div class="row g-0">
            <div
              class="col-md-1 d-flex align-items-center justify-content-center text-white"
              :style="{ backgroundColor: getColor('indice') }"
            >
              <i :class="getIcon('indice')" class="fs-1 py-4"></i>
            </div>
            <div class="col-md-11">
              <div class="card-body p-4">
                <h3
                  class="card-title fw-bold text-uppercase mb-2"
                  :style="{ color: getColor('indice') }"
                >
                  {{ indiceGeneral.nombre }}
                </h3>
                <p class="card-text lead text-muted lh-base">
                  {{ indiceGeneral.descripcion }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Título de dimensiones -->
      <div class="col-12 mt-2">
        <h4 class="fw-bold text-secondary text-uppercase small ls-wide mb-3">
          <i class="bi bi-grid-fill me-2"></i>Dimensiones del Índice
        </h4>
      </div>

      <!-- Grid de Subíndices (Dos columnas) -->
      <div v-for="sub in subindices" :key="sub.num" class="col-md-6">
        <div class="info-card sub-card h-100 shadow-sm border-0 rounded-4 p-4 transition-hover">
          <div class="d-flex align-items-center mb-3">
            <div
              class="icon-box rounded-3 d-flex align-items-center justify-content-center me-3"
              :style="{ backgroundColor: getColor(sub.key), color: 'white' }"
            >
              <i :class="getIcon(sub.key)" class="fs-4"></i>
            </div>
            <h5 class="m-0 fw-bold" :style="{ color: getColor(sub.key) }">
              {{ sub.nombre }}
            </h5>
          </div>
          <p class="card-text text-muted small lh-lg mb-0">
            {{ sub.descripcion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.indice-info {
  padding: 1rem 0;
  animation: fadeIn 0.5s ease-out;
  max-width: 960px; /* Limitamos un poco más el ancho para lectura óptima */
}

.info-card {
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-card {
  border-left: 5px solid #654096;
}

.sub-card {
  border-bottom: 3px solid transparent;
}

.sub-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.icon-box {
  width: 48px;
  height: 48px;
  min-width: 48px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.ls-wide {
  letter-spacing: 0.15em;
}

.transition-hover:hover {
  border-bottom-color: currentColor;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .col-md-1 {
    display: none !important;
  }
}
</style>
