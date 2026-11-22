<script setup>
import { GRUPOS } from './configuracion.js'
const model = defineModel({ type: String, default: 'IDC' })
</script>

<template>
  <div class="grupo-selector">
    <h1 class="visually-hidden">{{ GRUPOS[model].nombre }}</h1>
    <nav class="grupo-menu" aria-label="Grupos del informe">
      <button
        v-for="opcion in GRUPOS"
        :key="opcion.codigo"
        type="button"
        class="grupo-opcion"
        :class="[opcion.codigo.toLowerCase(), { activo: model === opcion.codigo }]"
        :title="opcion.nombreCompleto"
        :aria-pressed="model === opcion.codigo"
        @click="model = opcion.codigo"
      >
        <span class="grupo-codigo">{{ opcion.codigo }}</span>
        <span class="grupo-titulo">{{ opcion.nombre }}</span>
        <i v-if="model === opcion.codigo" class="bi bi-check2 grupo-check" aria-hidden="true"></i>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.grupo-selector {
  min-width: 0;
}
.grupo-menu {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.grupo-opcion {
  --grupo-fondo: #f0f0f3;
  --grupo-activo: #eee5f7;
  --grupo-borde-activo: #dcd0e8;
  --grupo-borde: #c7afd9;
  --grupo-tinta: #63417e;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid transparent;
  border-radius: 9px;
  padding: 0.65rem 0.8rem;
  background: var(--grupo-fondo);
  color: var(--idc-muted);
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}
.grupo-opcion:hover {
  border-color: var(--grupo-borde);
}
.grupo-opcion.activo {
  background: var(--grupo-activo);
  color: var(--grupo-tinta);
  border-color: var(--grupo-borde-activo);
  box-shadow: 0 3px 12px #29253414;
}
.grupo-check {
  flex-shrink: 0;
  font-size: 0.75rem;
}
.grupo-codigo {
  font-size: 0.65rem;
  font-weight: 750;
  line-height: 1;
}
.grupo-titulo {
  font-size: 0.7rem;
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}
@media (max-width: 1050px) {
  .grupo-titulo {
    max-width: 19ch;
    font-size: 0.65rem;
  }
}
@media (max-width: 767px) {
  .grupo-selector {
    width: 100%;
    padding-left: 2.85rem;
  }
  .grupo-opcion {
    flex: 1;
    min-width: 0;
    gap: 0.35rem;
    padding: 0.5rem;
  }
  .grupo-titulo {
    font-size: 0.6rem;
    letter-spacing: 0;
  }
}
</style>
