import { createRouter, createWebHashHistory } from 'vue-router'

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
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
