import { createRouter, createWebHashHistory } from 'vue-router'

// Importar las vistas
import HomeView from '../views/HomeView.vue'
import ProyectosView from '../views/ProyectosView.vue'
import PlanCultura from '../views/2025/PlanCultura.vue'
import ContenidosView from '../views/ContenidosView.vue'
import ArticleView from '../views/ArticleView.vue'
import IccLayout2025 from '../views/ebc/2025/IccLayout.vue'
import InvestigacionesView from '../views/InvestigacionesView.vue'

const routes = [
  { path: '/', name: 'Inicio', component: HomeView, meta: { title: 'Inicio | Observatorio' } },
  {
    path: '/proyectos',
    name: 'Proyectos',
    component: ProyectosView,
    meta: { title: 'Proyectos' },
  },
  {
    path: '/analisis-participaciones-plan-cultura-2038',
    name: 'Análisis Participaciones Plan Distrital de Cultura 2038',
    component: PlanCultura,
    meta: { title: 'Análisis Participaciones Plan Distrital de Cultura 2038' },
  },
  {
    path: '/contenidos',
    name: 'Contenidos',
    component: ContenidosView,
    meta: { title: 'Contenidos' },
  },
  {
    path: '/ebc/encuesta-cultura-ciudadana-2025',
    name: 'Encuesta Cultura Ciudadana 2025',
    component: IccLayout2025,
    meta: { title: 'Encuesta Cultura Ciudadana 2025' },
  },
  {
    path: '/investigaciones',
    name: 'Investigaciones',
    component: InvestigacionesView,
    meta: { title: 'Investigaciones' },
  },
  {
    path: '/:year/:slug',
    name: 'Article',
    component: ArticleView,
    meta: { title: 'Artículo' },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const defaultTitle = 'Observatorio Cultural'
  document.title = to.meta.title || defaultTitle
  next()
})

export default router
