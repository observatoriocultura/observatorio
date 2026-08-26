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
import InvestigacionesView from '../views/investigaciones/InvestigacionesView.vue'
import SolicitudesPai from '../views/2026/solicitudes_pai/SolicitudesPai.vue'
import SolicitudesPortada from '../views/2026/solicitudes_pai/SolicitudesPortada.vue'
import SolicitudesListado from '../views/2026/solicitudes_pai/SolicitudesListado.vue'
import SolicitudesInfo from '../views/2026/solicitudes_pai/SolicitudesInfo.vue'
import SolicitudesTablero from '../views/2026/solicitudes_pai/SolicitudesTablero.vue'
import ItdcLayout from '../views/2026/transformacion_digital/ItdcLayout.vue'
import ContenidosMovilidad from '../views/2026/contenidos_movilidad/ContenidosMovilidad.vue'
import RedObservatorios from '../views/2026/demo_red_observatorios/RedObservatorios.vue'
import MetaPdd from '../views/2026/meta_pdd/MetaPdd.vue'
import MetaPddControl from '../views/2026/meta_pdd/MetaPddControl.vue'
import PaiView from '../views/pai/PaiView.vue'
import MapaLocalidades from '../views/tools/MapaLocalidades.vue'
import MapaPruebas from '../views/tools/MapaPruebas.vue'
import IaChatTest from '../views/tools/IaChatTest.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import RecoveryPassword from '../views/auth/RecoveryPassword.vue'
import NewPassword from '../views/auth/NewPassword.vue'
import ProfileView from '../views/profile/ProfileView.vue'
import ChangePassword from '../views/profiles/ChangePassword.vue'
import ProfilesView from '../views/profiles/ProfilesView.vue'
import ProfilesListView from '../views/profiles/ProfilesListView.vue'
import EditProfileView from '../views/profiles/EditProfileView.vue'
import { supabase } from '../lib/supabase'

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: HomeView,
    meta: { title: 'Observatorio de Cultura Bogotá' },
  },
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
    path: '/meta-pdd-mediciones-observatorio',
    name: 'Meta PDD Mediciones Observatorio',
    component: MetaPdd,
    meta: { title: 'Meta PDD Mediciones | Observatorio' },
  },
  {
    path: '/meta-pdd-mediciones-observatorio-control',
    name: 'Meta PDD Mediciones Observatorio Control',
    component: MetaPddControl,
    meta: { title: 'Meta PDD Mediciones Control | Observatorio' },
  },
  {
    path: '/pai',
    redirect: '/pai/2025',
  },
  {
    path: '/pai/:year',
    name: 'PAI',
    component: PaiView,
    meta: { title: 'PAI Seguimiento' },
  },
  {
    path: '/herramientas/mapa_localidades',
    name: 'Mapa Localidades',
    component: MapaLocalidades,
    meta: { title: 'Mapa de Localidades | Observatorio' },
  },
  {
    path: '/herramientas/mapa_pruebas',
    name: 'Mapa Pruebas',
    component: MapaPruebas,
    meta: { title: 'Mapa de Pruebas | Observatorio' },
  },
  {
    path: '/tests/ia-chat/v5Gj8bXO3Xaw',
    name: 'Prueba chat IA',
    component: IaChatTest,
    meta: { title: 'Prueba chat IA | Observatorio' },
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
    path: '/test/demo-red-observatorios',
    name: 'Demo Red de Observatorios',
    component: RedObservatorios,
    meta: { title: 'Demo Red de Observatorios | Observatorio' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Iniciar sesión', isPublic: true, authMethod: 'password' },
  },
  {
    path: '/login/link',
    name: 'login-link',
    component: LoginView,
    meta: { title: 'Iniciar sesión con magic link', isPublic: true, authMethod: 'magic-link' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Registrarse', isPublic: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: RecoveryPassword,
    meta: { title: 'Recuperar contraseña', isPublic: true },
  },
  {
    path: '/new-password',
    name: 'new-password',
    component: NewPassword,
    meta: { title: 'Nueva contraseña', isPublic: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'Mi perfil', requiresAuth: true },
  },
  {
    path: '/change_password',
    name: 'change-password',
    component: ChangePassword,
    meta: { title: 'Cambiar contraseña', requiresAuth: true },
  },
  {
    path: '/profiles',
    component: ProfilesView,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'profiles',
        component: ProfilesListView,
        meta: {
          title: 'Administrar usuarios',
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
      {
        path: 'edit/:id',
        name: 'edit-profile',
        component: EditProfileView,
        meta: {
          title: 'Editar perfil',
          requiresAuth: true,
          requiresAdmin: true,
        },
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

router.beforeEach(async (to) => {
  const defaultTitle = 'Observatorio de Culturas - Bogotá'
  document.title = to.meta.title || defaultTitle

  const isAuthEntry = ['login', 'login-link', 'register'].includes(String(to.name))

  if (!supabase) {
    if (to.meta.requiresAuth) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    return true
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && (sessionError || !session)) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (isAuthEntry && session) {
    return { name: 'profile' }
  }

  if (to.meta.requiresAdmin && session) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      return { name: 'profile' }
    }
  }

  return true
})

export default router
