<template>
  <section
    v-if="layout.mode !== 'hidden'"
    class="map-fan"
    :class="{ 'map-fan--panel': layout.mode === 'panel' }"
    :style="{ '--fan-color': color }"
    role="dialog"
    aria-modal="false"
    aria-labelledby="map-fan-title"
    @keydown.esc.stop.prevent="$emit('close')"
  >
    <svg
      v-if="layout.mode === 'radial'"
      class="fan-connectors"
      :viewBox="`0 0 ${width} ${height}`"
      aria-hidden="true"
    >
      <g v-for="(card, index) in layout.cards" :key="index">
        <line
          :x1="point.x"
          :y1="point.y"
          :x2="card.endX"
          :y2="card.endY"
          class="fan-line-outline"
        />
        <line :x1="point.x" :y1="point.y" :x2="card.endX" :y2="card.endY" class="fan-line" />
      </g>
    </svg>

    <header class="fan-heading">
      <div>
        <p class="fan-country">{{ countryName }}</p>
        <h2 id="map-fan-title" :title="group.city.label">{{ group.city.label }}</h2>
        <p class="fan-count">
          {{ group.entities.length }}
          {{ group.entities.length === 1 ? 'participante de la red' : 'participantes de la red' }}
        </p>
      </div>
      <button
        ref="closeButton"
        type="button"
        class="fan-close"
        aria-label="Cerrar entidades de la ciudad"
        @click="$emit('close')"
      >
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </header>

    <div ref="cardsContainer" class="fan-cards">
      <article
        v-for="(entity, index) in visibleEntities"
        :key="entity.id"
        class="fan-card"
        :style="cardStyle(index)"
      >
        <p class="fan-entity-type">{{ getEntityFieldLabel('tipo_actor', entity.tipo_actor) }}</p>
        <h3 :title="entity.nombre">{{ entity.nombre }}</h3>
        <RouterLink
          class="fan-profile-link"
          :to="{
            name: 'Perfil Red de Observatorios',
            params: { slug: entity.slug || `entidad-${entity.id}` },
          }"
          :aria-label="`Ver detalles de ${entity.nombre}`"
        >
          Ver detalles <span aria-hidden="true">→</span>
        </RouterLink>
      </article>
    </div>

    <nav v-if="pageCount > 1" class="fan-pagination" aria-label="Páginas de entidades de la ciudad">
      <button
        type="button"
        :disabled="page === 0"
        aria-label="Entidades anteriores"
        @click="changePage(-1)"
      >
        Anterior
      </button>
      <span aria-live="polite" aria-atomic="true"
        >{{ start + 1 }}–{{ Math.min(start + pageSize, group.entities.length) }} de
        {{ group.entities.length }}</span
      >
      <button
        type="button"
        :disabled="page === pageCount - 1"
        aria-label="Entidades siguientes"
        @click="changePage(1)"
      >
        Siguiente
      </button>
    </nav>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getEntityFieldLabel } from '../../../utils/redObservatorios.js'
import {
  getObservatoriosFanLayout,
  OBSERVATORIOS_FAN_PAGE_SIZE,
} from '../../../utils/redObservatoriosAbanico.js'

const props = defineProps({
  group: { type: Object, required: true },
  point: { type: Object, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  countryName: { type: String, required: true },
  color: { type: String, required: true },
})
defineEmits(['close'])
const pageSize = OBSERVATORIOS_FAN_PAGE_SIZE
const page = ref(0)
const closeButton = ref(null)
const cardsContainer = ref(null)
const start = computed(() => page.value * pageSize)
const pageCount = computed(() => Math.max(1, Math.ceil(props.group.entities.length / pageSize)))
const visibleEntities = computed(() =>
  props.group.entities.slice(start.value, start.value + pageSize),
)
const layout = computed(() =>
  getObservatoriosFanLayout({
    point: props.point,
    width: props.width,
    height: props.height,
    count: visibleEntities.value.length,
  }),
)

function cardStyle(index) {
  const card = layout.value.cards[index]
  return card
    ? {
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.width}px`,
        height: `${card.height}px`,
      }
    : undefined
}

async function changePage(direction) {
  page.value = Math.max(0, Math.min(pageCount.value - 1, page.value + direction))
  await nextTick()
  if (cardsContainer.value) cardsContainer.value.scrollTop = 0
}

watch(
  () => props.group.city.key,
  () => {
    page.value = 0
  },
)
watch(pageCount, (count) => {
  page.value = Math.min(page.value, count - 1)
})
defineExpose({ focusClose: () => closeButton.value?.focus({ preventScroll: true }) })
</script>

<style scoped>
.map-fan {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  animation: fan-appear 0.18s ease-out;
}
.fan-connectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.fan-line-outline {
  stroke: #8a7562;
  stroke-width: 3.5;
  opacity: 0.45;
}
.fan-line {
  stroke: var(--fan-color);
  stroke-width: 2;
}
.fan-heading {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  max-width: min(370px, calc(100% - 80px));
  border: 1px solid var(--red-border);
  border-radius: 18px;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  background: var(--red-surface);
  box-shadow: 0 6px 20px rgb(36 18 7 / 8%);
  pointer-events: auto;
}
.fan-heading > div {
  min-width: 0;
}
.fan-country {
  margin: 0 0 0.2rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  line-height: 1.2;
}
.fan-heading h2 {
  margin: 0;
  color: var(--red-ink);
  font-size: 1.1rem;
  line-height: 1.15;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.fan-count {
  margin: 0.35rem 0 0;
  color: var(--red-muted);
  font-size: 0.65rem;
  line-height: 1.2;
}
.fan-close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red-ink);
  font-size: 0.8rem;
}
.fan-cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.fan-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  border: 1px solid #b9a893;
  border-top: 3px solid var(--fan-color);
  border-radius: 16px;
  padding: 0.65rem 0.85rem 0.25rem;
  background: var(--red-surface);
  box-shadow: 0 8px 24px rgb(36 18 7 / 10%);
  pointer-events: auto;
}
.fan-entity-type {
  margin: 0 0 0.25rem;
  color: var(--red-muted);
  font-size: 0.6rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.fan-card h3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  margin: 0;
  color: var(--red-ink);
  font-size: 0.85rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.fan-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  min-height: 44px;
  margin-top: auto;
  color: var(--red-ink);
  font-size: 0.7rem;
  font-weight: 500;
  text-decoration: none;
}
.fan-profile-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.fan-pagination {
  position: absolute;
  bottom: 12px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  background: var(--red-surface);
  box-shadow: 0 6px 20px rgb(36 18 7 / 8%);
  transform: translateX(-50%);
  pointer-events: auto;
}
.fan-pagination button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: var(--red-ink);
  font-size: 0.75rem;
}
.fan-pagination button:hover:not(:disabled) {
  background: var(--red-soft);
}
.fan-pagination button:disabled {
  opacity: 0.4;
}
.fan-pagination span {
  color: var(--red-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}
.map-fan--panel {
  inset: auto 12px 40px;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 76px);
  overflow: hidden;
  border: 1px solid var(--red-border);
  border-radius: 20px;
  background: var(--red-surface);
  box-shadow: 0 12px 32px rgb(36 18 7 / 15%);
  pointer-events: auto;
}
.map-fan--panel .fan-heading {
  position: static;
  max-width: none;
  border: 0;
  border-bottom: 1px solid var(--red-border);
  border-radius: 0;
  box-shadow: none;
}
.map-fan--panel .fan-cards {
  position: static;
  display: grid;
  flex: 1;
  min-height: 0;
  max-height: 220px;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
}
.map-fan--panel .fan-card {
  position: static;
  min-height: 120px;
  border: 0;
  border-bottom: 1px solid var(--red-border);
  border-radius: 0;
  padding: 0.75rem 1rem 0.25rem;
  box-shadow: none;
}
.map-fan--panel .fan-card:last-child {
  border-bottom: 0;
}
.map-fan--panel .fan-pagination {
  position: static;
  justify-content: space-between;
  gap: 0.25rem;
  border: 0;
  border-top: 1px solid var(--red-border);
  border-radius: 0;
  box-shadow: none;
  transform: none;
}
@keyframes fan-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .map-fan {
    animation: none;
  }
}
</style>
