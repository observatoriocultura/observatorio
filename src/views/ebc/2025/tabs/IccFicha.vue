<script setup>
import { inject } from 'vue'

const surveyInfo = inject('surveyInfo')
</script>

<template>
  <div class="icc-ficha container">
    <div v-if="surveyInfo" class="ficha-content">
      <h3>Especificaciones Técnicas</h3>

      <div class="ficha-table">
        <div class="ficha-row">
          <div class="ficha-label">Nombre de la medición</div>
          <div class="ficha-value">{{ surveyInfo.nombre_medicion }}</div>
        </div>
        <div class="ficha-row">
          <div class="ficha-label">Universo</div>
          <div class="ficha-value">Ciudadanos de Bogotá de 18 años y más</div>
        </div>
        <div class="ficha-row">
          <div class="ficha-label">Tamaño de la muestra</div>
          <div class="ficha-value">{{ surveyInfo.tamano_muestra.toLocaleString() }} encuestas</div>
        </div>
        <div class="ficha-row">
          <div class="ficha-label">Población representada</div>
          <div class="ficha-value">
            {{ Math.round(surveyInfo.sumatoria_factor).toLocaleString() }} personas
          </div>
        </div>
        <div class="ficha-row">
          <div class="ficha-label">Margen de error</div>
          <div class="ficha-value">+/- 1.5%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ficha-content h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #32204a;
  margin-bottom: 2rem;
}

.ficha-table {
  border: 1px solid #eef0f2;
  border-radius: 12px;
  overflow: hidden;
}

.ficha-row {
  display: grid;
  grid-template-columns: 300px 1fr;
  border-bottom: 1px solid #eef0f2;
}

.ficha-row:last-child {
  border-bottom: none;
}

.ficha-label {
  padding: 1.25rem 1.5rem;
  background: #f9f9fb;
  font-weight: 700;
  color: #5c6972;
  font-size: 0.9rem;
}

.ficha-value {
  padding: 1.25rem 1.5rem;
  color: #1a1a1a;
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .ficha-row {
    grid-template-columns: 1fr;
  }
  .ficha-label {
    background: #f2f3f5;
    padding: 0.75rem 1.5rem;
  }
}
</style>
