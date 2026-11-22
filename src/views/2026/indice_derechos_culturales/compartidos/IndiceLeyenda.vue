<script setup>
import { COLORES_POR_PUESTO } from './ranking.js'
</script>

<template>
  <section class="leyenda-posiciones idc-panel" aria-label="Leyenda de posiciones">
    <h3>Color según posición</h3>
    <div class="escala-posiciones" aria-hidden="true">
      <span
        v-for="(color, index) in COLORES_POR_PUESTO"
        :key="index"
        :style="{ background: color }"
        :title="`Puesto ${index + 1}`"
      ></span>
    </div>
    <div class="etiquetas-escala">
      <span>1 · Mayor</span><span>10–11</span><span>20 · Menor</span>
    </div>
    <p>
      Verde en los primeros puestos, amarillo en los intermedios y rojo en los últimos. Son
      posiciones relativas, no niveles de cumplimiento.
    </p>
  </section>
</template>

<style scoped>
.leyenda-posiciones {
  padding: 1.1rem;
  font-size: 0.7rem;
  color: var(--idc-muted);
}
h3 {
  color: var(--idc-ink);
  font-size: 0.75rem;
  font-weight: 550;
  margin-bottom: 0.85rem;
}
.escala-posiciones {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  height: 12px;
  border-radius: 4px;
  overflow: hidden;
}
.etiquetas-escala {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-block: 0.4rem 0.8rem;
  font-variant-numeric: tabular-nums;
  font-size: 0.65rem;
}
p {
  margin-bottom: 0.6rem;
  line-height: 1.6;
}
</style>
