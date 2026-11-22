<script setup>
import IndiceMatriz from '../compartidos/IndiceMatriz.vue'
import { GRUPOS } from '../configuracion.js'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IndiceMatriz v-bind="$attrs" :configuracion="GRUPOS.IDC" />
</template>
