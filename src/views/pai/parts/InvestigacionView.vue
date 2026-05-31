<template>
  <section v-if="investigacion" class="investigacion-detalle" aria-label="Detalle de investigacion">
    <button type="button" class="volver-lista" @click="emit('back')">
      Volver a la lista
    </button>

    <header class="investigacion-detalle-header">
      <div class="investigacion-detalle-titulos">
        <span
          v-if="investigacion.linea_investigacion"
          class="label"
          :class="getLineaClass(investigacion.linea_investigacion)"
        >
          {{ investigacion.linea_investigacion }}
        </span>
        <span v-else class="text-muted">Sin linea registrada</span>

        <h2>{{ investigacion.nombre_clave }}</h2>
        <p>{{ investigacion.titulo }}</p>
      </div>

      <div class="avance-general" aria-label="Avance general">
        <span>Avance total</span>
        <strong>{{ formatAvance(investigacion.avance) }}</strong>
      </div>
    </header>

    <p v-if="investigacion.descripcion" class="investigacion-descripcion">
      {{ investigacion.descripcion }}
    </p>

    <div class="etapas-detalle" aria-label="Avance por etapas">
      <article v-for="etapa in etapasDetalle" :key="etapa.codigo" class="etapa-detalle">
        <div class="etapa-detalle-header">
          <span class="label etapa-codigo" :class="etapa.className">{{ etapa.codigo }}</span>
          <div>
            <h3>{{ etapa.nombre }}</h3>
            <p>{{ etapa.descripcion }}</p>
          </div>
          <strong>{{ formatAvance(etapa.avance) }}</strong>
        </div>

        <div
          class="progress"
          role="progressbar"
          :aria-label="`Avance de ${etapa.nombre}`"
          :aria-valuenow="getAvanceValue(etapa.avance)"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-bar" :style="{ width: `${getAvanceValue(etapa.avance)}%` }"></div>
        </div>

        <span class="etapa-peso">Peso en el plan: {{ formatPeso(etapa.peso) }}</span>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { toClassName } from '../../../utils/text'
import { etapasInvestigacion } from '../constants'

const props = defineProps({
  investigacion: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back'])

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

const getLineaClass = (linea) => `bg-${toClassName(linea)}`

const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}

const formatAvance = (value) => `${getAvanceValue(value)}%`
const formatPeso = (value) => `${Math.round(Number(value) * 100)}%`

const etapasDetalle = computed(() =>
  etapasInvestigacion.map((etapa) => ({
    ...etapa,
    className: clasePorEtapa[etapa.codigo],
    avance: props.investigacion?.[campoAvancePorEtapa[etapa.codigo]],
  })),
)
</script>

<style scoped>
.investigacion-detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1.25rem;
}

.volver-lista {
  align-self: flex-start;
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  background-color: #fff;
  padding: 0.45rem 0.75rem;
  color: #212529;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
}

.volver-lista:hover,
.volver-lista:focus {
  border-color: #654096;
  color: #654096;
}

.volver-lista:focus {
  outline: 3px solid rgba(101, 64, 150, 0.18);
  outline-offset: 2px;
}

.investigacion-detalle-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
}

.investigacion-detalle-titulos {
  min-width: 0;
}

.investigacion-detalle h2 {
  margin: 0.6rem 0 0.35rem;
  color: #212529;
  font-size: 1.35rem;
  line-height: 1.2;
}

.investigacion-detalle p {
  margin: 0;
  color: #495057;
  font-size: 0.92rem;
  line-height: 1.45;
}

.avance-general {
  display: flex;
  min-width: 7rem;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 3px solid #654096;
  padding-left: 0.85rem;
  text-align: right;
}

.avance-general span,
.etapa-peso {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.avance-general strong {
  color: #212529;
  font-size: 2rem;
  line-height: 1;
}

.investigacion-descripcion {
  border-top: 1px solid #eeeeee;
  padding-top: 1rem;
}

.etapas-detalle {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.etapa-detalle {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.55rem;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 0.85rem;
}

.etapa-detalle-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.65rem;
  align-items: start;
}

.etapa-codigo {
  display: inline-flex;
  width: 1.8rem;
  height: 1.8rem;
  align-items: center;
  justify-content: center;
  color: #212529;
}

.etapa-detalle h3 {
  margin: 0 0 0.2rem;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.2;
}

.etapa-detalle-header strong {
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.2;
}

.progress {
  height: 0.45rem;
  border-radius: 999px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: inherit;
  background-color: #654096;
}

@media (min-width: 992px) {
  .etapas-detalle {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .investigacion-detalle-header {
    grid-template-columns: 1fr;
  }

  .avance-general {
    border-left: 0;
    border-top: 3px solid #654096;
    padding-top: 0.75rem;
    padding-left: 0;
    text-align: left;
  }
}
</style>
