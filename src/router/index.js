import { createRouter, createWebHashHistory } from 'vue-router'

// Importar las vistas
import HomeView from '../views/HomeView.vue'
import ProyectosView from '../views/ProyectosView.vue'
import PlanCultura from '../views/2025/PlanCultura.vue'
import ContenidosView from '../views/ContenidosView.vue'
import ArticleView from '../views/ArticleView.vue'
import AdvLayout2025 from '../views/ebc/2025/icc/AdvLayout.vue'
import LeoLayout2025 from '../views/ebc/2025/leo/AdvLayout.vue'
import PacLayout2025 from '../views/ebc/2025/pac/AdvLayout.vue'
import InvestigacionesView from '../views/InvestigacionesView.vue'
import SolicitudesPai from '../views/2026/solicitudes_pai/SolicitudesPai.vue'
import SolicitudesPortada from '../views/2026/solicitudes_pai/SolicitudesPortada.vue'
import SolicitudesListado from '../views/2026/solicitudes_pai/SolicitudesListado.vue'
import SolicitudesInfo from '../views/2026/solicitudes_pai/SolicitudesInfo.vue'
import SolicitudesTablero from '../views/2026/solicitudes_pai/SolicitudesTablero.vue'
import ItdcLayout from '../views/2026/transformacion_digital/ItdcLayout.vue'
import ContenidosMovilidad from '../views/2026/contenidos_movilidad/ContenidosMovilidad.vue'

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
    component: AdvLayout2025,
    meta: { title: 'Encuesta Cultura Ciudadana 2025' },
  },
  {
    path: '/ebc/lectura-escritura-y-oralidad-2025',
    name: 'Lectura Escritura y Oralidad 2025',
    component: LeoLayout2025,
    meta: { title: 'Lectura Escritura y Oralidad 2025' },
  },
  {
    path: '/ebc/practicas-artisticas-culturales-creativas-patrimoniales-2025',
    name: 'Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025',
    component: PacLayout2025,
    meta: { title: 'Encuesta de Prácticas Artísticas, Culturales, Creativas y Patrimoniales 2025' },
  },
  {
    path: '/investigaciones',
    name: 'Investigaciones',
    component: InvestigacionesView,
    meta: { title: 'Investigaciones' },
  },
  {
    path: '/2026/impactos-transformacion-digital-en-la-cultura',
    name: 'Impactos Transformación Digital en la Cultura',
    component: ItdcLayout,
    meta: { title: 'Impactos Transformación Digital en la Cultura | Observatorio' },
  },
  {
    path: '/2026/contenidos-movilidad',
    name: 'Contenidos Movilidad',
    component: ContenidosMovilidad,
    meta: { title: 'Contenidos Movilidad | Observatorio' },
  },
  {
    path: '/2026/solicitudes-pai',
    component: SolicitudesPai,
    children: [
      {
        path: '',
        name: 'Solicitudes PAI 2026 Inicio',
        component: SolicitudesPortada,
        meta: { title: 'Solicitudes PAI | Observatorio' },
      },
      {
        path: 'listado',
        name: 'Solicitudes PAI 2026 Listado',
        component: SolicitudesListado,
        meta: { title: 'Listado Solicitudes PAI | Observatorio' },
      },
      {
        path: 'detalle',
        name: 'Solicitudes PAI 2026 Detalle',
        component: SolicitudesInfo,
        meta: { title: 'Detalle Solicitudes PAI | Observatorio' },
      },
      {
        path: 'tablero',
        name: 'Solicitudes PAI 2026 Tablero',
        component: SolicitudesTablero,
        meta: { title: 'Tablero Solicitudes PAI | Observatorio' },
      },
    ],
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
