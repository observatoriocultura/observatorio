<template>
  <section
    class="red-observatorios-carousel"
    aria-label="Imágenes destacadas de la Red de Observatorios"
    aria-roledescription="carrusel"
  >
    <div
      ref="carouselElement"
      class="carousel slide"
      data-bs-interval="4000"
      @mouseenter="pauseForInteraction"
      @mouseleave="resumeAfterInteraction"
      @focusin="pauseForInteraction"
      @focusout="handleFocusOut"
    >
      <div class="carousel-stage">
        <div class="carousel-inner" aria-live="off">
          <div
            v-for="(image, index) in images"
            :key="image.src"
            class="carousel-item"
            :class="{ active: index === activeIndex }"
          >
            <img
              class="d-block w-100"
              :src="image.src"
              :alt="image.alt"
              :loading="index === 0 ? 'eager' : 'lazy'"
            />
          </div>
        </div>

        <button
          class="carousel-control carousel-control-prev"
          type="button"
          aria-label="Mostrar imagen anterior"
          @click="previous"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button
          class="carousel-control carousel-control-next"
          type="button"
          aria-label="Mostrar imagen siguiente"
          @click="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      <div class="carousel-toolbar">
        <div class="carousel-description">
          <p class="carousel-kicker">Ventanas a la red</p>
          <p class="carousel-caption-text">{{ currentImage.caption }}</p>
        </div>

        <div class="carousel-actions">
          <button
            type="button"
            class="carousel-playback"
            :aria-label="isPaused ? 'Reproducir carrusel' : 'Pausar carrusel'"
            :title="isPaused ? 'Reproducir' : 'Pausar'"
            @click="togglePlayback"
          >
            <i :class="isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'" aria-hidden="true"></i>
          </button>

          <div class="carousel-pagination" aria-label="Seleccionar imagen">
            <button
              v-for="(image, index) in images"
              :key="image.src"
              type="button"
              class="carousel-indicator"
              :class="{ active: index === activeIndex }"
              :aria-current="index === activeIndex ? 'true' : undefined"
              :aria-label="`Mostrar imagen ${index + 1}: ${image.caption}`"
              @click="goTo(index)"
            >
              <span aria-hidden="true"></span>
            </button>
          </div>

          <span class="carousel-counter">
            {{ activeIndex + 1 }} / {{ images.length }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Carousel } from 'bootstrap'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const CAROUSEL_PATH = `${import.meta.env.BASE_URL}content/2026/demo_red_observatorios/carousel`

const carouselElement = ref(null)
const activeIndex = ref(0)
const isPaused = ref(false)

const images = [
  {
    caption: 'Datos e información sobre cultura y economía creativa',
    alt: 'Sitio web de un observatorio brasileño dedicado a la cultura y la economía creativa.',
  },
  {
    caption: 'Investigación y formación para comprender el campo cultural',
    alt: 'Sitio web del Observatorio Cultural de la Universidad de Buenos Aires.',
  },
  {
    caption: 'Patrimonio cultural y arqueológico conectado con el territorio',
    alt: 'Sitio web del Observatorio del Patrimonio Cultural Arqueológico de la UMSA.',
  },
  {
    caption: 'Políticas culturales y diversidad al alcance de nuevos públicos',
    alt: 'Sitio web de un observatorio brasileño sobre diversidad y políticas culturales.',
  },
  {
    caption: 'Análisis, formación y debate público sobre políticas culturales',
    alt: 'Sitio web del Observatorio de Políticas Culturales de Chile.',
  },
  {
    caption: 'Investigación cultural construida junto a las comunidades',
    alt: 'Sitio web de una entidad de la red con proyectos culturales y patrimoniales.',
  },
  {
    caption: 'Información y cooperación cultural para Iberoamérica',
    alt: 'Sitio web del Observatorio Iberoamericano de Cultura.',
  },
  {
    caption: 'Cultura, conocimiento y colaboración desde las universidades',
    alt: 'Sitio web del Observatorio Cultural del Proyecto Atalaya de la Universidad de Cádiz.',
  },
].map((image, index) => ({
  ...image,
  src: `${CAROUSEL_PATH}/red_observatorios_demo_${index + 1}.jpg`,
}))

const currentImage = computed(() => images[activeIndex.value])

let carouselInstance = null

const goTo = (index) => carouselInstance?.to(index)
const previous = () => carouselInstance?.prev()
const next = () => carouselInstance?.next()

const pauseForInteraction = () => {
  if (!isPaused.value) {
    carouselInstance?.pause()
  }
}

const resumeAfterInteraction = () => {
  if (!isPaused.value) {
    carouselInstance?.cycle()
  }
}

const handleFocusOut = (event) => {
  if (!carouselElement.value?.contains(event.relatedTarget)) {
    resumeAfterInteraction()
  }
}

const togglePlayback = () => {
  if (!carouselInstance) {
    return
  }

  if (isPaused.value) {
    carouselInstance.cycle()
  } else {
    carouselInstance.pause()
  }

  isPaused.value = !isPaused.value
}

const handleSlideComplete = (event) => {
  activeIndex.value = event.to
}

onMounted(() => {
  const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  isPaused.value = Boolean(reduceMotion)
  carouselInstance = new Carousel(carouselElement.value, {
    interval: 4000,
    keyboard: true,
    pause: false,
    ride: reduceMotion ? false : 'carousel',
    touch: true,
    wrap: true,
  })
  carouselElement.value.addEventListener('slid.bs.carousel', handleSlideComplete)
})

onUnmounted(() => {
  carouselElement.value?.removeEventListener('slid.bs.carousel', handleSlideComplete)
  carouselInstance?.dispose()
})
</script>

<style scoped>
.red-observatorios-carousel {
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

.carousel {
  overflow: hidden;
  border: 1px solid var(--red-border, #e2e6ea);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 42px rgba(50, 32, 74, 0.1);
}

.carousel-stage {
  position: relative;
  overflow: hidden;
  background: #ebe7ef;
}

.carousel-item img {
  aspect-ratio: 920 / 437;
  object-fit: cover;
}

.carousel-control {
  width: clamp(52px, 8%, 82px);
  opacity: 1;
}

.carousel-control::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(26, 19, 35, 0.35), transparent);
  content: '';
  opacity: 0;
  transition: opacity 0.2s ease;
}

.carousel-control-next::before {
  background: linear-gradient(270deg, rgba(26, 19, 35, 0.35), transparent);
}

.carousel-control:hover::before,
.carousel-control:focus-visible::before {
  opacity: 1;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  z-index: 1;
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  background-color: rgba(50, 32, 74, 0.76);
  background-size: 48%;
  box-shadow: 0 5px 16px rgba(26, 19, 35, 0.2);
  backdrop-filter: blur(6px);
}

.carousel-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.5rem;
  min-height: 88px;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--red-border, #e2e6ea);
  background: linear-gradient(120deg, #fff 0%, #faf8fc 100%);
}

.carousel-description {
  min-width: 0;
}

.carousel-kicker {
  margin: 0 0 0.2rem;
  color: var(--red-purple, #654096);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.carousel-caption-text {
  margin: 0;
  color: var(--red-ink, #18232b);
  font-size: clamp(0.95rem, 1.6vw, 1.12rem);
  font-weight: 700;
  line-height: 1.35;
}

.carousel-actions,
.carousel-pagination {
  display: flex;
  align-items: center;
}

.carousel-actions {
  gap: 0.65rem;
}

.carousel-playback {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid #ddd5e6;
  border-radius: 50%;
  background: #fff;
  color: var(--red-purple, #654096);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.carousel-playback:hover {
  border-color: var(--red-purple, #654096);
  background: var(--red-purple, #654096);
  color: #fff;
}

.carousel-playback i {
  font-size: 1.15rem;
  line-height: 1;
}

.carousel-pagination {
  gap: 0.05rem;
}

.carousel-indicator {
  display: inline-flex;
  width: 28px;
  height: 40px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  padding: 0;
}

.carousel-indicator span {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #c8c0d1;
  transition:
    width 0.2s ease,
    background-color 0.2s ease;
}

.carousel-indicator.active span {
  width: 20px;
  background: var(--red-purple, #654096);
}

.carousel-counter {
  min-width: 36px;
  color: var(--red-muted, #5c6871);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.carousel-playback:focus-visible,
.carousel-indicator:focus-visible,
.carousel-control:focus-visible {
  outline: 3px solid rgba(101, 64, 150, 0.35);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .carousel-toolbar {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .carousel-actions {
    justify-content: space-between;
  }

  .carousel-pagination {
    margin: 0 auto;
  }
}

@media (max-width: 575px) {
  .carousel {
    border-radius: 13px;
  }

  .carousel-toolbar {
    padding: 0.9rem 1rem;
  }

  .carousel-control {
    width: 54px;
  }

  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    width: 2rem;
    height: 2rem;
  }

  .carousel-indicator {
    width: 23px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-item,
  .carousel-control::before,
  .carousel-indicator span {
    transition: none;
  }
}
</style>
