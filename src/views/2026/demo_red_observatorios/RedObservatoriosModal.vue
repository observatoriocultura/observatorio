<template>
  <Teleport to="body">
    <div
      ref="modalElement"
      class="modal fade red-observatorios-modal"
      tabindex="-1"
      aria-labelledby="red-observatorios-modal-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div v-if="entidad" class="modal-content red-observatorios-modal-content">
          <div class="modal-header red-observatorios-modal-header">
            <div class="modal-entity-heading">
              <div>
                <div class="modal-country-line">
                  <span class="modal-country-flag-slot">
                    <img
                      v-if="countryFlagUrl(entidad.pais_ubicacion_principal)"
                      class="modal-country-flag"
                      :src="countryFlagUrl(entidad.pais_ubicacion_principal)"
                      alt=""
                      aria-hidden="true"
                    />
                    <i v-else class="bi bi-geo-alt" aria-hidden="true"></i>
                  </span>
                  <p class="modal-country">
                    {{ countryName(entidad.pais_ubicacion_principal) }}
                  </p>
                </div>
                <h2 id="red-observatorios-modal-title">{{ entidad.nombre_entidad }}</h2>
              </div>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar detalle de la entidad"
            ></button>
          </div>

          <div class="modal-body red-observatorios-modal-body">
            <section class="modal-purpose" aria-labelledby="modal-purpose-title">
              <p class="modal-section-kicker">Propósito</p>
              <h3 id="modal-purpose-title">Qué hace esta entidad</h3>
              <p>{{ entidad.proposito_principal }}</p>
            </section>

            <dl class="modal-facts">
              <div>
                <dt>Naturaleza institucional</dt>
                <dd>{{ entidad.naturaleza_institucional }}</dd>
              </div>
              <div>
                <dt>Escala territorial</dt>
                <dd>{{ entidad.escala_territorial_trabajo }}</dd>
              </div>
              <div>
                <dt>Inicio de actividades</dt>
                <dd>{{ entidad.anio_inicio_actividades }}</dd>
              </div>
            </dl>

            <section
              v-if="entidad.tema_prioritario_accion_investigacion"
              class="modal-section"
              aria-labelledby="modal-topics-title"
            >
              <p class="modal-section-kicker">Temas</p>
              <h3 id="modal-topics-title">Áreas prioritarias</h3>
              <div class="modal-topics">
                <span
                  v-for="tema in getTopics(entidad.tema_prioritario_accion_investigacion)"
                  :key="tema"
                  class="modal-topic"
                >
                  {{ tema }}
                </span>
              </div>
            </section>

            <section
              v-if="entidad.mediciones_representativas?.length"
              class="modal-section"
              aria-labelledby="modal-measurements-title"
            >
              <p class="modal-section-kicker">Producción de conocimiento</p>
              <h3 id="modal-measurements-title">Mediciones representativas</h3>
              <div class="modal-measurements">
                <article
                  v-for="medicion in entidad.mediciones_representativas"
                  :key="`${entidad.id}-${medicion.nombre}`"
                  class="modal-measurement"
                >
                  <h4>{{ medicion.nombre }}</h4>
                  <p>{{ medicion.tema_principal }}</p>
                  <span v-if="medicion.periodicidad">{{ medicion.periodicidad }}</span>
                </article>
              </div>
            </section>

            <div class="modal-two-columns">
              <section
                v-if="entidad.experiencia_presentable"
                class="modal-section modal-section-compact"
                aria-labelledby="modal-experience-title"
              >
                <p class="modal-section-kicker">Experiencia</p>
                <h3 id="modal-experience-title">Qué puede compartir</h3>
                <p>{{ entidad.experiencia_presentable }}</p>
              </section>

              <section
                v-if="entidad.desafio_principal_conocimiento"
                class="modal-section modal-section-compact"
                aria-labelledby="modal-challenge-title"
              >
                <p class="modal-section-kicker">Desafío</p>
                <h3 id="modal-challenge-title">Reto de conocimiento</h3>
                <p>{{ entidad.desafio_principal_conocimiento }}</p>
              </section>
            </div>

            <section
              v-if="entidad.iniciativas_recomendadas?.length"
              class="modal-section"
              aria-labelledby="modal-related-title"
            >
              <p class="modal-section-kicker">Conexiones sugeridas</p>
              <h3 id="modal-related-title">Iniciativas relacionadas</h3>
              <ul class="modal-related-list">
                <li
                  v-for="iniciativa in entidad.iniciativas_recomendadas"
                  :key="`${entidad.id}-${iniciativa.nombre}`"
                >
                  <span>
                    <strong>{{ iniciativa.nombre }}</strong>
                    <small>{{ iniciativa.pais }}</small>
                  </span>
                  <a
                    v-if="iniciativa.sitio_web"
                    :href="iniciativa.sitio_web"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visitar iniciativa relacionada"
                  >
                    <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
                  </a>
                </li>
              </ul>
            </section>
          </div>

          <div class="modal-footer red-observatorios-modal-footer">
            <a
              v-if="entidad.sitio_web"
              :href="entidad.sitio_web"
              class="modal-website-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar sitio web
              <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
            </a>
            <button type="button" class="btn modal-close-button" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Modal } from 'bootstrap'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  entidad: {
    type: Object,
    default: null,
  },
  countryName: {
    type: Function,
    required: true,
  },
  countryFlagUrl: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['close'])

const modalElement = ref(null)
let modalInstance = null

const getTopics = (topics) => {
  return String(topics)
    .split(';')
    .map((topic) => topic.trim())
    .filter(Boolean)
}

const handleModalHidden = () => {
  if (props.entidad) {
    emit('close')
  }
}

onMounted(() => {
  modalInstance = Modal.getOrCreateInstance(modalElement.value, {
    backdrop: true,
    keyboard: true,
  })
  modalElement.value.addEventListener('hidden.bs.modal', handleModalHidden)
})

watch(
  () => props.entidad,
  async (entidad) => {
    await nextTick()

    if (!modalInstance) return

    if (entidad) {
      modalInstance.show()
    } else {
      modalInstance.hide()
    }
  },
)

onBeforeUnmount(() => {
  modalElement.value?.removeEventListener('hidden.bs.modal', handleModalHidden)
  modalInstance?.dispose()
})
</script>

<style scoped>
.red-observatorios-modal-content {
  overflow: hidden;
  border: 0;
  border-radius: 18px;
  box-shadow: 0 1.5rem 4rem rgba(24, 35, 43, 0.18);
}

.red-observatorios-modal-header {
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid #edf0f2;
  padding: clamp(1.2rem, 3vw, 1.75rem);
}

.modal-entity-heading {
  min-width: 0;
}

.modal-country-line {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.modal-country-flag-slot {
  display: inline-flex;
  width: 24px;
  min-width: 24px;
  height: 18px;
  align-items: center;
  justify-content: center;
}

.modal-country-flag-slot i {
  color: var(--red-purple, #654096);
  font-size: 1rem;
}

.modal-country-flag {
  display: block;
  width: 24px;
  height: auto;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(24, 35, 43, 0.1);
}

.modal-country {
  margin: 0;
  color: var(--red-purple, #654096);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.modal-entity-heading h2 {
  margin: 0;
  color: var(--red-purple-dark, #32204a);
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  line-height: 1.15;
}

.red-observatorios-modal-body {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1.2rem, 3vw, 1.75rem);
}

.modal-purpose {
  padding: 0;
}

.modal-section-kicker {
  margin: 0 0 0.35rem;
  color: var(--red-purple, #654096);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.modal-purpose h3,
.modal-section h3 {
  margin: 0 0 0.55rem;
  color: var(--red-ink, #18232b);
  font-size: 1.05rem;
}

.modal-purpose p:last-child,
.modal-section p:last-child {
  margin: 0;
  color: var(--red-muted, #5c6871);
  font-size: 0.9rem;
  line-height: 1.6;
}

.modal-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin: 0;
}

.modal-facts div {
  padding-top: 0.15rem;
}

.modal-facts dt {
  margin-bottom: 0.2rem;
  color: #7a858c;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.modal-facts dd {
  margin: 0;
  color: var(--red-ink, #18232b);
  font-size: 0.86rem;
  line-height: 1.4;
}

.modal-section {
  min-width: 0;
}

.modal-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.modal-topic {
  border-radius: 999px;
  background: #f0ebf7;
  padding: 0.35rem 0.6rem;
  color: var(--red-purple-dark, #32204a);
  font-size: 0.78rem;
  line-height: 1.25;
}

.modal-measurements {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.modal-measurement {
  padding: 0.15rem 0;
}

.modal-measurement h4 {
  margin: 0 0 0.35rem;
  color: var(--red-ink, #18232b);
  font-size: 0.88rem;
  line-height: 1.35;
}

.modal-measurement p {
  margin: 0 0 0.55rem;
  color: var(--red-muted, #5c6871);
  font-size: 0.78rem;
  line-height: 1.4;
}

.modal-measurement span {
  display: inline-block;
  color: var(--red-purple, #654096);
  font-size: 0.72rem;
  font-weight: 800;
}

.modal-two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.modal-section-compact {
  padding-top: 0;
}

.modal-related-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.modal-related-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.2rem 0;
}

.modal-related-list strong,
.modal-related-list small {
  display: block;
}

.modal-related-list strong {
  color: var(--red-ink, #18232b);
  font-size: 0.84rem;
  line-height: 1.35;
}

.modal-related-list small {
  margin-top: 0.15rem;
  color: var(--red-muted, #5c6871);
  font-size: 0.76rem;
}

.modal-related-list a,
.modal-website-link {
  color: var(--red-purple, #654096);
  font-weight: 800;
  text-decoration: none;
}

.modal-related-list a:hover,
.modal-related-list a:focus,
.modal-website-link:hover,
.modal-website-link:focus {
  color: var(--red-purple-dark, #32204a);
}

.red-observatorios-modal-footer {
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #edf0f2;
  padding: 1rem clamp(1.2rem, 3vw, 1.75rem);
}

.modal-close-button {
  border: 1px solid #d9dfe3;
  border-radius: 8px;
  color: var(--red-ink, #18232b);
  font-size: 0.85rem;
  font-weight: 700;
}

.modal-close-button:hover,
.modal-close-button:focus {
  border-color: var(--red-purple, #654096);
  background: #f0ebf7;
  color: var(--red-purple-dark, #32204a);
}

@media (max-width: 640px) {
  .modal-facts,
  .modal-measurements,
  .modal-two-columns {
    grid-template-columns: 1fr;
  }

  .red-observatorios-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .modal-close-button {
    width: 100%;
  }
}
</style>
