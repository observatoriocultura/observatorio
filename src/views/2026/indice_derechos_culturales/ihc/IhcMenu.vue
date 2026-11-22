<script setup>
import IndiceMenu from '../compartidos/IndiceMenu.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IndiceMenu v-bind="$attrs" aria-label="Vistas de IHC" />
</template>
