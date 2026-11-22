<script setup>
import { computed } from 'vue'
import IndiceLeyenda from './IndiceLeyenda.vue'
import { ordenarSubindices } from '../configuracion.js'
import { CODIGO_BOGOTA, crearRanking, descripcionColorBogota } from './ranking.js'

const props = defineProps({
  subindices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  valores: { type: Array, required: true },
  configuracion: { type: Object, required: true },
})

const ordenarPor = defineModel('ordenarPor', { type: String, required: true })
const ordenAsc = defineModel('ordenAsc', { type: Boolean, default: false })
const columnas = computed(() =>
  ordenarSubindices(props.subindices, props.configuracion.codigoTotal),
)
const anchoMinimo = computed(() => `${Math.max(740, 210 + columnas.value.length * 100)}px`)

// Cada columna conserva su ranking propio, independiente del orden visible de las filas.
const rankings = computed(
  () =>
    new Map(
      columnas.value.map((columna) => {
        const ranking = crearRanking(props.localidades, props.valores, columna.codigo)
        return [
          columna.codigo,
          new Map([
            ...ranking.localidades.map((localidad) => [localidad.codigo, localidad]),
            ...(ranking.bogota ? [[CODIGO_BOGOTA, ranking.bogota]] : []),
          ]),
        ]
      }),
    ),
)

const filas = computed(() => {
  const registros = props.localidades
    .filter(
      (localidad) =>
        Number(localidad.es_localidad) === 1 || Number(localidad.cod_localidad) === CODIGO_BOGOTA,
    )
    .map((localidad) => ({
      codigo: Number(localidad.cod_localidad),
      nombre: localidad.nombre,
      celdas: columnas.value.map((columna) =>
        rankings.value.get(columna.codigo).get(Number(localidad.cod_localidad)),
      ),
    }))
  const bogota = registros.find((fila) => fila.codigo === CODIGO_BOGOTA)
  const localidades = registros.filter((fila) => fila.codigo !== CODIGO_BOGOTA)
  const rankingOrden = rankings.value.get(ordenarPor.value)
  localidades.sort((a, b) => {
    const valorA = rankingOrden?.get(a.codigo)?.valor ?? null
    const valorB = rankingOrden?.get(b.codigo)?.valor ?? null
    if (valorA === null && valorB === null) return a.codigo - b.codigo
    if (valorA === null) return 1
    if (valorB === null) return -1
    return (ordenAsc.value ? valorA - valorB : valorB - valorA) || a.codigo - b.codigo
  })
  return bogota ? [bogota, ...localidades] : localidades
})

function ordenar(codigo) {
  if (ordenarPor.value === codigo) ordenAsc.value = !ordenAsc.value
  else {
    ordenarPor.value = codigo
    ordenAsc.value = false
  }
}

const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const formatear = (valor) => (valor === null ? '—' : formato.format(valor))
function describirCelda(celda, columna) {
  const valor = `${celda.nombre} · ${columna.nombre}: ${formatear(celda.valor)}.`
  if (celda.valor === null) return `${valor} Sin datos.`
  return `${valor} ${celda.codigo === CODIGO_BOGOTA ? descripcionColorBogota(celda) : `Puesto ${celda.posicion} de mayor a menor valor.`}`
}
</script>

<template>
  <div class="indice-matriz">
    <section class="matriz-panel idc-panel" aria-label="Matriz de índices por localidad">
      <header class="matriz-cabecera">
        <div>
          <h2>Índice y {{ configuracion.plural }} por localidad</h2>
        </div>
        <span class="matriz-orden"
          >Orden: <strong>{{ ordenarPor }}</strong> ·
          {{ ordenAsc ? 'Menor a mayor' : 'Mayor a menor' }}</span
        >
      </header>
      <p
        class="matriz-ayuda-movil idc-note"
        :class="{ 'matriz-ayuda-amplia': columnas.length > 7 }"
      >
        <i class="bi bi-arrow-left-right" aria-hidden="true"></i>Desplázate horizontalmente para ver
        todas las columnas.
      </p>

      <div
        class="matriz-scroll"
        tabindex="0"
        role="region"
        aria-label="Tabla de valores. Puedes desplazarte horizontalmente para ver todas las columnas."
      >
        <table class="matriz-tabla" :style="{ minWidth: anchoMinimo }">
          <caption class="visually-hidden">
            Valores en escala de 0 a 1 para
            {{
              configuracion.codigo
            }}
            y sus
            {{
              columnas.length - 1
            }}
            subíndices. Bogotá se mantiene en la primera fila. Las localidades están ordenadas por
            {{
              ordenarPor
            }}, de
            {{
              ordenAsc ? 'menor a mayor' : 'mayor a menor'
            }}
            valor.
          </caption>
          <thead>
            <tr>
              <th scope="col" class="col-localidad">Localidad</th>
              <th
                v-for="columna in columnas"
                :key="columna.codigo"
                scope="col"
                :aria-sort="
                  ordenarPor === columna.codigo ? (ordenAsc ? 'ascending' : 'descending') : 'none'
                "
              >
                <button
                  type="button"
                  :title="columna.nombre"
                  :aria-label="`${columna.nombre}. Ordenar de ${ordenarPor === columna.codigo && !ordenAsc ? 'menor a mayor' : 'mayor a menor'} valor`"
                  :class="{ activa: ordenarPor === columna.codigo }"
                  @click="ordenar(columna.codigo)"
                >
                  {{ columna.codigo
                  }}<i
                    v-if="ordenarPor === columna.codigo"
                    class="bi"
                    :class="ordenAsc ? 'bi-arrow-up-short' : 'bi-arrow-down-short'"
                    aria-hidden="true"
                  ></i>
                </button>
              </th>
            </tr>
            <tr class="fila-nombres-cortos">
              <th class="col-localidad" aria-hidden="true"></th>
              <th v-for="columna in columnas" :key="columna.codigo" scope="col">
                {{ columna.nombre_corto || columna.codigo }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="fila in filas"
              :key="fila.codigo"
              :class="{ 'fila-bogota': fila.codigo === CODIGO_BOGOTA }"
            >
              <th scope="row" class="col-localidad">
                {{ fila.nombre
                }}<span v-if="fila.codigo === CODIGO_BOGOTA" class="matriz-referencia"
                  >Total ciudad</span
                >
              </th>
              <td
                v-for="(celda, index) in fila.celdas"
                :key="columnas[index].codigo"
                :style="{ backgroundColor: celda.color }"
                :title="describirCelda(celda, columnas[index])"
                :aria-label="describirCelda(celda, columnas[index])"
              >
                {{ formatear(celda.valor) }}
              </td>
            </tr>
            <tr v-if="!filas.length">
              <td :colspan="columnas.length + 1">No hay resultados disponibles.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <div class="matriz-pie">
      <IndiceLeyenda />
      <div class="idc-note matriz-notas">
        <p>
          Los colores se calculan por separado para cada índice y se conservan al reordenar las
          filas. La posición de una fila en la matriz no indica su puesto en todos los subíndices.
        </p>
        <p>
          Bogotá usa el color de su puesto equivalente en cada columna y permanece fuera del ranking
          de localidades. Los valores se muestran con tres decimales; — indica ausencia de datos.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matriz-tabla thead .fila-nombres-cortos th {
  padding: 0.25rem 0.5rem 0.55rem;
  font-size: 0.65rem;
  font-weight: 400;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  color: var(--idc-muted);
}
.matriz-panel {
  padding: 1.5rem;
  min-width: 0;
}
.matriz-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-wrap: wrap;
  gap: 1rem;
}
.matriz-cabecera h2 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  font-weight: 550;
  letter-spacing: -0.025em;
}
.matriz-orden {
  font-size: 0.7rem;
  color: var(--idc-muted);
  padding-top: 0.2rem;
}
.matriz-orden strong {
  font-weight: 600;
  color: var(--idc-accent);
}
.matriz-ayuda-movil {
  display: none;
}
.matriz-ayuda-amplia {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.matriz-scroll {
  margin-top: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}
.matriz-scroll:focus-visible {
  outline: 2px solid var(--idc-accent);
  outline-offset: 3px;
}
.matriz-tabla {
  table-layout: fixed;
  width: 100%;
  border-collapse: separate;
  border-spacing: 3px;
  font-size: 0.8rem;
}
.matriz-tabla th,
.matriz-tabla td {
  padding: 0.4rem 0.7rem;
  line-height: 1.5;
  border: 0;
}
.matriz-tabla thead th {
  text-align: center;
  background: #faf9fb;
  font-size: 0.7rem;
  font-weight: 550;
  letter-spacing: 0;
  text-transform: none;
}
.matriz-tabla thead th:first-child {
  text-align: right;
}
.matriz-tabla thead tr:first-child th {
  font-size: 0.78rem;
}
.matriz-tabla thead button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-height: 30px;
  border: 0;
  border-radius: 5px;
  padding: 0.2rem 0.4rem;
  color: var(--idc-muted);
  font-size: inherit;
  font-weight: inherit;
  background: transparent;
  cursor: pointer;
}
.matriz-tabla thead button:hover,
.matriz-tabla thead button.activa {
  color: var(--idc-accent);
  background: #efebf3;
}
.matriz-tabla tbody th {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  color: var(--idc-ink);
}
.matriz-tabla td {
  text-align: center;
  border-radius: 4px;
  color: var(--idc-ink);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
.matriz-tabla .col-localidad {
  text-align: right;
  position: sticky;
  left: 0;
  z-index: 1;
  width: 210px;
  min-width: 190px;
  background: #fff;
}
.matriz-tabla thead .col-localidad {
  background: #faf9fb;
}
.matriz-tabla .fila-bogota th {
  background: var(--idc-soft);
}
.fila-bogota td {
  font-size: 0.875rem;
  font-weight: 650;
}
.matriz-referencia {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  background: #efedf3;
  color: var(--idc-muted);
  font-size: 0.6rem;
  font-weight: 400;
}
.matriz-pie {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}
.matriz-notas {
  align-self: center;
  max-width: 80ch;
}
.matriz-notas p {
  margin: 0;
}
.matriz-notas p + p {
  margin-top: 0.65rem;
}
@media (max-width: 800px) {
  .matriz-panel {
    padding: 1rem;
  }
  .matriz-pie {
    grid-template-columns: minmax(0, 1fr);
  }
  .matriz-ayuda-movil {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .matriz-tabla .col-localidad {
    width: 170px;
    min-width: 150px;
  }
}
</style>
