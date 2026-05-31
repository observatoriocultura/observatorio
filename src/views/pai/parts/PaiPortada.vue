<template>
  <section class="pai-portada">
    <ColumnasAvance :investigaciones="investigaciones" />

    <div class="pai-kpis" aria-label="Resumen del Plan Anual de Investigaciones">
      <div class="pai-kpi-row">
        <span class="pai-kpi-row-label">Cantidad investigaciones</span>
        <div v-for="linea in kpisPorLinea" :key="`cantidad-${linea.key}`" class="pai-kpi">
          <span class="label pai-kpi-label" :class="linea.clase">{{ linea.nombre }}</span>
          <strong class="pai-kpi-value">{{ linea.total }}</strong>
        </div>
        <div class="pai-kpi">
          <span class="pai-kpi-label">Total</span>
          <strong class="pai-kpi-value">{{ totalInvestigaciones }}</strong>
        </div>
      </div>

      <div class="pai-kpi-row">
        <span class="pai-kpi-row-label">Avance</span>
        <div v-for="linea in kpisPorLinea" :key="`avance-${linea.key}`" class="pai-kpi">
          <span class="label pai-kpi-label" :class="linea.clase">{{ linea.nombre }}</span>
          <strong class="pai-kpi-value">{{ linea.avancePromedio }}%</strong>
        </div>
        <div class="pai-kpi">
          <span class="pai-kpi-label">Total</span>
          <strong class="pai-kpi-value">{{ avancePromedio }}%</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { toClassName } from '../../../utils/text'
import { lineasInvestigacion } from '../constants'
import ColumnasAvance from './ColumnasAvance.vue'

const props = defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
})

const getAvancePromedio = (investigaciones) => {
  const avances = investigaciones
    .map((investigacion) => Number(investigacion.avance))
    .filter(Number.isFinite)

  if (avances.length === 0) return 0

  const total = avances.reduce((sum, avance) => sum + avance, 0)
  return Math.round(total / avances.length)
}
const totalInvestigaciones = computed(() => props.investigaciones.length)
const kpisPorLinea = computed(() =>
  lineasInvestigacion.map((linea) => {
    const investigacionesLinea = props.investigaciones.filter(
      (investigacion) => toClassName(investigacion.linea_investigacion) === linea.key,
    )

    return {
      ...linea,
      total: investigacionesLinea.length,
      avancePromedio: getAvancePromedio(investigacionesLinea),
    }
  }),
)
const avancePromedio = computed(() => getAvancePromedio(props.investigaciones))
</script>

<style scoped>
.pai-portada {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1rem;
  padding: 2rem 0;
}

.pai-kpis {
  display: flex;
  width: min(100%, 920px);
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}

.pai-kpi-row {
  display: grid;
  grid-template-columns: 11rem repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 0.75rem;
}

.pai-kpi-row-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: right;
  text-transform: uppercase;
}

.pai-kpi {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
}

.pai-kpi-label {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.pai-kpi-label.label {
  color: #212529;
  text-transform: none;
}

.pai-kpi-value {
  color: #212529;
  font-size: 2rem;
  line-height: 1;
}

@media (max-width: 767.98px) {
  .pai-kpi-row {
    grid-template-columns: 1fr;
  }

  .pai-kpi-row-label {
    justify-content: center;
    text-align: center;
  }
}
</style>
