import { createRouter, createWebHistory } from 'vue-router'

// Importar las vistas
import HomeView from '../views/HomeView.vue'
import ProyectosView from '../views/ProyectosView.vue'
import ContactoView from '../views/ContactoView.vue'

const routes = [
  { path: '/', name: 'Inicio', component: HomeView },
  { path: '/proyectos', name: 'ProyectosView', component: ProyectosView },
  { path: '/contacto', name: 'ContactoView', component: ContactoView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
