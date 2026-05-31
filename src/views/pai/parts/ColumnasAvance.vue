<template>
  <div
    ref="avanceColumnasRef"
    class="pai-avance-columnas"
    aria-label="Columnas de avance por investigacion"
  >
    <h2 class="pai-avance-columnas-title">Columnas de avance</h2>
    <div class="pai-avance-columnas-list">
      <RouterLink
        v-for="investigacion in investigacionesConAvance"
        :key="investigacion.id"
        :to="getInvestigacionRoute(investigacion)"
        class="pai-avance-columna-item"
        :aria-label="`Ver detalle de ${investigacion.nombreClave}`"
      >
        <div
          class="pai-avance-columna"
          role="progressbar"
          :aria-label="`Avance de investigacion ${investigacion.id}`"
          :aria-valuenow="investigacion.avance"
          aria-valuemin="0"
          aria-valuemax="100"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          :data-bs-title="investigacion.nombreClave"
        >
          <div
            class="pai-avance-columna-fill"
            :style="{ height: `${investigacion.avance}%` }"
          ></div>
        </div>
        <span
          class="pai-avance-columna-id"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          :data-bs-title="investigacion.nombreClave"
        >
          {{ investigacion.id }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { Tooltip } from 'bootstrap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()
const avanceColumnasRef = ref(null)
let tooltipInstances = []

const disposeTooltips = () => {
  tooltipInstances.forEach((tooltip) => tooltip.dispose())
  tooltipInstances = []
}

const initTooltips = async () => {
  await nextTick()
  disposeTooltips()

  if (!avanceColumnasRef.value) return

  tooltipInstances = Array.from(
    avanceColumnasRef.value.querySelectorAll('[data-bs-toggle="tooltip"]'),
  ).map((element) => new Tooltip(element))
}

const getInvestigacionRoute = (investigacion) => ({
  query: {
    ...route.query,
    tab: 'listado',
    seccion: 'details',
    investigacion_id: investigacion.id,
  },
})

const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}

const investigacionesConAvance = computed(() =>
  props.investigaciones.map((investigacion) => ({
    id: investigacion.id,
    nombreClave: investigacion.nombre_clave,
    avance: getAvanceValue(investigacion.avance),
  })),
)

onMounted(initTooltips)
onBeforeUnmount(disposeTooltips)
watch(investigacionesConAvance, initTooltips)
</script>

<style scoped>
.pai-avance-columnas {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  background-color: #fff;
  padding: 1rem;
}

.pai-avance-columnas-title {
  margin: 0;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
}

.pai-avance-columnas-list {
  display: flex;
  min-width: 0;
  align-items: end;
  justify-content: center;
  gap: 0.45rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.pai-avance-columna-item {
  display: flex;
  flex: 0 0 auto;
  min-width: 1.6rem;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  border-radius: 6px;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}

.pai-avance-columna-item:focus {
  outline: 3px solid rgba(101, 64, 150, 0.18);
  outline-offset: 3px;
}

.pai-avance-columna {
  display: flex;
  width: 1rem;
  height: 5em;
  align-items: end;
  overflow: hidden;
  border-radius: 999px;
  background-color: #e9ecef;
}

.pai-avance-columna-fill {
  width: 100%;
  border-radius: inherit;
  background-color: #654096;
}

.pai-avance-columna-id {
  color: #495057;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
}
</style>
