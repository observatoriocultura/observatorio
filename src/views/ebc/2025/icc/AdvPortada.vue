<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MENU_PRINCIPAL as DEFAULT_MENU_PRINCIPAL,
  IMAGES_CAROUSEL as DEFAULT_IMAGES_CAROUSEL,
} from './constants'

const surveyConstants = inject('surveyConstants', {})
const MENU_PRINCIPAL = surveyConstants.MENU_PRINCIPAL || DEFAULT_MENU_PRINCIPAL
const IMAGES_CAROUSEL = surveyConstants.IMAGES_CAROUSEL || DEFAULT_IMAGES_CAROUSEL

const surveyInfo = inject('surveyInfo')
const codigoMedicion = inject('codigoMedicion')
const router = useRouter()
const route = useRoute()

const currentIndex = ref(0)
let timer = null

const baseUrl = import.meta.env.BASE_URL

const getImagePath = (imageName) => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/carrusel/${imageName}`
}

const getGeneralImagePath = (imageName) => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/${imageName}`
}

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % IMAGES_CAROUSEL.length
}

const getIconPath = (iconName) => {
  return `${baseUrl}content/mediciones/${codigoMedicion}/images/icons/${iconName}`
}

// Datos importados de iccConstants.js

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

const goToResumenGeneral = () => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: 'resultados',
      num_seccion: 1,
      num_pregunta: 22,
    },
  })
}

onMounted(() => {
  timer = setInterval(nextImage, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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
  <div class="adv-portada-hero">
    <!-- Logos Institucionales -->
    <div class="hero-logo-left">
      <img :src="logoPath" alt="Logo Institucional" />
    </div>
    <div class="hero-logo-right">
      <img :src="logoBogotaPath" alt="Logo Bogotá" />
    </div>
    <div class="hero-logo-bottom-left">
      <img :src="getGeneralImagePath('dogcc-logotipo-blanco.png')" alt="Logo DOGCC" />
    </div>
    <div class="hero-logo-bottom-right">
      <img
        :src="getGeneralImagePath('logo-sectretaria-cultura-blanco.png')"
        alt="Logo Secretaría Cultura"
      />
    </div>

    <!-- Carrusel de Fondo -->
    <div class="background-carousel">
      <transition-group name="fade">
        <div
          v-for="(image, index) in IMAGES_CAROUSEL"
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
        <p class="hero-eyebrow">Encuesta Bienal de Culturas</p>
        <h1 class="hero-title">
          <span>Encuesta de</span>
          <span>Indicadores de Cultura Ciudadana</span>
          <span>y Garantía de Derechos</span>
          <span class="hero-year">{{ displayYear }}</span>
        </h1>
      </div>
    </div>

    <!-- Menú Inferior -->
    <div class="hero-menu">
      <div class="menu-grid">
        <button class="btn-arrow" @click="goToResumenGeneral">
          <img :src="getGeneralImagePath('flecha-flecha.svg')" alt="Flecha" />
        </button>
        <button
          v-for="item in MENU_PRINCIPAL"
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
/* ==========================================================================
   ESTILOS BASE: LAPTOP & DESKTOP (VISTA PREDETERMINADA)
   ========================================================================== */

.adv-portada-hero {
  position: relative;
  width: 100%;
  height: calc(100vh - 75px);
  min-height: 600px;
  overflow: hidden;
  border-radius: 0.8rem;
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
  filter: brightness(0) invert(1);
}

.hero-logo-bottom-left {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 10;
}

.hero-logo-bottom-left img,
.hero-logo-bottom-right img {
  height: 30px;
  width: auto;
}

.hero-logo-bottom-right {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
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
  margin-top: calc(-10% - 50px);
}

.hero-container {
  max-width: 900px;
}

.hero-eyebrow {
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  display: block;
}

.hero-title {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.hero-year {
  color: #ffca28;
  font-size: 1.4em;
  font-weight: 900;
  margin-top: 0.2rem;
}

/* MENÚ GRID DESKTOP */
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
  padding: 0 5rem calc(3.5rem + 50px);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 1.25rem;
  width: 100%;
  max-width: 1250px;
}

/* BOTONES DEL MENÚ */
.menu-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid #f0ebf7;
  padding: 0.85rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  backdrop-filter: blur(8px);
  height: 100%;
  width: 100%;
  min-height: 85px;
}

.menu-btn:hover {
  background: #f0ebf7;
  color: #32204a;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.menu-icon-mask {
  width: 30px;
  height: 30px;
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
}

/* BOTÓN ESPECIAL: FLECHA */
.btn-arrow {
  background: #ffca28;
  border: 1px solid #ffca28;
  padding: 0.8rem 1.5rem;
  border-radius: 0 50px 50px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  height: 100%;
  width: 100%;
}

.btn-arrow img {
  height: 22px;
  width: auto;
}

.btn-arrow:hover {
  background: #ffb300;
  transform: scale(1.05);
}

/* ANIMACIONES */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==========================================================================
   ESTILOS RESPONSIVE: MOBILE & TABLET
   ========================================================================== */

@media (max-width: 1400px) {
  .hero-content {
    padding: 0 3rem;
    margin-top: -8%;
  }
  .hero-title {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
  }
  .hero-eyebrow {
    font-size: 0.8rem;
    margin-bottom: 0.35rem;
  }
  .menu-btn {
    padding: 0.75rem 1.25rem;
    min-height: 75px;
    font-size: 0.85rem;
  }
  .menu-grid {
    gap: 0.85rem;
  }
  .hero-menu {
    padding-bottom: 2.5rem;
  }
}

@media (max-width: 1200px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .hero-menu {
    height: auto;
    padding: 2.5rem 2rem;
    position: relative;
    background: #32204a;
  }
  .hero-content {
    padding: 0 3rem;
    margin-top: 0;
    margin-bottom: 2rem;
  }
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .adv-portada-hero {
    height: auto;
    min-height: 100vh;
    flex-direction: column;
    padding: 6rem 0 0;
    border-radius: 0;
  }
}

@media (max-width: 768px) {
  .hero-logo-left img,
  .hero-logo-right img {
    height: 45px;
  }
  .hero-logo-bottom-left,
  .hero-logo-bottom-right {
    bottom: 1rem;
  }
  .hero-logo-bottom-left {
    left: 1rem;
  }
  .hero-logo-bottom-right {
    right: 1rem;
  }
  .hero-logo-bottom-left img,
  .hero-logo-bottom-right img {
    height: 30px;
  }
  .hero-content {
    padding: 0 1.5rem;
  }
  .hero-title {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
  .hero-eyebrow {
    font-size: 0.8rem;
    letter-spacing: 0.15em;
  }
}

@media (max-width: 576px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .menu-btn {
    font-size: 0.85rem;
    padding: 0.75rem 1.25rem;
  }
  .btn-arrow {
    padding: 0.75rem;
  }
}
</style>
