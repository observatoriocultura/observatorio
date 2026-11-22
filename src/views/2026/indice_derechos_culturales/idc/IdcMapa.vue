<script setup>
import IndiceMapa from '../compartidos/IndiceMapa.vue'
import { GRUPOS } from '../configuracion.js'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IndiceMapa v-bind="$attrs" :configuracion="GRUPOS.IDC" />
</template>
