<template>
  <section class="profile-details" aria-labelledby="profile-details-title">
    <header class="details-heading">
      <div>
        <p class="details-kicker">Conocimiento y recursos</p>
        <h2 id="profile-details-title">Más sobre este perfil</h2>
      </div>
      <span v-if="!loading && !error" class="details-total" aria-live="polite">
        {{ selectedDetails.length }} {{ selectedDetails.length === 1 ? 'detalle' : 'detalles' }}
      </span>
    </header>

    <p v-if="loading" class="details-message" role="status">Cargando los detalles del perfil…</p>
    <div v-else-if="error" class="details-message" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="details-retry" @click="loadDetails">Reintentar</button>
    </div>
    <p v-else-if="!selectedDetails.length" class="details-message" role="status">
      Aún no hay detalles disponibles para este perfil.
    </p>
    <template v-else>
      <p v-if="hasDrafts" class="details-draft-notice" role="note">
        <i class="bi bi-pencil-square" aria-hidden="true"></i>
        Este demo incluye detalles en borrador, pendientes de revisión.
      </p>
      <div class="details-groups">
        <details
          v-for="(group, index) in groups"
          :key="`${entidadId}:${group.key}`"
          class="detail-group"
          :open="index === 0"
        >
          <summary class="detail-group-heading">
            <span class="detail-group-icon" aria-hidden="true"
              ><i :class="['bi', group.icon]"></i
            ></span>
            <span class="detail-group-label">{{ group.groupLabel }}</span>
            <span class="detail-group-count">{{ group.items.length }}</span>
          </summary>
          <ul class="detail-list">
            <li
              v-for="detail in group.items"
              :key="detail.key"
              class="detail-card"
              :class="{ 'detail-card--wide': detail.displayContent.length > 400 }"
            >
              <div class="detail-labels">
                <span v-if="group.key === 'otros'">{{
                  getRigccDetailTypeLabel(detail.tipo_detalle)
                }}</span>
                <span v-if="detail.estado_publicacion === 'borrador'" class="detail-draft"
                  >Borrador</span
                >
              </div>
              <h3>{{ detail.titulo }}</h3>
              <p v-if="detail.descripcion" class="detail-description">{{ detail.descripcion }}</p>
              <details v-if="detail.displayContent.length > 400" class="detail-expanded-content">
                <summary>Leer contenido completo</summary>
                <p class="detail-content">{{ detail.displayContent }}</p>
              </details>
              <p v-else-if="detail.displayContent" class="detail-content">
                {{ detail.displayContent }}
              </p>
              <a
                v-if="detail.url"
                :href="detail.url"
                class="detail-resource"
                :aria-label="`Ver recurso: ${detail.titulo}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver recurso <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
        </details>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getRigccDetailTypeLabel } from '../../../constants/catalogs/index.js'
import {
  fetchRedObservatoriosDetails,
  getEntityDetailContent,
  getEntityDetails,
  groupEntityDetails,
} from '../../../utils/redObservatoriosDetalles.js'

const props = defineProps({
  entidadId: { type: [String, Number], required: true },
  // La vista pública solo muestra publicados. El demo activa los borradores explícitamente.
  includeDrafts: { type: Boolean, default: false },
})
const details = ref([])
const loading = ref(true)
const error = ref('')
const selectedDetails = computed(() =>
  getEntityDetails(details.value, props.entidadId, { includeDrafts: props.includeDrafts }),
)
const hasDrafts = computed(() =>
  selectedDetails.value.some((detail) => detail.estado_publicacion === 'borrador'),
)
const groups = computed(() =>
  groupEntityDetails(selectedDetails.value).map((group) => ({
    ...group,
    items: group.items.map((detail) => ({
      ...detail,
      displayContent: getEntityDetailContent(detail),
    })),
  })),
)
let requestVersion = 0

async function loadDetails() {
  const version = ++requestVersion
  loading.value = true
  error.value = ''
  try {
    const rows = await fetchRedObservatoriosDetails()
    if (version === requestVersion) details.value = rows
  } catch (loadError) {
    if (version !== requestVersion) return
    console.error('Error cargando los detalles del perfil:', loadError)
    error.value =
      'No se pudieron cargar los detalles. La información principal del perfil sigue disponible.'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

onMounted(loadDetails)
onBeforeUnmount(() => {
  requestVersion++
})
</script>

<style scoped>
.profile-details {
  border-top: 1px solid var(--red-border);
  padding: clamp(1.5rem, 4vw, 3rem);
  background: var(--red-soft);
}
.details-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.details-kicker {
  margin: 0 0 0.65rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.details-heading h2 {
  margin: 0;
  color: var(--red-ink);
  font-size: clamp(1.6rem, 2.4vw, 2rem);
  line-height: 1.15;
}
.details-total {
  flex-shrink: 0;
  color: var(--red-muted);
  font-size: 0.8rem;
}
.details-message {
  margin: 0;
  color: var(--red-muted);
  font-size: 0.9rem;
}
.details-message p {
  margin-bottom: 1rem;
}
.details-retry {
  min-height: 44px;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: var(--red-surface);
  color: var(--red-ink);
  font-size: 0.8rem;
}
.details-draft-notice {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  color: var(--red-muted);
  font-size: 0.8rem;
}
.details-groups {
  display: grid;
  gap: 0.75rem;
}
.detail-group {
  min-width: 0;
  border: 1px solid var(--red-border);
  border-radius: 20px;
  background: var(--red-surface);
}
.detail-group-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 68px;
  border-radius: 20px;
  padding: 0.85rem 1.25rem;
  color: var(--red-ink);
  cursor: pointer;
  list-style: none;
}
.detail-group-heading::-webkit-details-marker {
  display: none;
}
.detail-group-heading::after {
  content: '+';
  flex-shrink: 0;
  margin-left: 0.25rem;
  color: var(--red-muted);
  font-size: 1.2rem;
}
.detail-group[open] > .detail-group-heading::after {
  content: '−';
}
.detail-group[open] > .detail-group-heading {
  border-bottom: 1px solid var(--red-border);
  border-radius: 20px 20px 0 0;
}
.detail-group-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--profile-country-color, var(--red-background));
}
.detail-group-label {
  flex: 1;
  font-size: 0.95rem;
}
.detail-group-count {
  color: var(--red-muted);
  font-size: 0.75rem;
}
.detail-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 1rem;
  list-style: none;
}
.detail-card {
  min-width: 0;
  border: 1px solid var(--red-border);
  border-radius: 14px;
  padding: 1.25rem;
  overflow-wrap: anywhere;
}
.detail-card--wide,
.detail-card:only-child {
  grid-column: 1 / -1;
}
.detail-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: var(--red-muted);
  font-size: 0.65rem;
}
.detail-labels:empty {
  display: none;
}
.detail-draft {
  margin-bottom: 0.65rem;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  background: var(--red-soft);
}
.detail-card h3 {
  margin: 0;
  color: var(--red-ink);
  font-size: 1.05rem;
  line-height: 1.4;
}
.detail-description,
.detail-content {
  margin: 0.75rem 0 0;
  color: var(--red-muted);
  font-size: 0.85rem;
  line-height: 1.75;
  white-space: pre-line;
}
.detail-expanded-content {
  margin-top: 0.75rem;
}
.detail-expanded-content > summary {
  min-height: 36px;
  padding: 0.25rem 0;
  color: var(--red-ink);
  font-size: 0.8rem;
  cursor: pointer;
}
.detail-resource {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  margin-top: 0.75rem;
  color: var(--red-ink);
  font-size: 0.8rem;
  text-decoration: none;
}
.detail-resource:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
@media (max-width: 600px) {
  .details-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-list {
    grid-template-columns: 1fr;
    padding: 0.75rem;
  }
  .detail-group-heading {
    gap: 0.6rem;
    padding: 0.85rem;
  }
  .detail-card {
    padding: 1rem;
  }
}
</style>
