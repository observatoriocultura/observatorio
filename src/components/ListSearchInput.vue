<template>
  <div class="list-search-input">
    <label v-if="label" class="list-search-label" :for="inputId">
      {{ label }}
    </label>

    <div class="list-search-control">
      <i class="bi bi-search list-search-icon" aria-hidden="true"></i>
      <input
        :id="inputId"
        :value="modelValue"
        type="search"
        class="list-search-field"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        autocomplete="off"
        @input="emit('update:modelValue', $event.target.value)"
        @keydown.esc="clearSearch"
      />
      <button
        v-if="modelValue"
        type="button"
        class="list-search-clear"
        :aria-label="clearLabel"
        @click="clearSearch"
      >
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Buscar...',
  },
  ariaLabel: {
    type: String,
    default: 'Buscar en el listado',
  },
  clearLabel: {
    type: String,
    default: 'Limpiar busqueda',
  },
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'clear'])

const inputId = props.id || `list-search-${Math.random().toString(36).slice(2, 9)}`

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.list-search-input {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.35rem;
}

.list-search-label {
  color: #495057;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.list-search-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 0.5rem 0.65rem;
}

.list-search-control:focus-within {
  border-color: #654096;
  box-shadow: 0 0 0 0.2rem rgba(101, 64, 150, 0.14);
}

.list-search-icon {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1;
}

.list-search-field {
  min-width: 0;
  border: 0;
  background: transparent;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.4;
  outline: 0;
}

.list-search-field::placeholder {
  color: #8a9198;
}

.list-search-clear {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background-color: transparent;
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1;
}

.list-search-clear:hover,
.list-search-clear:focus {
  background-color: #f1eef6;
  color: #654096;
}

.list-search-clear:focus {
  outline: 2px solid rgba(101, 64, 150, 0.24);
  outline-offset: 1px;
}
</style>
