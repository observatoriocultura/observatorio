<script setup>
import { CODIGO_BOGOTA, descripcionColorBogota } from './ranking.js'
defineProps({
  filas: { type: Array, required: true },
  indice: { type: Object, default: null },
  compacta: { type: Boolean, default: false },
})
const codigoBogota = CODIGO_BOGOTA
const formato = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const formatearValor = (valor) => (valor === null ? '—' : formato.format(valor))
</script>

<template>
  <div class="table-responsive" :class="{ compacta }">
    <table class="table table-hover tabla-indice align-middle">
      <colgroup>
        <col class="col-posicion" />
        <col />
        <col class="col-valor" />
      </colgroup>
      <caption class="visually-hidden">
        Resultados por localidad de
        {{
          indice?.nombre
        }}. Bogotá se mantiene como referencia en la primera fila; las localidades se ordenan por
        valor.
      </caption>
      <thead :class="{ 'visually-hidden': compacta }">
        <tr>
          <th scope="col" class="col-posicion text-center" title="Posición" aria-label="Posición">
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
</template>

<style scoped>
.table-responsive {
  overflow-y: hidden;
}
.tabla-indice {
  table-layout: fixed;
  font-size: 0.8rem;
  --bs-table-hover-bg: #faf9fc;
  --bs-table-border-color: #f0eef3;
  margin-bottom: 0;
}

.tabla-indice > :not(caption) > * > * {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  line-height: 1.45;
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
  overflow-wrap: anywhere;
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
  height: 1.4rem;
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
  font-size: 0.78rem;
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

.compacta .tabla-indice {
  font-size: 0.72rem;
}
.compacta .tabla-indice > :not(caption) > * > * {
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
  line-height: 1.4;
}
.compacta .col-posicion {
  width: 1.6rem;
}
.compacta .col-valor {
  width: 36%;
  min-width: 5.5rem;
}
.compacta .barra-valor {
  height: 1.15rem;
}
.compacta .barra-numero {
  font-size: 0.73rem;
}
.compacta .fila-bogota > * {
  padding-block: 0.45rem;
}
.fila-bogota .barra-numero {
  font-weight: 650;
}
@media (max-width: 600px) {
  .col-valor {
    width: 36%;
    min-width: 0;
  }
  .tabla-indice > :not(caption) > * > * {
    padding-inline: 0.35rem;
    font-size: 0.75rem;
  }
  .referencia {
    display: block;
    margin-left: 0;
    width: fit-content;
  }
}
.compacta .referencia {
  display: block;
  width: fit-content;
  margin: 0;
  padding: 0;
  background: transparent;
}
</style>
