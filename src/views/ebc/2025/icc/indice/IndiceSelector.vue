<script setup>
defineProps({
  indices: { type: Array, required: true },
  modelValue: { type: [Number, String], default: null },
  label: { type: String, default: 'Índice y subíndices' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="indice-selector d-flex flex-column h-100">
    <label v-if="label" class="sidebar-label mb-2 px-2">{{ label }}</label>
    <div class="list-group list-group-flush overflow-y-auto flex-grow-1 custom-scrollbar pe-1">
      <button
        v-for="idx in indices"
        :key="idx.cod"
        type="button"
        class="list-group-item list-group-item-action sidebar-item"
        :class="{ active: modelValue === idx.cod }"
        @click="$emit('update:modelValue', idx.cod)"
      >
        <div class="d-flex w-100 justify-content-between align-items-center text-start">
          <span class="indice-nombre">{{ idx.nombre }}</span>
          <i v-if="modelValue === idx.cod" class="bi bi-chevron-right small"></i>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 0.5rem 0.75rem;
}

.sidebar-item:hover {
  background-color: #f8f9fa;
  color: var(--color-primary, #654096);
}

.sidebar-item.active {
  background-color: var(--color-primary-light, rgba(101, 64, 150, 0.1)) !important;
  color: var(--color-primary, #654096) !important;
  font-weight: 800;
}

.indice-nombre {
  display: inline-block;
  padding-right: 0.5rem;
  line-height: 1.25;
}

/* Opcional: estilizar la barra de desplazamiento */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #dee2e6;
  border-radius: 4px;
}
</style>
