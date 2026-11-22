<script setup>
import { computed } from 'vue'
import { ordenarSubindices } from '../configuracion.js'

const props = defineProps({
  subindices: { type: Array, required: true },
  configuracion: { type: Object, required: true },
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const opciones = computed(() =>
  ordenarSubindices(props.subindices, props.configuracion.codigoTotal),
)
</script>

<template>
  <nav class="indices-sidebar idc-panel" aria-label="Índice y subíndices">
    <span class="selector-titulo idc-eyebrow">Índice y {{ configuracion.plural }}</span>
    <select
      class="selector-mobile"
      :aria-label="`Seleccionar índice o ${configuracion.singular}`"
      :value="modelValue"
      :title="opciones.find((opcion) => opcion.codigo === modelValue)?.nombre"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="opcion in opciones"
        :key="opcion.codigo"
        :value="opcion.codigo"
        :title="opcion.nombre"
      >
        {{ opcion.codigo }} · {{ opcion.nombre_corto || opcion.nombre }}
      </option>
    </select>
    <div class="selector-opciones">
      <button
        v-for="opcion in opciones"
        :key="opcion.codigo"
        type="button"
        class="indice-opcion"
        :class="{ activa: modelValue === opcion.codigo }"
        :aria-pressed="modelValue === opcion.codigo"
        :title="opcion.nombre"
        :aria-label="`${opcion.codigo} · ${opcion.nombre}`"
        @click="emit('update:modelValue', opcion.codigo)"
      >
        <span class="indice-codigo">{{ opcion.codigo }}</span>
        <span>{{ opcion.nombre_corto || opcion.nombre }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.indices-sidebar {
  padding: 0.65rem;
}
.selector-titulo {
  padding: 0.45rem 0.55rem 0.8rem;
}
.selector-mobile {
  display: none;
}
.selector-opciones {
  display: grid;
  gap: 3px;
}
.indice-opcion {
  display: flex;
  align-items: start;
  gap: 0.65rem;
  width: 100%;
  padding: 0.7rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--idc-muted);
  text-align: left;
  font-size: 0.75rem;
  line-height: 1.6;
  cursor: pointer;
  transition: background 0.15s;
}
.indice-opcion:hover {
  background: #f8f7fa;
}
.indice-opcion.activa {
  background: var(--idc-soft);
  color: var(--idc-ink);
  font-weight: 550;
}
.indice-codigo {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  width: 30px;
  height: 26px;
  background: #f2f1f5;
  border: 1px solid var(--idc-line);
  border-radius: 6px;
  color: var(--idc-muted);
  font-size: 0.65rem;
  font-weight: 600;
}
.activa .indice-codigo {
  background: var(--idc-accent);
  border-color: var(--idc-accent);
  color: #fff;
}
@media (max-width: 800px) {
  .selector-opciones {
    display: none;
  }
  .selector-mobile {
    display: block;
    width: 100%;
    min-width: 0;
    padding: 0.65rem;
    font-size: 0.8rem;
    color: var(--idc-ink);
    background: #fff;
    border: 1px solid var(--idc-line);
    border-radius: 8px;
  }
  .selector-titulo {
    padding-bottom: 0.55rem;
  }
}
</style>
