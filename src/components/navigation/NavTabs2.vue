<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  // Cada opción: { value, label, icon?, title?, disabled? }.
  menuItems: {
    type: Array,
    required: true,
  },
  ariaLabel: {
    type: String,
    default: 'Navegación de vistas',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <nav class="nav-tabs2" :aria-label="ariaLabel">
    <div class="nav-tabs2-items">
      <button
        v-for="item in menuItems"
        :key="item.value"
        type="button"
        :class="{ active: modelValue === item.value }"
        :aria-pressed="modelValue === item.value"
        :disabled="item.disabled"
        :title="item.title"
        @click="emit('update:modelValue', item.value)"
      >
        <i v-if="item.icon" class="bi" :class="item.icon" aria-hidden="true"></i>
        {{ item.label }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.nav-tabs2 {
  min-width: 0;
}
.nav-tabs2-items {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px;
  background: var(--nav-tabs2-background, #efedf2);
  border: 1px solid var(--nav-tabs2-border, #e8e5ed);
  border-radius: 12px;
}
.nav-tabs2-items button {
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: transparent;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-family: inherit;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: nowrap;
  color: var(--nav-tabs2-muted, #6a6875);
  font-weight: 500;
  transition:
    background 0.15s,
    color 0.15s;
  cursor: pointer;
}
.nav-tabs2-items button:hover:not(:disabled) {
  color: var(--nav-tabs2-ink, #292534);
}
.nav-tabs2-items button.active {
  background: var(--nav-tabs2-active-background, #fff);
  color: var(--nav-tabs2-accent, #483357);
  font-weight: 600;
  box-shadow: 0 1px 3px #2925340d;
}
.nav-tabs2-items button:focus-visible {
  outline: 2px solid var(--nav-tabs2-accent, #483357);
  outline-offset: 2px;
}
.nav-tabs2-items button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .nav-tabs2-items button {
    padding: 0.5rem;
    gap: 0.35rem;
  }
}
</style>
