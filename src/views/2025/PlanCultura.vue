<template>
  <ul class="nav nav-tabs mb-4">
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
</template>

<script setup>
import { ref } from 'vue'
import InicioComponent from '../../components/i100_plan_cultura/InicioComponent.vue'
import GlosarioComponent from '../../components/i100_plan_cultura/GlosarioComponent.vue'

// Variables
//-----------------------------------------------------------------------------
const currentSection = ref('glosario')
const sections = ref([
  { name: 'inicio', title: 'Inicio', component: InicioComponent },
  { name: 'glosario', title: 'Glosario', component: GlosarioComponent },
])
</script>
