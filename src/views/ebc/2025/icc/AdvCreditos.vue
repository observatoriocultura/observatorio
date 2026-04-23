<script setup>
import { computed, inject, onMounted, ref } from 'vue'

const codigoMedicion = inject('codigoMedicion')

const creditos = ref([])
const loading = ref(true)
const error = ref('')

const cargarCreditos = async () => {
  try {
    loading.value = true
    error.value = ''

    const baseUrl = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${baseUrl}content/mediciones/${codigoMedicion}/creditos.json`)

    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de creditos.')
    }

    const data = await response.json()
    creditos.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error cargando creditos:', err)
    error.value = 'No fue posible cargar los creditos de esta medicion.'
  } finally {
    loading.value = false
  }
}

const grupos = computed(() => ({
  1: creditos.value.filter((persona) => Number(persona.grupo) === 1),
  2: creditos.value.filter((persona) => Number(persona.grupo) === 2),
}))

onMounted(() => {
  cargarCreditos()
})
</script>

<template>
  <div class="adv-creditos">
    <div v-if="loading" class="p-5 text-center">
      <div class="spinner-grow text-primary mb-3"></div>
      <p class="text-muted mb-0">Cargando creditos...</p>
    </div>

    <div v-else-if="error" class="alert alert-light border m-0">
      {{ error }}
    </div>

    <div v-else class="container">
      <div class="creditos-content">
        <header class="creditos-header">
          <p class="creditos-eyebrow mb-3">Equipo de trabajo</p>
          <p class="creditos-lead mb-0">
            La realización de esta encuesta, sus resultados y análisis fue posible por el trabajo
            del equipo de la Secretaría de Cultura, Recreación y Deporte.
          </p>
          <div class="creditos-divider" aria-hidden="true"></div>
        </header>

        <section class="creditos-grid" aria-label="Equipos participantes">
          <div class="creditos-column">
            <header class="creditos-column__header">
              <h4 class="creditos-column__title mb-0">
                Dirección Observatorio y Gestión del Conocimiento Cultural
              </h4>
            </header>

            <div class="creditos-list">
              <article v-for="persona in grupos[1]" :key="persona.username" class="credito-item">
                <h5 class="credito-item__name mb-2">{{ persona.nombre_mostrar }}</h5>
                <p class="credito-item__meta mb-0">
                  <template v-if="persona.perfil">
                    <b>{{ persona.perfil }}</b>
                    <template v-if="persona.rol_en_encuesta">
                      &middot; {{ persona.rol_en_encuesta }}
                    </template>
                  </template>
                  <template v-else>
                    {{ persona.rol_en_encuesta }}
                  </template>
                </p>
              </article>
            </div>
          </div>

          <div class="creditos-column creditos-column--secondary">
            <header class="creditos-column__header">
              <h4 class="creditos-column__title mb-0">
                Acompañamiento y apoyo - Dirección de Lectura y Bibliotecas
              </h4>
            </header>

            <div class="creditos-list">
              <article v-for="persona in grupos[2]" :key="persona.username" class="credito-item">
                <h5 class="credito-item__name mb-2">{{ persona.nombre_mostrar }}</h5>
                <p class="credito-item__meta mb-0">
                  <template v-if="persona.perfil">
                    <b>{{ persona.perfil }}</b>
                    <template v-if="persona.rol_en_encuesta">
                      &middot; {{ persona.rol_en_encuesta }}
                    </template>
                  </template>
                  <template v-else>
                    {{ persona.rol_en_encuesta }}
                  </template>
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adv-creditos {
  width: 100%;
}

.container {
  max-width: 1180px;
}

.creditos-content {
  padding: 1rem 0 1.5rem;
}

.creditos-header {
  max-width: 880px;
  margin: 0 auto 3.25rem;
  text-align: center;
}

.creditos-eyebrow {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7c6aa6;
}

.creditos-lead {
  font-size: 1.14rem;
  line-height: 1.85;
  color: #32204a;
  font-weight: 500;
}

.creditos-divider {
  width: 96px;
  height: 3px;
  margin: 1.5rem auto 0;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 202, 40, 0.12), #ffca28, rgba(255, 202, 40, 0.12));
}

.creditos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4rem;
  align-items: start;
}

.creditos-column {
  min-width: 0;
}

.creditos-column--secondary {
  position: relative;
}

.creditos-column--secondary::before {
  content: '';
  position: absolute;
  top: 0.4rem;
  bottom: 0;
  left: -2rem;
  width: 1px;
  background: linear-gradient(180deg, rgba(50, 32, 74, 0.16), rgba(50, 32, 74, 0.03));
}

.creditos-column__header {
  margin-bottom: 1.35rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(50, 32, 74, 0.12);
}

.creditos-column__title {
  font-size: 1.28rem;
  font-weight: 800;
  line-height: 1.5;
  color: #5a4a7a;
}

.creditos-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.credito-item {
  padding-bottom: 1.45rem;
  border-bottom: 1px solid rgba(50, 32, 74, 0.08);
}

.credito-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.credito-item__name {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.42;
  letter-spacing: 0.01em;
  color: #32204a;
}

.credito-item__meta {
  font-size: 0.95rem;
  line-height: 1.72;
  color: #5c6972;
}

.credito-item__meta b {
  color: #32204a;
  font-weight: 800;
}

@media (max-width: 991px) {
  .creditos-grid {
    grid-template-columns: 1fr;
    gap: 2.75rem;
  }

  .creditos-column--secondary::before {
    display: none;
  }
}

@media (max-width: 767px) {
  .creditos-content {
    padding-top: 0.5rem;
  }

  .creditos-header {
    margin-bottom: 2.5rem;
  }

  .creditos-lead {
    font-size: 1rem;
    line-height: 1.75;
  }

  .creditos-column__title {
    font-size: 1.1rem;
  }
}
</style>
