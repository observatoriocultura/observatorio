<script setup>
defineProps({
  modelValue: { type: String, required: true },
  opciones: { type: Array, required: true },
  etiqueta: { type: String, required: true },
  nombre: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset class="control-segmentado" :title="etiqueta">
    <legend class="visually-hidden">{{ etiqueta }}</legend>
    <div class="segmentos" :style="{ '--opciones': opciones.length }">
      <label v-for="opcion in opciones" :key="opcion.id" class="segmento" :title="etiqueta">
        <input
          type="radio"
          :name="nombre"
          :value="opcion.id"
          :checked="modelValue === opcion.id"
          @change="emit('update:modelValue', opcion.id)"
        />
        <span>{{ opcion.nombre }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.control-segmentado {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.segmentos {
  display: grid;
  grid-template-columns: repeat(var(--opciones), minmax(0, 1fr));
  gap: 3px;
  padding: 3px;
  border: 1px solid #dedede;
  border-radius: 10px;
  background: #f4f4f4;
}
.segmento {
  position: relative;
  min-width: 0;
  margin: 0;
  cursor: pointer;
}
.segmento input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.segmento span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 32px;
  padding: 5px 8px;
  border-radius: 7px;
  color: #41464d;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
}
.segmento:hover span {
  background: #e8eef7;
}
.segmento input:checked + span {
  background: #155fc3;
  color: #fff;
  box-shadow: 0 1px 3px #155fc330;
}
.segmento input:focus-visible + span {
  outline: 2px solid #155fc3;
  outline-offset: 2px;
}
@media (max-width: 575px) {
  .segmento span {
    min-height: 40px;
    padding: 6px 4px;
    font-size: 0.76rem;
  }
}
</style>
