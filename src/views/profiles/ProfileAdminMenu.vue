<script setup>
import { computed } from 'vue'
import NavTabs1 from '../../components/navigation/NavTabs1.vue'

const props = defineProps({
  profileId: {
    type: String,
    required: true,
  },
  backRoute: {
    type: String,
    default: '/profiles',
  },
})

const menuItems = computed(() => [
  {
    label: 'Ver perfil',
    to: `/profiles/read/${props.profileId}`,
    icon: 'bi bi-person',
  },
  {
    label: 'Editar',
    to: `/profiles/edit/${props.profileId}`,
    icon: 'bi bi-pencil',
  },
])
</script>

<template>
  <NavTabs1 :back-link="backRoute" :menu-items="menuItems" />
</template>
