<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  datosPorLocalidad: { type: Array, required: true },
  indices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  numPeriodos: { type: Number, required: true },
})

const localidadSeleccionada = ref(null)

/** Sub-indices (excluye el indice general num=0, key='indice') */
const subIndices = computed(() => props.indices.filter((i) => i.key !== 'indice'))

/** Indice general (key='indice', num=0) */
const indiceGeneral = computed(() => props.indices.find((i) => i.key === 'indice'))

/** Datos de la localidad activa (o Bogota D.C. si no hay seleccion) */
const datosActivos = computed(() => {
  const cod = localidadSeleccionada.value
  if (cod !== null) {
    return props.datosPorLocalidad.find((d) => d.localidad_cod === cod) || null
  }
  return props.datosPorLocalidad.find((d) => d.localidad_cod === 22) || null
})

const localidadActivaNombre = computed(() => {
  if (localidadSeleccionada.value === null) return 'Bogota D.C. (Total)'
  return (
    props.localidades.find((loc) => Number(loc.cod) === Number(localidadSeleccionada.value))
      ?.nombre || 'Localidad'
  )
})

/** Valor del ultimo periodo para un indice dado (usa cod = indice_cod de icc.json) */
const ultimoValor = (indice_cod) => {
  if (!datosActivos.value) return null
  const vals = datosActivos.value.indices[indice_cod]
  return vals ? vals[vals.length - 1] : null
}

/** Variacion respecto al periodo anterior */
const variacion = (indice_cod) => {
  if (!datosActivos.value) return null
  const vals = datosActivos.value.indices[indice_cod]
  if (!vals || vals.length < 2) return null
  return vals[vals.length - 1] - vals[vals.length - 2]
}

/** Color de barra segun el valor (0-1) */
const colorBarra = (valor) => {
  if (valor === null || valor === undefined) return '#e2e8f0'
  if (valor >= 0.6) return '#48bb78'
  if (valor >= 0.45) return '#ecc94b'
  return '#f56565'
}

const nivelIndice = (valor) => {
  if (valor === null || valor === undefined) return 'Sin dato'
  if (valor >= 0.6) return 'Alto'
  if (valor >= 0.45) return 'Medio'
  return 'Bajo'
}

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

const formatValor = (v) => {
  if (v === null || v === undefined) return '--'
  return Number(v).toFixed(3)
}

const formatVariacion = (v) => {
  if (v === null || v === undefined) return '--'
  return Math.abs(Number(v)).toFixed(3)
}

const barraWidth = (v) => {
  const value = Number(v)
  if (!Number.isFinite(value)) return '0%'
  return `${Math.min(Math.max(value, 0), 1) * 100}%`
}
</script>

<template>
  <div class="indice-resumen container">
    <section class="resumen-toolbar card-premium">
      <div class="toolbar-copy">
        <p class="eyebrow mb-1">Resumen ICC</p>
        <h3 class="resumen-title mb-0">Resultado reciente por indice</h3>
        <p class="resumen-intro mb-0">
          Consulta el valor mas reciente en escala 0 - 1 y su cambio frente al periodo anterior.
        </p>
      </div>

      <div class="filtro-localidad">
        <label class="form-label" for="localidad-resumen">Localidad</label>
        <select
          id="localidad-resumen"
          v-model="localidadSeleccionada"
          class="form-select select-premium"
          :class="{ 'active-filter': localidadSeleccionada !== null }"
        >
          <option :value="null">Bogota D.C. (Total)</option>
          <option v-for="loc in localidades" :key="loc.cod" :value="loc.cod">
            {{ loc.nombre }}
          </option>
        </select>
      </div>
    </section>

    <section
      v-if="indiceGeneral && datosActivos"
      class="general-card card-premium"
      :style="{ '--indice-color': getColor(indiceGeneral.key) }"
    >
      <div class="general-main">
        <div class="general-icon" aria-hidden="true">
          <i :class="getIcon(indiceGeneral.key)"></i>
        </div>

        <div class="general-heading">
          <p class="general-context mb-1">{{ localidadActivaNombre }}</p>
          <h4 class="general-title mb-0">{{ indiceGeneral.nombre }}</h4>
          <span v-if="indiceGeneral.abreviatura" class="general-code">
            {{ indiceGeneral.abreviatura }}
          </span>
        </div>
      </div>

      <div class="general-score">
        <span class="score-label">Valor</span>
        <strong>{{ formatValor(ultimoValor(indiceGeneral.cod)) }}</strong>
        <span
          class="score-status"
          :style="{ '--status-color': colorBarra(ultimoValor(indiceGeneral.cod)) }"
        >
          {{ nivelIndice(ultimoValor(indiceGeneral.cod)) }}
        </span>
      </div>

      <div class="general-scale">
        <span>0.000</span>
        <div class="scale-track">
          <div
            class="scale-fill"
            :style="{
              width: barraWidth(ultimoValor(indiceGeneral.cod)),
              backgroundColor: colorBarra(ultimoValor(indiceGeneral.cod)),
            }"
          ></div>
        </div>
        <span>1.000</span>
      </div>

      <div class="general-meta">
        <span
          v-if="variacion(indiceGeneral.cod) !== null"
          class="variation-pill"
          :class="variacion(indiceGeneral.cod) >= 0 ? 'up' : 'down'"
        >
          <i
            :class="
              variacion(indiceGeneral.cod) >= 0 ? 'bi bi-arrow-up-short' : 'bi bi-arrow-down-short'
            "
          ></i>
          {{ formatVariacion(variacion(indiceGeneral.cod)) }}
        </span>
        <span class="periodo-label">vs. periodo anterior</span>
      </div>

      <p v-if="indiceGeneral.descripcion" class="general-description mb-0">
        {{ indiceGeneral.descripcion }}
      </p>
    </section>

    <section class="subindices-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow mb-1">Dimensiones</p>
          <h4 class="section-title mb-0">Lectura por subindice</h4>
        </div>
        <div class="scale-legend" aria-label="Rangos de lectura">
          <span><i class="legend-dot high"></i>Alto</span>
          <span><i class="legend-dot medium"></i>Medio</span>
          <span><i class="legend-dot low"></i>Bajo</span>
        </div>
      </div>

      <div class="subindices-grid">
        <article
          v-for="idx in subIndices"
          :key="idx.cod"
          class="subindice-card card-premium"
          :style="{ '--indice-color': getColor(idx.key) }"
        >
          <div class="subindice-accent" aria-hidden="true"></div>

          <div class="subindice-content">
            <div class="subindice-header">
              <span class="subindice-icon" aria-hidden="true">
                <i :class="getIcon(idx.key)"></i>
              </span>
              <div class="subindice-title-group">
                <span class="subindice-short">{{ idx.nombre_corto }}</span>
                <h5 class="subindice-title mb-0">{{ idx.nombre }}</h5>
              </div>
            </div>

            <div class="subindice-value-row">
              <div>
                <span class="value-label">Valor</span>
                <strong class="subindice-value">{{ formatValor(ultimoValor(idx.cod)) }}</strong>
              </div>
              <span
                v-if="variacion(idx.cod) !== null"
                class="variation-pill mini"
                :class="variacion(idx.cod) >= 0 ? 'up' : 'down'"
              >
                <i
                  :class="variacion(idx.cod) >= 0 ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                ></i>
                {{ formatVariacion(variacion(idx.cod)) }}
              </span>
            </div>

            <div class="subindice-scale">
              <div class="scale-track">
                <div
                  class="scale-fill"
                  :style="{
                    width: barraWidth(ultimoValor(idx.cod)),
                    backgroundColor: colorBarra(ultimoValor(idx.cod)),
                  }"
                ></div>
              </div>
              <span
                class="subindice-status"
                :style="{ '--status-color': colorBarra(ultimoValor(idx.cod)) }"
              >
                {{ nivelIndice(ultimoValor(idx.cod)) }}
              </span>
            </div>

            <p v-if="idx.descripcion" class="subindice-description mb-0">
              {{ idx.descripcion }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.indice-resumen {
  padding: 0.25rem 0 1rem;
  animation: fadeSlideIn 0.4s ease-out;
}

.resumen-toolbar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1rem;
  background: #fff;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(33, 37, 41, 0.05);
}

.toolbar-copy {
  min-width: 0;
}

.eyebrow {
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.resumen-title {
  color: #212529;
  font-size: 1.08rem;
  font-weight: 850;
  letter-spacing: 0;
}

.resumen-intro {
  max-width: 640px;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.86rem;
  line-height: 1.45;
}

.filtro-localidad {
  flex: 0 0 min(360px, 42%);
  min-width: 260px;
}

.form-label {
  margin-bottom: 0.25rem;
  color: #495057;
  font-size: 0.76rem;
  font-weight: 800;
}

.select-premium {
  color: #212529;
  font-weight: 650;
  border-color: #dfe3e6;
  border-radius: 8px;
}

.select-premium:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.18rem rgba(101, 64, 150, 0.12);
}

.general-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem 1.25rem;
  margin-top: 1rem;
  overflow: hidden;
  padding: 1.25rem;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--indice-color) 7%, transparent), transparent),
    #fff;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(33, 37, 41, 0.06);
}

.general-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  content: '';
  background: var(--indice-color);
}

.general-main {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  min-width: 0;
}

.general-icon {
  display: grid;
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  place-items: center;
  color: #fff;
  font-size: 1.55rem;
  background: var(--indice-color);
  border-radius: 8px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--indice-color) 24%, transparent);
}

.general-heading {
  min-width: 0;
}

.general-context {
  color: #6c757d;
  font-size: 0.78rem;
  font-weight: 750;
}

.general-title {
  color: #212529;
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  font-weight: 850;
  letter-spacing: 0;
}

.general-code {
  display: inline-block;
  margin-top: 0.25rem;
  color: var(--indice-color);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.general-score {
  display: grid;
  justify-items: end;
  align-content: start;
  min-width: 132px;
}

.score-label,
.value-label {
  display: block;
  color: #6c757d;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.general-score strong {
  color: #212529;
  font-size: clamp(2.8rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: 0;
}

.score-status,
.subindice-status {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0.15rem 0.55rem;
  color: color-mix(in srgb, var(--status-color) 70%, #212529);
  font-size: 0.72rem;
  font-weight: 850;
  background: color-mix(in srgb, var(--status-color) 13%, #fff);
  border: 1px solid color-mix(in srgb, var(--status-color) 30%, #eef0f2);
  border-radius: 999px;
}

.general-scale {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: center;
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 750;
}

.scale-track {
  height: 8px;
  overflow: hidden;
  background: #edf0f2;
  border-radius: 999px;
}

.scale-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.general-meta {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  margin-top: -0.25rem;
}

.variation-pill {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 800;
  border-radius: 999px;
}

.variation-pill.up {
  color: #1f7a43;
  background: rgba(72, 187, 120, 0.13);
}

.variation-pill.down {
  color: #c53030;
  background: rgba(245, 101, 101, 0.13);
}

.periodo-label {
  color: #6c757d;
  font-size: 0.76rem;
  font-weight: 650;
}

.general-description {
  grid-column: 1 / -1;
  max-width: 900px;
  padding-top: 1rem;
  color: #495057;
  font-size: 0.93rem;
  line-height: 1.6;
  border-top: 1px solid #edf0f2;
}

.subindices-section {
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
  font-weight: 850;
  letter-spacing: 0;
}

.scale-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: flex-end;
  color: #6c757d;
  font-size: 0.76rem;
  font-weight: 750;
}

.scale-legend span {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
}

.legend-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.legend-dot.high {
  background: #48bb78;
}

.legend-dot.medium {
  background: #ecc94b;
}

.legend-dot.low {
  background: #f56565;
}

.subindices-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.subindice-card {
  display: grid;
  grid-template-columns: 5px minmax(0, 1fr);
  min-height: 236px;
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

.subindice-card:hover {
  border-color: color-mix(in srgb, var(--indice-color) 22%, #edf0f2);
  box-shadow: 0 10px 24px rgba(33, 37, 41, 0.08);
  transform: translateY(-2px);
}

.subindice-accent {
  background: var(--indice-color);
}

.subindice-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-width: 0;
  padding: 1rem;
}

.subindice-header {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.subindice-icon {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  color: var(--indice-color);
  font-size: 1.22rem;
  background: color-mix(in srgb, var(--indice-color) 11%, #fff);
  border-radius: 8px;
}

.subindice-title-group {
  min-width: 0;
}

.subindice-short {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--indice-color);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.subindice-title {
  color: #212529;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.subindice-value-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  justify-content: space-between;
}

.subindice-value {
  display: block;
  color: #212529;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.variation-pill.mini {
  min-height: 26px;
  padding: 0.18rem 0.48rem;
  font-size: 0.72rem;
}

.subindice-scale {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.65rem;
  align-items: center;
}

.subindice-description {
  color: #5c6972;
  font-size: 0.82rem;
  line-height: 1.55;
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
  .resumen-toolbar,
  .section-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .filtro-localidad {
    flex-basis: auto;
    min-width: 100%;
  }

  .general-card {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .general-score {
    justify-items: start;
  }

  .general-main {
    flex-direction: column;
  }

  .general-icon {
    width: 48px;
    height: 48px;
    font-size: 1.35rem;
  }

  .general-meta {
    justify-content: flex-start;
  }

  .scale-legend {
    justify-content: flex-start;
  }

  .subindices-grid {
    grid-template-columns: 1fr;
  }

  .subindice-card {
    min-height: 0;
  }
}
</style>
