<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  datosPorLocalidad: { type: Array, required: true },
  indices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  numPeriodos: { type: Number, required: true },
  iccData: { type: Array, default: () => [] },
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

/** Años de referencia */
const añosReferencia = [2021, 2023, 2025]

/** Nombres de los periodos a mostrar */
const nombresPeriodos = computed(() => {
  return añosReferencia.slice(añosReferencia.length - props.numPeriodos)
})

/** Nombre del índice seleccionado */
const nombreIndice = computed(() => {
  const idx = props.indices.find((i) => i.cod === indiceSeleccionado.value)
  return idx ? idx.nombre : ''
})

/** Datos de tabla: localidad + valores alineados por año */
const filas = computed(() => {
  const añosAMostrar = nombresPeriodos.value

  const todasLasFilas = props.localidades.map((loc) => {
    // Buscamos los valores para cada año específico
    const valoresAlineados = añosAMostrar.map((año) => {
      const registro = props.iccData.find(
        (d) =>
          Number(d.localidad_cod) === Number(loc.cod) &&
          d.indice_cod === indiceSeleccionado.value &&
          Number(d.año) === Number(año),
      )
      const valor = registro ? registro.valor : null

      // Tendencia respecto al periodo anterior (aunque el anterior no se muestre)
      let tendencia = null
      if (valor !== null) {
        const añoAnterior = año === 2025 ? 2023 : año === 2023 ? 2021 : null
        if (añoAnterior) {
          const registroAnt = props.iccData.find(
            (d) =>
              Number(d.localidad_cod) === Number(loc.cod) &&
              d.indice_cod === indiceSeleccionado.value &&
              Number(d.año) === Number(añoAnterior),
          )
          if (registroAnt) {
            if (valor > registroAnt.valor) tendencia = 'up'
            else if (valor < registroAnt.valor) tendencia = 'down'
          }
        }
      }

      return { valor, tendencia }
    })

    const ultimo =
      valoresAlineados.length > 0 ? valoresAlineados[valoresAlineados.length - 1].valor : null

    return {
      localidad_cod: loc.cod,
      localidad: loc.nombre,
      valores: valoresAlineados,
      ultimo: ultimo,
    }
  })

  // Separamos Bogotá (Total) para que sea siempre la primera fila
  const filaBogota = todasLasFilas.find((f) => Number(f.localidad_cod) === 22)
  const restoFilas = todasLasFilas.filter((f) => Number(f.localidad_cod) !== 22)

  // Ordenamos el resto de las localidades según el criterio seleccionado
  restoFilas.sort((a, b) => {
    const va = a.ultimo ?? -1
    const vb = b.ultimo ?? -1
    return ordenAsc.value ? va - vb : vb - va
  })

  // Retornamos la combinación (Bogotá primero)
  return filaBogota ? [filaBogota, ...restoFilas] : restoFilas
})

const formatValor = (v) => {
  if (v === null || v === undefined) return '—'
  return v.toFixed(3)
}

const colorCelda = (valor) => {
  if (valor === null || valor === undefined) return ''
  if (valor >= 0.6) return 'celda-alta'
  if (valor >= 0.45) return 'celda-media'
  return 'celda-baja'
}
</script>

<template>
  <div class="indice-tabla">
    <div class="row g-4">
      <!-- Sidebar de Índices (Izquierda) -->
      <div class="col-md-3">
        <div class="indices-sidebar shadow-sm rounded bg-white p-2">
          <label class="sidebar-label mb-2 px-2">Índice y subíndices</label>
          <div class="list-group list-group-flush">
            <button
              v-for="idx in indices"
              :key="idx.cod"
              type="button"
              class="list-group-item list-group-item-action sidebar-item"
              :class="{ active: indiceSeleccionado === idx.cod }"
              @click="indiceSeleccionado = idx.cod"
            >
              <div class="d-flex w-100 justify-content-between align-items-center">
                <span class="indice-nombre">{{ idx.nombre }}</span>
                <i v-if="indiceSeleccionado === idx.cod" class="bi bi-chevron-right small"></i>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido de la Tabla (Derecha) -->
      <div class="col-md-9">
        <div class="tabla-container shadow-sm rounded bg-white p-3">
          <!-- Controles superiores -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="tabla-titulo m-0 text-uppercase small ls-wide">{{ nombreIndice }}</h5>
            <button class="btn btn-sm btn-outline-secondary" @click="ordenAsc = !ordenAsc">
              <i :class="ordenAsc ? 'bi bi-sort-numeric-up' : 'bi bi-sort-numeric-down-alt'"></i>
              {{ ordenAsc ? 'Menor a mayor' : 'Mayor a menor' }}
            </button>
          </div>

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
                <tr
                  v-for="(fila, idx) in filas"
                  :key="fila.localidad_cod"
                  :class="{ 'fila-total': Number(fila.localidad_cod) === 22 }"
                >
                  <td class="td-pos">
                    {{ Number(fila.localidad_cod) === 22 ? '' : idx }}
                  </td>
                  <td class="td-localidad">
                    <span class="localidad-nombre">{{ fila.localidad }}</span>
                  </td>
                  <td
                    v-for="(obj, i) in fila.valores"
                    :key="'v' + i"
                    class="td-valor text-center"
                    :class="i === fila.valores.length - 1 ? colorCelda(obj.valor) : ''"
                  >
                    <div class="d-flex align-items-center justify-content-center">
                      {{ formatValor(obj.valor) }}
                      <i
                        v-if="obj.tendencia === 'up'"
                        class="bi bi-arrow-up-short text-success fs-5"
                        title="Aumentó"
                      ></i>
                      <i
                        v-if="obj.tendencia === 'down'"
                        class="bi bi-arrow-down-short text-danger fs-5"
                        title="Disminuyó"
                      ></i>
                    </div>
                  </td>
                  <td class="td-valor text-center">
                    <span
                      v-if="
                        fila.valores.length >= 2 &&
                        fila.valores[fila.valores.length - 1].valor !== null &&
                        fila.valores[fila.valores.length - 2].valor !== null
                      "
                      class="variacion-pill"
                      :class="
                        fila.valores[fila.valores.length - 1].valor -
                          fila.valores[fila.valores.length - 2].valor >=
                        0
                          ? 'up'
                          : 'down'
                      "
                    >
                      {{
                        (
                          fila.valores[fila.valores.length - 1].valor -
                          fila.valores[fila.valores.length - 2].valor
                        ).toFixed(3)
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
            <span class="leyenda-item"><span class="dot alta"></span>≥ 0.600</span>
            <span class="leyenda-item"><span class="dot media"></span>0.450 – 0.599</span>
            <span class="leyenda-item"><span class="dot baja"></span>&lt; 0.450</span>
            <span class="leyenda-item text-muted ms-3 small"
              >Valores en escala 0-1; variación en puntos absolutos</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.indice-tabla {
  animation: fadeSlideIn 0.4s ease-out;
  padding: 1rem 0;
}

.indices-sidebar {
  position: sticky;
  top: 1rem;
}

.sidebar-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #adb5bd;
  letter-spacing: 0.1em;
}

.sidebar-item {
  border: none !important;
  border-radius: 8px !important;
  margin-bottom: 2px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: #f8f9fa;
  color: var(--color-primary);
}

.sidebar-item.active {
  background-color: var(--color-primary-light) !important;
  color: var(--color-primary) !important;
  font-weight: 800;
}

.ls-wide {
  letter-spacing: 0.05em;
}

.tabla-container {
  max-width: 800px;
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
  padding: 0.4rem 0.8rem;
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
  padding: 0.3rem 0.8rem;
}

.fila-total {
    font-size: 0.95rem;
    background-color: #f8f9fa;
}

.fila-total td, .fila-total th {
    border-top: 2px solid #6c757d !important;
    border-bottom: 2px solid #6c757d !important;
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
