<script setup>
import { computed, ref } from 'vue'
import IndiceSelector from './IndiceSelector.vue'
import IndiceLeyenda from './IndiceLeyenda.vue'
import { CODIGO_BOGOTA, crearRanking, descripcionColorBogota } from './ranking.js'

const props = defineProps({
  subindices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  valores: { type: Array, required: true },
  modelValue: { type: String, default: 'IDC' },
})
const emit = defineEmits(['update:modelValue'])
const ordenAsc = ref(false)
const codigoBogota = CODIGO_BOGOTA

const indice = computed(() => props.subindices.find((item) => item.codigo === props.modelValue))

const ranking = computed(() => crearRanking(props.localidades, props.valores, props.modelValue))
const filas = computed(() => {
  const { bogota } = ranking.value
  const localidades = [...ranking.value.localidades]
  localidades.sort((a, b) => {
    if (a.valor === null && b.valor === null) return a.codigo - b.codigo
    if (a.valor === null) return 1
    if (b.valor === null) return -1
    const diferencia = ordenAsc.value ? a.valor - b.valor : b.valor - a.valor
    return diferencia || a.codigo - b.codigo
  })
  return bogota ? [bogota, ...localidades] : localidades
})

const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const formatearValor = (valor) => (valor === null ? '—' : formato.format(valor))
</script>

<template>
  <div class="idc-layout">
    <div class="idc-sidebar">
      <IndiceSelector
        :model-value="modelValue"
        :subindices="subindices"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <IndiceLeyenda />
    </div>

    <div class="tabla-panel idc-panel">
      <div class="tabla-cabecera">
        <div>
          <span class="idc-eyebrow">{{ modelValue }} · Resultados por localidad</span>
          <h2 class="tabla-titulo">{{ indice?.nombre }}</h2>
        </div>
        <button
          type="button"
          class="orden-btn"
          :aria-label="
            ordenAsc ? 'Ordenar de mayor a menor valor' : 'Ordenar de menor a mayor valor'
          "
          @click="ordenAsc = !ordenAsc"
        >
          <i
            class="bi me-1"
            :class="ordenAsc ? 'bi-sort-numeric-up' : 'bi-sort-numeric-down-alt'"
            aria-hidden="true"
          ></i>
          {{ ordenAsc ? 'Menor a mayor' : 'Mayor a menor' }}
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover tabla-indice align-middle">
          <caption class="visually-hidden">
            Resultados por localidad de
            {{
              indice?.nombre
            }}. Bogotá se mantiene como referencia en la primera fila; las localidades se ordenan
            por valor.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                class="col-posicion text-center"
                title="Posición"
                aria-label="Posición"
              >
                #
              </th>
              <th scope="col">Localidad</th>
              <th scope="col" class="col-valor text-end">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="fila in filas"
              :key="fila.codigo"
              :class="{ 'fila-bogota': fila.codigo === codigoBogota }"
            >
              <td class="col-posicion text-center text-secondary">
                {{ fila.posicion ?? '—' }}
              </td>
              <th scope="row">
                {{ fila.nombre }}
                <span v-if="fila.codigo === codigoBogota" class="referencia">Total ciudad</span>
              </th>
              <td class="col-valor valor">
                <div
                  v-if="fila.valor !== null"
                  class="barra-valor"
                  role="progressbar"
                  :aria-label="`${fila.nombre}: ${indice?.nombre}`"
                  :aria-valuenow="fila.valor"
                  :aria-valuemin="0"
                  :aria-valuemax="1"
                  :aria-valuetext="`${formatearValor(fila.valor)} en una escala de 0 a 1`"
                  :title="
                    fila.codigo === codigoBogota
                      ? descripcionColorBogota(fila)
                      : `Puesto ${fila.posicion} de mayor a menor valor`
                  "
                >
                  <div
                    class="barra-relleno"
                    :style="{
                      width: `${Math.max(0, Math.min(1, fila.valor)) * 100}%`,
                      backgroundColor: fila.color,
                    }"
                  ></div>
                  <span class="barra-numero">{{ formatearValor(fila.valor) }}</span>
                </div>
                <span v-else class="d-block text-end">—</span>
              </td>
            </tr>
            <tr v-if="!filas.length">
              <td colspan="3">No hay resultados disponibles.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tabla-notas idc-note">
        <p>
          Escala de 0 a 1. El ancho representa el valor; el color representa el puesto. — Sin datos.
        </p>
        <p>
          Bogotá toma el color del puesto que ocuparía frente a las localidades, sin formar parte
          del ranking.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabla-panel {
  min-width: 0;
  padding: 1.5rem;
}
.tabla-panel .table-responsive {
  overflow-y: hidden;
}
.tabla-cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.tabla-cabecera > div {
  flex: 1 1 16rem;
}
.tabla-titulo {
  color: var(--idc-ink);
  font-size: 1.1rem;
  font-weight: 550;
  letter-spacing: -0.025em;
  line-height: 1.5;
  margin: 0.4rem 0 0;
}
.orden-btn {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--idc-line);
  border-radius: 7px;
  background: #fff;
  color: var(--idc-muted);
  font-size: 0.7rem;
  white-space: nowrap;
  cursor: pointer;
}
.orden-btn:hover {
  background: var(--idc-soft);
  color: var(--idc-accent);
}

.tabla-indice {
  font-size: 0.8rem;
  --bs-table-hover-bg: #faf9fc;
  --bs-table-border-color: #f0eef3;
  margin-bottom: 0;
}

.tabla-indice > :not(caption) > * > * {
  padding: 0.3rem 0.5rem;
  line-height: 1.5;
}

.col-posicion {
  width: 2.25rem;
  white-space: nowrap;
}

.col-valor {
  width: 42%;
  min-width: 9rem;
}

.tabla-indice thead th {
  background: #faf9fb;
  color: var(--idc-muted);
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-block: 0.55rem;
}
.tabla-indice tbody th {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  color: var(--idc-ink);
}

.valor {
  font-variant-numeric: tabular-nums;
  font-weight: 550;
}

.barra-valor {
  position: relative;
  height: 1.3rem;
  overflow: hidden;
  border-radius: 4px;
  background: #f7f7f9;
}

.barra-relleno {
  height: 100%;
}

.barra-numero {
  position: absolute;
  inset: 0 0.4rem 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--idc-ink);
  font-size: 0.75rem;
}

.fila-bogota > * {
  background: #f8f7fa;
  border-bottom: 1px solid #ded9e6;
  padding-block: 0.6rem;
}

.referencia {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  background: #efedf3;
  font-size: 0.6rem;
  font-weight: 400;
  color: var(--idc-muted);
}
.tabla-notas {
  padding-top: 1rem;
  border-top: 1px solid var(--idc-line);
  margin-top: 1rem;
}
.tabla-notas p {
  margin: 0;
}
.tabla-notas p + p {
  margin-top: 0.35rem;
}
@media (max-width: 800px) {
  .tabla-panel {
    padding: 1rem;
  }
}
</style>
