<template>
  <ul class="nav nav-pills mb-4">
    <li v-for="section in sections" :key="section" class="nav-item">
      <button
        class="nav-link"
        v-bind:class="{ active: currentSection === section.name }"
        @click="currentSection = section.name"
      >
        {{ section.title }}
      </button>
    </li>
  </ul>
  <GlosarioComponent v-if="currentSection === 'glosario'" />
  <InicioComponent v-else-if="currentSection === 'inicio'" />
  <ResultadosF2M1 v-else-if="currentSection === 'resultadosF2M1'" />
</template>

<script setup>
import { ref } from 'vue'
import InicioComponent from '../../components/i100_plan_cultura/InicioComponent.vue'
import GlosarioComponent from '../../components/i100_plan_cultura/GlosarioComponent.vue'
import ResultadosF2M1 from '../../components/i100_plan_cultura/ResultadosF2M1.vue'

// Variables
//-----------------------------------------------------------------------------
const currentSection = ref('inicio')
const sections = ref([
  { name: 'inicio', title: 'Inicio', component: InicioComponent },
  { name: 'glosario', title: 'Glosario', component: GlosarioComponent },
  { name: 'resultadosF2M1', title: 'Resultados', component: ResultadosF2M1 },
])
</script>

<style>
.sentimiento {
  padding: 0.1em 0.4em;
  border-radius: 0.2em;
  background-color: antiquewhite;
}
</style>
