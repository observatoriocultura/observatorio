<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  datosPorLocalidad: { type: Array, required: true },
  indices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  numPeriodos: { type: Number, required: true },
})

/** Índice seleccionado para la tabla (se inicializa al primer índice disponible) */
const indiceSeleccionado = ref(null)

watch(
  () => props.indices,
  (nuevos) => {
    if (nuevos.length && indiceSeleccionado.value === null) {
      indiceSeleccionado.value = nuevos[0].cod
    }
  },
  { immediate: true },
)

/** Orden de la tabla */
const ordenAsc = ref(false)

/** Nombres de los periodos (genéricos) */
const nombresPeriodos = computed(() => {
  const labels = ['2021', '2023', '2025']
  // Devolver solo los últimos N periodos correspondientes
  return labels.slice(labels.length - props.numPeriodos)
})

/** Nombre del índice seleccionado */
const nombreIndice = computed(() => {
  const idx = props.indices.find((i) => i.cod === indiceSeleccionado.value)
  return idx ? idx.nombre : ''
})

/** Datos de tabla: localidad + valores por periodo */
const filas = computed(() => {
  return props.datosPorLocalidad
    .map((d) => {
      const vals = d.indices[indiceSeleccionado.value] || []
      return {
        localidad_cod: d.localidad_cod,
        localidad: d.localidad,
        valores: vals,
        ultimo: vals.length > 0 ? vals[vals.length - 1] : null,
      }
    })
    .sort((a, b) => {
      const va = a.ultimo ?? -1
      const vb = b.ultimo ?? -1
      return ordenAsc.value ? va - vb : vb - va
    })
})

const formatValor = (v) => {
  if (v === null || v === undefined) return '—'
  return (v * 100).toFixed(1)
}

const colorCelda = (valor) => {
  if (valor === null || valor === undefined) return ''
  if (valor >= 0.6) return 'celda-alta'
  if (valor >= 0.45) return 'celda-media'
  return 'celda-baja'
}
</script>

<template>
  <div class="indice-tabla container">
    <!-- Controles -->
    <div class="tabla-controles mb-3">
      <div class="row align-items-center g-3">
        <div class="col-md-6">
          <select v-model="indiceSeleccionado" class="form-select select-premium">
            <option v-for="idx in indices" :key="idx.cod" :value="idx.cod">
              {{ idx.nombre }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-sm btn-outline-secondary w-100" @click="ordenAsc = !ordenAsc">
            <i :class="ordenAsc ? 'bi bi-sort-numeric-up' : 'bi bi-sort-numeric-down-alt'"></i>
            {{ ordenAsc ? 'Menor a mayor' : 'Mayor a menor' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Título -->
    <h5 class="tabla-titulo mb-3">{{ nombreIndice }}</h5>

    <!-- Tabla responsiva -->
    <div class="table-responsive">
      <table class="table table-hover tabla-indice">
        <thead>
          <tr>
            <th class="th-pos">#</th>
            <th class="th-localidad">Localidad</th>
            <th v-for="(nombre, i) in nombresPeriodos" :key="'p' + i" class="th-valor text-center">
              {{ nombre }}
            </th>
            <th class="th-valor text-center">Var.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fila, idx) in filas" :key="fila.localidad_cod">
            <td class="td-pos">{{ idx + 1 }}</td>
            <td class="td-localidad">
              <span class="localidad-nombre">{{ fila.localidad }}</span>
            </td>
            <td
              v-for="(val, i) in fila.valores"
              :key="'v' + i"
              class="td-valor text-center"
              :class="i === fila.valores.length - 1 ? colorCelda(val) : ''"
            >
              {{ formatValor(val) }}
            </td>
            <td class="td-valor text-center">
              <span
                v-if="fila.valores.length >= 2"
                class="variacion-pill"
                :class="
                  fila.valores[fila.valores.length - 1] - fila.valores[fila.valores.length - 2] >= 0
                    ? 'up'
                    : 'down'
                "
              >
                {{
                  (
                    (fila.valores[fila.valores.length - 1] -
                      fila.valores[fila.valores.length - 2]) *
                    100
                  ).toFixed(1)
                }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Leyenda -->
    <div class="leyenda-colores mt-3">
      <span class="leyenda-item"><span class="dot alta"></span>≥ 60</span>
      <span class="leyenda-item"><span class="dot media"></span>45 – 59.9</span>
      <span class="leyenda-item"><span class="dot baja"></span>&lt; 45</span>
      <span class="leyenda-item text-muted ms-3 small"
        >Valores ×100; variación en puntos porcentuales</span
      >
    </div>
  </div>
</template>

<style scoped>
.indice-tabla {
  animation: fadeSlideIn 0.4s ease-out;
}

.tabla-titulo {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-primary);
}

.tabla-indice {
  font-size: 0.85rem;
  border-collapse: separate;
  border-spacing: 0;
}

.tabla-indice thead th {
  background: #f8f9fb;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-secondary);
  border-bottom: 2px solid #eef0f2;
  padding: 0.7rem 0.8rem;
  position: sticky;
  top: 0;
  z-index: 2;
}

.th-pos {
  width: 40px;
}
.th-localidad {
  min-width: 150px;
}
.th-valor {
  width: 80px;
}

.tabla-indice tbody tr {
  transition: background 0.15s ease;
}

.tabla-indice tbody tr:hover {
  background: var(--color-primary-light);
}

.td-pos {
  font-weight: 800;
  color: var(--color-muted);
  font-size: 0.75rem;
}

.td-localidad {
  font-weight: 600;
  color: var(--color-primary);
}

.td-valor {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 0.6rem 0.8rem;
}

.celda-alta {
  background: rgba(72, 187, 120, 0.1);
  color: #276749;
}

.celda-media {
  background: rgba(236, 201, 75, 0.1);
  color: #975a16;
}

.celda-baja {
  background: rgba(245, 101, 101, 0.1);
  color: #c53030;
}

.variacion-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.variacion-pill.up {
  background: rgba(72, 187, 120, 0.15);
  color: #276749;
}

.variacion-pill.down {
  background: rgba(245, 101, 101, 0.15);
  color: #c53030;
}

/* Leyenda */
.leyenda-colores {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-secondary);
  font-weight: 600;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.dot.alta {
  background: #48bb78;
}
.dot.media {
  background: #ecc94b;
}
.dot.baja {
  background: #f56565;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .tabla-indice {
    font-size: 0.78rem;
  }
}
</style>
