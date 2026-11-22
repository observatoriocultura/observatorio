<script setup>
defineProps({ modelValue: { type: String, default: 'matriz' } })
const emit = defineEmits(['update:modelValue'])
const vistas = [
  { codigo: 'matriz', nombre: 'Matriz', icono: 'bi-grid-3x3' },
  { codigo: 'tabla', nombre: 'Tabla', icono: 'bi-table' },
  { codigo: 'mapa', nombre: 'Mapa', icono: 'bi-map' },
  { codigo: 'info', nombre: 'Acerca de', icono: 'bi-info-circle' },
]
</script>

<template>
  <nav aria-label="Visualización de resultados">
    <div class="menu-vistas">
      <button
        v-for="vista in vistas"
        :key="vista.codigo"
        type="button"
        :class="{ activa: modelValue === vista.codigo }"
        :aria-pressed="modelValue === vista.codigo"
        @click="emit('update:modelValue', vista.codigo)"
      >
        <i class="bi" :class="vista.icono" aria-hidden="true"></i>{{ vista.nombre }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.menu-vistas {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 4px;
  background: #efedf2;
  border: 1px solid #e8e5ed;
  border-radius: 12px;
}
.menu-vistas button {
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: transparent;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--idc-muted);
  font-weight: 500;
  transition:
    background 0.15s,
    color 0.15s;
  cursor: pointer;
}
.menu-vistas button:hover {
  color: var(--idc-ink);
}
.menu-vistas button.activa {
  background: #fff;
  color: var(--idc-accent);
  font-weight: 600;
  box-shadow: 0 1px 3px #2925340d;
}
@media (max-width: 600px) {
  .menu-vistas {
    flex-wrap: wrap;
  }
  .menu-vistas button {
    padding: 0.5rem 0.5rem;
    gap: 0.35rem;
  }
}
</style>
