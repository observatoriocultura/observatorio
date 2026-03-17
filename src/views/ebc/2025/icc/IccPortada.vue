<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const surveyInfo = inject('surveyInfo')
const codigoMedicion = inject('codigoMedicion')
const router = useRouter()
const route = useRoute()

const currentIndex = ref(0)
let timer = null

const baseUrl = import.meta.env.BASE_URL
const imagesCarousel = [
  'ambiente.jpg',
  'cultura-ciudadana.jpg',
  'equidad-de-genero.jpg',
  'espacio-publico.jpg',
  'inclusion-de-identidades.jpg',
  'movilidad.jpg',
]

const getImagePath = (imageName) => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/carrusel/${imageName}`
}

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % imagesCarousel.length
}

const getIconPath = (iconName) => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/icons/${iconName}`
}

const menuPrincipal = [
  {
    number: 1,
    key: 'convivencia-y-cultura-de-paz',
    title: 'Convivencia y cultura de paz',
    icon: 'convivencia-y-cultura-de-paz.svg',
    path: '/icc/convivencia-y-cultura-de-paz',
    numSection: '6',
    color: '#FF4081',
  },
  {
    number: 2,
    key: 'cultura-ambiental',
    title: 'Cultura ambiental',
    icon: 'cultura-ambiental.svg',
    path: '/icc/cultura-ambiental',
    numSection: '9',
    color: '#4CAF50',
  },
  {
    number: 3,
    key: 'equidad-de-genero',
    title: 'Equidad de género',
    icon: 'equidad-de-genero.svg',
    path: '/icc/equidad-de-genero',
    numSection: '4',
    color: '#AB47BC',
  },
  {
    number: 4,
    key: 'cultura-politica-y-ciudadana',
    title: 'Cultura política y ciudadana',
    icon: 'iconos-cultura-politica-y-ciudadana.svg',
    path: '/icc/cultura-politica-y-ciudadana',
    numSection: '6',
    color: '#2196F3',
  },
  {
    number: 5,
    key: 'inclusion-e-identidades-sociales-diversas',
    title: 'Inclusión e identidades sociales diversas',
    icon: 'inclusion-e-identidades-sociales-diversas.svg',
    path: '/icc/inclusion-e-identidades-sociales-diversas',
    numSection: '3',
    color: '#FF9800',
  },
  {
    number: 6,
    key: 'espacio-publico',
    title: 'Espacio Público',
    icon: 'espacio-publico.svg',
    path: '/icc/espacio-publico',
    numSection: '3',
    color: '#00BCD4',
  },
  {
    number: 7,
    key: 'movilidad',
    title: 'Movilidad',
    icon: 'movilidad.svg',
    path: '/icc/movilidad',
    numSection: '10',
    color: '#78909C',
  },
]

const goToSection = (numSection) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: 'resultados',
      num_seccion: numSection,
    },
  })
}

onMounted(() => {
  timer = setInterval(nextImage, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const displayTitle = computed(() => {
  if (!surveyInfo.value?.nombre_medicion) return ''
  return surveyInfo.value.nombre_medicion.replace(/\s\d{4}$/, '')
})

const displayYear = computed(() => {
  if (!surveyInfo.value?.año_referencia) return ''
  return surveyInfo.value.año_referencia
})

const logoPath = computed(() => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/logos-distrito-aqui-si-pasa-mi-ciudad-mi casa.svg`
})

const logoBogotaPath = computed(() => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/logos-distrito-bogota-estrella.svg`
})
</script>

<template>
  <div class="icc-portada-hero">
    <!-- Logos Institucionales -->
    <div class="hero-logo-left">
      <img :src="logoPath" alt="Logo Institucional" />
    </div>
    <div class="hero-logo-right">
      <img :src="logoBogotaPath" alt="Logo Bogotá" />
    </div>

    <!-- Carrusel de Fondo -->
    <div class="background-carousel">
      <transition-group name="fade">
        <div
          v-for="(image, index) in imagesCarousel"
          v-show="index === currentIndex"
          :key="image"
          class="carousel-slide"
          :style="{ backgroundImage: `url(${getImagePath(image)})` }"
        ></div>
      </transition-group>
      <div class="carousel-overlay"></div>
    </div>

    <!-- Contenido Superpuesto -->
    <div v-if="surveyInfo" class="hero-content">
      <div class="hero-container">
        <h2 class="hero-subtitle">Encuesta Bienal de Culturas</h2>
        <h1 class="hero-title">
          {{ displayTitle }}
          <span class="hero-year">{{ displayYear }}</span>
        </h1>
      </div>
    </div>

    <!-- Menú Inferior -->
    <div class="hero-menu">
      <div class="menu-grid">
        <button
          v-for="item in menuPrincipal"
          :key="item.key"
          class="menu-btn"
          @click="goToSection(item.numSection)"
        >
          <div
            class="menu-icon-mask me-3"
            :style="{
              maskImage: `url(${getIconPath(item.icon)})`,
              webkitMaskImage: `url(${getIconPath(item.icon)})`,
              backgroundColor: item.color,
            }"
          ></div>
          {{ item.title }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icc-portada-hero {
  position: relative;
  width: 100%;
  height: calc(100vh - 75px); /* Ocupa la mayor parte de la altura disponible */
  min-height: 500px;
  overflow: hidden;
  border-radius: 2em;
  display: flex;
  align-items: center;
  background: #32204a;
}

.hero-logo-left {
  position: absolute;
  top: 1.5rem;
  left: 2rem;
  z-index: 4;
}

.hero-logo-right {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  z-index: 4;
}

.hero-logo-left img,
.hero-logo-right img {
  height: 60px;
  width: auto;
  filter: brightness(0) invert(1); /* Asegura que el logo sea blanco para contrastar */
}

.background-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(50, 32, 74, 0.9) 0%,
    rgba(50, 32, 74, 0.4) 50%,
    rgba(50, 32, 74, 0.1) 100%
  );
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  color: #ffffff;
  width: 100%;
  padding: 0 5rem;
  margin-top: -10%; /* Sube un poco el contenido para no pisar el menú */
}

.hero-menu {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 33%;
  background: linear-gradient(0deg, rgba(50, 32, 74, 0.8) 0%, rgba(50, 32, 74, 0) 100%);
  backdrop-filter: blur(2px);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5rem 2rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  width: 100%;
  max-width: 1200px;
}

.menu-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid #f0ebf7;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(8px);
}

.menu-icon-mask {
  width: 32px;
  height: 32px;
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
}

.menu-btn:hover {
  background: #f0ebf7;
  color: #32204a;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.hero-container {
  max-width: 900px;
}

.hero-title {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 0; /* Eliminado margen ya que no hay contenido debajo */
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.hero-year {
  color: #ffca28; /* Color resaltado para el año */
  font-size: 1.1em;
}

.hero-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Transición Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 992px) {
  .hero-content {
    padding: 0 3rem;
  }
}

@media (max-width: 768px) {
  .icc-portada-hero {
    height: auto;
    min-height: 500px;
    padding: 4rem 0;
  }
  .hero-content {
    padding: 0 1.5rem;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
