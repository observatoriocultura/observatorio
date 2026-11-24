<script setup>
import NavTabs2 from '../../../../components/navigation/NavTabs2.vue'

defineProps({
  modelValue: { type: String, default: 'matriz' },
  ariaLabel: { type: String, default: 'Visualización de resultados' },
})
const emit = defineEmits(['update:modelValue'])
const vistas = [
  { value: 'matriz', label: 'Matriz', icon: 'bi-grid-3x3' },
  { value: 'mapa', label: 'Mapa', icon: 'bi-map' },
  { value: 'info', label: 'Acerca de', icon: 'bi-info-circle' },
]
</script>

<template>
  <NavTabs2
    :model-value="modelValue"
    :menu-items="vistas"
    :aria-label="ariaLabel"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
