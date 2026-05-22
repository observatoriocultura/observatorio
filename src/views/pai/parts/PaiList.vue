<template>
  <div class="investigaciones-container">
    <div
      v-for="investigacion in investigaciones"
      :key="investigacion.id"
      class="investigacion-card"
    >
      <p class="mb-1">
        <span
          v-if="investigacion.linea_investigacion"
          class="label"
          :class="getLineaClass(investigacion.linea_investigacion)"
        >
          {{ investigacion.linea_investigacion }}
        </span>
        <span v-else>Sin línea registrada</span>
      </p>
      <h3 class="h5 mb-2">{{ investigacion.nombre_clave }}</h3>
      <p>{{ investigacion.titulo }}</p>
      <div class="avance-indicadores" aria-label="Indicadores de avance">
        <div v-for="indicador in indicadoresAvance" :key="indicador.key" class="avance-item">
          <span class="label avance-etapa" :class="indicador.className">
            {{ indicador.label }}
          </span>
          <div
            class="progress"
            role="progressbar"
            :aria-label="indicador.title"
            :aria-valuenow="getAvanceValue(investigacion[indicador.key])"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="progress-bar"
              :style="{ width: `${getAvanceValue(investigacion[indicador.key])}%` }"
            ></div>
          </div>
          <strong class="avance-valor">{{ formatAvance(investigacion[indicador.key]) }}</strong>
          <span class="visually-hidden">
            {{ indicador.title }}:
            {{ formatAvance(investigacion[indicador.key]) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toClassName } from '../../../utils/text'
import { etapasInvestigacion } from '../constants'

defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
})

const getLineaClass = (linea) => `bg-${toClassName(linea)}`
const campoAvancePorEtapa = {
  P: 'avance_planeacion',
  I: 'avance_instrumentos',
  R: 'avance_recoleccion',
  D: 'avance_documentacion',
  F: 'avance_finalizacion',
}
const clasePorEtapa = {
  P: 'etapa-planeacion',
  I: 'etapa-instrumento',
  R: 'etapa-recoleccion',
  D: 'etapa-documentacion',
  F: 'etapa-finalizacion',
}
const indicadoresAvance = etapasInvestigacion.map((etapa) => ({
  key: campoAvancePorEtapa[etapa.codigo],
  label: etapa.codigo,
  title: `Avance de ${etapa.nombre}`,
  className: clasePorEtapa[etapa.codigo],
}))
const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}
const formatAvance = (value) => `${getAvanceValue(value)}%`
</script>

<style scoped>
.investigaciones-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  width: 100%;
}

.investigacion-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
}

.investigacion-card h3 {
  font-size: 1rem;
  line-height: 1.25;
}

.investigacion-card p {
  font-size: 0.875rem;
  line-height: 1.35;
}

.avance-indicadores {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.75rem;
}

.avance-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 2.25rem;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.avance-etapa {
  display: inline-flex;
  width: 1.35rem;
  height: 1.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #212529;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
}

.avance-valor {
  color: #212529;
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: right;
}

.avance-item .progress {
  height: 0.35rem;
  border-radius: 999px;
  background-color: #e9ecef;
}

.avance-item .progress-bar {
  border-radius: inherit;
  background-color: #654096;
}

@media (min-width: 576px) {
  .investigaciones-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .investigaciones-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .investigaciones-container {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
