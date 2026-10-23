<template>
  <Teleport to="body">
    <div
      ref="modalElement"
      class="modal fade red-observatorios-modal"
      tabindex="-1"
      :aria-labelledby="titleId"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div v-if="entidad" class="modal-content red-observatorios-modal-content">
          <div class="modal-header red-observatorios-modal-header">
            <div class="modal-entity-heading">
              <div class="modal-country-line">
                <span class="modal-country-flag-slot">
                  <img
                    v-if="countryFlagUrl(entidad.pais_territorio)"
                    class="modal-country-flag"
                    :src="countryFlagUrl(entidad.pais_territorio)"
                    alt=""
                    aria-hidden="true"
                  />
                  <i v-else class="bi bi-geo-alt" aria-hidden="true"></i>
                </span>
                <p class="modal-country">{{ countryName(entidad.pais_territorio) }}</p>
              </div>
              <h2 :id="titleId">{{ entidad.nombre }}</h2>
              <p v-if="entidad.subtitulo" class="modal-subtitle">{{ entidad.subtitulo }}</p>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Cerrar detalle de la entidad"
            ></button>
          </div>

          <div class="modal-body red-observatorios-modal-body">
            <img
              v-if="entidad.logo_url && !logoFailed"
              :src="entidad.logo_url"
              class="modal-logo"
              alt=""
              @error="logoFailed = true"
            />
            <section
              v-if="entidad.descripcion"
              class="modal-purpose"
              aria-labelledby="modal-purpose-title"
            >
              <p class="modal-section-kicker">Descripción</p>
              <h3 id="modal-purpose-title">Su mirada sobre la cultura</h3>
              <p class="modal-description">{{ entidad.descripcion }}</p>
            </section>

            <dl class="modal-facts">
              <div>
                <dt>Tipo de actor</dt>
                <dd>{{ getEntityFieldLabel('tipo_actor', entidad.tipo_actor) }}</dd>
              </div>
              <div>
                <dt>Tipo de entidad</dt>
                <dd>{{ getEntityFieldLabel('tipo_entidad', entidad.tipo_entidad) }}</dd>
              </div>
              <div>
                <dt>Naturaleza institucional</dt>
                <dd>
                  {{
                    getEntityFieldLabel(
                      'naturaleza_institucional',
                      entidad.naturaleza_institucional,
                    )
                  }}
                </dd>
              </div>
              <div>
                <dt>Escala territorial</dt>
                <dd>{{ getEntityFieldLabel('escala_territorial', entidad.escala_territorial) }}</dd>
              </div>
              <div>
                <dt>País o territorio</dt>
                <dd>{{ countryName(entidad.pais_territorio) }}</dd>
              </div>
              <div v-if="entidad.ciudad">
                <dt>Ciudad</dt>
                <dd>{{ entidad.ciudad }}</dd>
              </div>
            </dl>
          </div>

          <div class="modal-footer red-observatorios-modal-footer">
            <a
              v-if="entidad.url_principal"
              :href="entidad.url_principal"
              class="modal-website-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar sitio o perfil
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
import { getEntityFieldLabel } from '../../../utils/redObservatorios.js'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  titleId: {
    type: String,
    default: 'red-observatorios-modal-title',
  },
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
const logoFailed = ref(false)
let modalInstance = null
let triggerElement = null

const handleModalHidden = () => {
  if (props.entidad) {
    emit('close')
  }
  if (triggerElement?.isConnected) {
    triggerElement.focus({ preventScroll: true })
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
    logoFailed.value = false
    await nextTick()

    if (!modalInstance) return

    if (entidad) {
      triggerElement = document.activeElement
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
  border-radius: 30px;
  background: var(--red-surface);
  box-shadow: 0 24px 80px rgb(36 18 7 / 15%);
}
.red-observatorios-modal-header {
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--red-border);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  background: var(--red-background);
}
.modal-entity-heading {
  min-width: 0;
}
.modal-country-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--red-surface);
}
.modal-country-flag-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
}
.modal-country-flag {
  width: 20px;
  height: auto;
  border-radius: 2px;
}
.modal-country {
  margin: 0;
  color: var(--red-ink);
  font-size: 0.75rem;
}
.modal-entity-heading h2 {
  margin: 0;
  color: var(--red-ink);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}
.modal-subtitle {
  margin: 0.85rem 0 0;
  color: var(--red-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.red-observatorios-modal-header .btn-close {
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
  margin: 0;
  padding: 10px;
  border-radius: 50%;
  background-color: var(--red-surface);
  opacity: 0.8;
}
.red-observatorios-modal-body {
  display: grid;
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
}
.modal-section-kicker {
  margin: 0 0 0.65rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.modal-purpose h3 {
  margin: 0 0 0.85rem;
  color: var(--red-ink);
  font-size: 1.6rem;
}
.modal-description {
  margin: 0;
  color: var(--red-muted);
  font-size: 0.95rem;
  line-height: 1.8;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.modal-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin: 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--red-border);
}
.modal-facts dt {
  margin: 0 0 0.35rem;
  color: var(--red-muted);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.modal-facts dd {
  margin: 0;
  color: var(--red-ink);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.modal-logo {
  width: 120px;
  max-width: 100%;
  height: 100px;
  object-fit: contain;
  object-position: left center;
}
.red-observatorios-modal-footer {
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--red-border);
  padding: 1.25rem clamp(1.5rem, 4vw, 2.5rem);
}
.modal-website-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  gap: 0.75rem;
  color: var(--red-ink);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
}
.modal-website-link:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
}
.modal-close-button {
  min-height: 44px;
  padding: 0.6rem 1.25rem;
  border: 1px solid var(--red-border);
  border-radius: 999px;
  color: var(--red-ink);
  font-size: 0.8rem;
}
.modal-close-button:hover {
  border-color: var(--red-ink);
  background: var(--red-ink);
  color: var(--red-surface);
}
@media (max-width: 520px) {
  .modal-facts {
    grid-template-columns: 1fr;
  }
  .red-observatorios-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .modal-website-link {
    justify-content: center;
  }
}
</style>
