<script setup>
import { inject } from 'vue'

const surveyInfo = inject('surveyInfo')
const codigoMedicion = inject('codigoMedicion')

const formatDate = (dateString) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="icc-portada container">
    <div v-if="surveyInfo" class="portada-content">
      <div class="stats-grid">
        <div class="stat-card">
          <i class="bi bi-tag-fill"></i>
          <div class="stat-info">
            <span class="stat-label">Código de medición</span>
            <span class="stat-value">{{ codigoMedicion }}</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="bi bi-calendar-check"></i>
          <div class="stat-info">
            <span class="stat-label">Fecha de inicio</span>
            <span class="stat-value">{{ formatDate(surveyInfo.fecha_inicio) }}</span>
          </div>
        </div>
      </div>

      <div class="welcome-box">
        <h3>Resumen de la medición</h3>
        <p>
          Esta sección presenta los resultados generales de la encuesta sobre
          <strong>{{ surveyInfo.nombre_medicion }}</strong
          >. Explore las diferentes pestañas para conocer los hallazgos detallados y la información
          técnica del estudio.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #f9f9fb;
  border-radius: 16px;
  border: 1px solid #eef0f2;
}

.stat-card i {
  font-size: 1.75rem;
  color: #32204a;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #8c96a0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a1a1a;
}

.welcome-box {
  padding: 2rem;
  background: #fdfaf5;
  border-radius: 16px;
  border-left: 4px solid #fcdea0;
}

.welcome-box h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #32204a;
  margin-bottom: 1rem;
}

.welcome-box p {
  color: #5c6972;
  line-height: 1.7;
  margin: 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #32204a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
