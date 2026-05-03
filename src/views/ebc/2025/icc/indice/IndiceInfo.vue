<script setup>
import { computed } from 'vue'

const props = defineProps({
  indices: { type: Array, default: () => [] },
})

/** Indice General (nivel 1) */
const indiceGeneral = computed(() => props.indices.find((i) => i.nivel === 1))

/** Subindices (nivel 2) */
const subindices = computed(() => props.indices.filter((i) => i.nivel === 2))

const totalSubindices = computed(() => subindices.value.length)

/** Mapeo de colores por llave (basado en constants.js MENU_PRINCIPAL) */
const getColor = (key) => {
  const colors = {
    indice: '#654096',
    inclusion: '#FF9800',
    genero: '#AB47BC',
    politica: '#2196F3',
    convivencia: '#FF4081',
    espacio: '#00BCD4',
    ambiental: '#4CAF50',
    movilidad: '#78909C',
  }
  return colors[key] || '#6c757d'
}

/** Iconos sugeridos por dimension */
const getIcon = (key) => {
  const icons = {
    indice: 'bi-speedometer2',
    inclusion: 'bi-people-fill',
    genero: 'bi-gender-ambiguous',
    politica: 'bi-bank',
    convivencia: 'bi-chat-heart',
    espacio: 'bi-tree',
    ambiental: 'bi-leaf',
    movilidad: 'bi-bicycle',
  }
  return icons[key] || 'bi-info-circle'
}
</script>

<template>
  <div class="indice-info container">
    <section
      v-if="indiceGeneral"
      class="indice-hero card-premium"
      :style="{ '--indice-color': getColor('indice') }"
    >
      <div class="hero-mark" aria-hidden="true">
        <i :class="getIcon('indice')"></i>
      </div>

      <div class="hero-content">
        <p class="eyebrow mb-1">Marco conceptual</p>
        <div class="hero-title-row">
          <h3 class="hero-title mb-0">
            {{ indiceGeneral.nombre }}
          </h3>
          <span class="dimension-count"> {{ totalSubindices }} dimensiones </span>
        </div>
        <p class="hero-description mb-0">
          {{ indiceGeneral.descripcion }}
        </p>
      </div>
    </section>

    <section class="dimensions-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow mb-1">Dimensiones del indice</p>
          <h4 class="section-title mb-0">Componentes que estructuran la medicion</h4>
        </div>
      </div>

      <div class="dimensions-grid">
        <article
          v-for="sub in subindices"
          :key="sub.num"
          class="dimension-card card-premium"
          :style="{ '--indice-color': getColor(sub.key) }"
        >
          <div class="dimension-accent" aria-hidden="true"></div>
          <div class="dimension-content">
            <div class="dimension-header">
              <span class="dimension-icon" aria-hidden="true">
                <i :class="getIcon(sub.key)"></i>
              </span>
              <div class="dimension-title-group">
                <span v-if="sub.abreviatura" class="dimension-code">{{ sub.abreviatura }}</span>
                <h5 class="dimension-title mb-0">
                  {{ sub.nombre }}
                </h5>
              </div>
            </div>

            <p class="dimension-description mb-0">
              {{ sub.descripcion }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.indice-info {
  max-width: 1040px;
  padding: 0.25rem 0 1rem;
  animation: fadeSlideIn 0.4s ease-out;
}

.indice-hero {
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  overflow: hidden;
  padding: 1.25rem;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--indice-color) 7%, transparent), transparent),
    #fff;
  box-shadow: 0 8px 24px rgba(33, 37, 41, 0.06);
}

.indice-hero::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  content: '';
  background: var(--indice-color);
}

.hero-mark {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  color: #fff;
  font-size: 1.65rem;
  background: var(--indice-color);
  border-radius: 8px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--indice-color) 24%, transparent);
}

.hero-content {
  min-width: 0;
}

.eyebrow {
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.hero-title {
  color: #212529;
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  font-weight: 850;
  letter-spacing: 0;
}

.dimension-count {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.25rem 0.75rem;
  color: var(--indice-color);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--indice-color) 22%, #e7eaf0);
  border-radius: 999px;
}

.hero-description {
  max-width: 820px;
  margin-top: 0.75rem;
  color: #495057;
  font-size: 0.98rem;
  line-height: 1.65;
}

.dimensions-section {
  margin-top: 1.25rem;
}

.section-heading {
  display: flex;
  gap: 1rem;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.section-title {
  color: #212529;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.dimension-card {
  position: relative;
  display: grid;
  grid-template-columns: 5px minmax(0, 1fr);
  min-height: 188px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  box-shadow: 0 5px 18px rgba(33, 37, 41, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.dimension-card:hover {
  border-color: color-mix(in srgb, var(--indice-color) 22%, #edf0f2);
  box-shadow: 0 10px 24px rgba(33, 37, 41, 0.08);
  transform: translateY(-2px);
}

.dimension-accent {
  background: var(--indice-color);
}

.dimension-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 0;
  padding: 1rem;
}

.dimension-header {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.dimension-icon {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  color: var(--indice-color);
  font-size: 1.25rem;
  background: color-mix(in srgb, var(--indice-color) 11%, #fff);
  border-radius: 8px;
}

.dimension-title-group {
  min-width: 0;
}

.dimension-code {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--indice-color);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dimension-title {
  color: #212529;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.dimension-description {
  color: #5c6972;
  font-size: 0.88rem;
  line-height: 1.65;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .indice-hero {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .hero-mark {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
  }

  .section-heading {
    align-items: flex-start;
  }

  .dimensions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
