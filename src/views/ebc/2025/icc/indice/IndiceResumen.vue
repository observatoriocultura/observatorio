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
  if (v === null || v === undefined) return '—'
  return Number(v).toFixed(3)
}

const formatVariacion = (v) => {
  if (v === null || v === undefined) return '—'
  return Math.abs(Number(v)).toFixed(3)
}

const barraWidth = (v) => {
  const value = Number(v)
  if (!Number.isFinite(value)) return '0%'
  return `${Math.min(Math.max(value, 0), 1) * 100}%`
}
</script>

<template>
  <div class="indice-resumen">
    <div class="resumen-toolbar mb-4">
      <div>
        <p class="eyebrow mb-1">Resumen ICC</p>
        <h3 class="resumen-title mb-0">Qué mide cada índice y cómo va</h3>
        <p class="resumen-intro mb-0">
          Consulta la definición y el resultado más reciente en escala 0 - 1.
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
          <option :value="null">Bogotá D.C. (Total)</option>
          <option v-for="loc in localidades" :key="loc.cod" :value="loc.cod">
            {{ loc.nombre }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="indiceGeneral && datosActivos"
      class="card-icc-general card-premium mb-4"
      :style="{ '--indice-color': getColor(indiceGeneral.key) }"
    >
      <div class="general-inner">
        <div class="general-icon" aria-hidden="true">
          <i :class="getIcon(indiceGeneral.key)"></i>
        </div>
        <div class="general-heading">
          <div class="general-label">
            {{ indiceGeneral.nombre }}
          </div>
          <div class="general-abrev">{{ indiceGeneral.abreviatura }}</div>
        </div>

        <div class="general-valor">
          {{ formatValor(ultimoValor(indiceGeneral.cod)) }}
        </div>

        <div class="general-scale">
          <span>0.000</span>
          <div class="general-scale-track">
            <div
              class="general-scale-fill"
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
            class="variacion-badge"
            :class="variacion(indiceGeneral.cod) >= 0 ? 'up' : 'down'"
          >
            <i
              :class="
                variacion(indiceGeneral.cod) >= 0
                  ? 'bi bi-arrow-up-short'
                  : 'bi bi-arrow-down-short'
              "
            ></i>
            {{ formatVariacion(variacion(indiceGeneral.cod)) }}
          </span>
          <span class="periodo-label">vs. periodo anterior</span>
        </div>

        <p v-if="indiceGeneral.descripcion" class="general-descripcion mb-0">
          {{ indiceGeneral.descripcion }}
        </p>
      </div>
    </div>

    <div class="subindices-grid">
      <div
        v-for="idx in subIndices"
        :key="idx.cod"
        class="subindice-card card-premium"
        :style="{ '--indice-color': getColor(idx.key) }"
      >
        <div class="subindice-header-row">
          <span class="subindice-icon" aria-hidden="true">
            <i :class="getIcon(idx.key)"></i>
          </span>
          <div class="subindice-heading">
            <span class="subindice-nombre-corto">{{ idx.nombre_corto }}</span>
          </div>
        </div>
        <div class="subindice-nombre">{{ idx.nombre }}</div>
        <div class="subindice-valor-row">
          <span class="subindice-valor">{{ formatValor(ultimoValor(idx.cod)) }}</span>
          <span
            v-if="variacion(idx.cod) !== null"
            class="variacion-mini"
            :class="variacion(idx.cod) >= 0 ? 'up' : 'down'"
          >
            <i
              :class="variacion(idx.cod) >= 0 ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
            ></i>
            {{ formatVariacion(variacion(idx.cod)) }}
          </span>
        </div>
        <div class="subindice-barra-bg">
          <div
            class="subindice-barra-fill"
            :style="{
              width: barraWidth(ultimoValor(idx.cod)),
              backgroundColor: colorBarra(ultimoValor(idx.cod)),
            }"
          ></div>
        </div>
        <p v-if="idx.descripcion" class="subindice-descripcion">
          {{ idx.descripcion }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.indice-resumen {
  animation: fadeSlideIn 0.4s ease-out;
  padding: 0.25rem 0;
}

.resumen-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #edf0f2;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(33, 37, 41, 0.05);
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
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0;
}

.resumen-intro {
  color: #6c757d;
  font-size: 0.86rem;
  margin-top: 0.25rem;
}

.filtro-localidad {
  min-width: min(360px, 100%);
}

.form-label {
  color: #495057;
  font-size: 0.76rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.select-premium {
  border-color: #dfe3e6;
  border-radius: 8px;
  color: #212529;
  font-weight: 600;
}

.select-premium:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.18rem rgba(101, 64, 150, 0.12);
}

.card-icc-general {
  background: #fff;
  border: 1px solid #edf0f2;
  border-left: 6px solid var(--indice-color, var(--color-primary));
  border-radius: 8px;
  color: #212529;
  padding: 1.4rem 1.6rem;
  box-shadow: 0 6px 22px rgba(33, 37, 41, 0.06);
}

.general-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem 1.5rem;
}

.general-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  color: #fff;
  background: var(--indice-color, var(--color-primary));
  border-radius: 8px;
  font-size: 1.5rem;
}

.general-heading {
  min-width: 0;
}

.general-label {
  color: #495057;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.35;
  text-transform: uppercase;
}

.general-abrev {
  color: var(--indice-color, var(--color-primary));
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
  text-transform: uppercase;
}

.general-valor {
  color: #343a40;
  font-size: 3.4rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
  text-align: right;
}

.general-scale {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 700;
  margin-top: 0.6rem;
}

.general-scale-track {
  height: 8px;
  background: #edf0f2;
  border-radius: 4px;
  overflow: hidden;
}

.general-scale-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.general-meta {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.35rem;
  font-size: 0.8rem;
}

.variacion-badge,
.variacion-mini {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  font-weight: 700;
}

.variacion-badge {
  gap: 2px;
  padding: 0.2rem 0.55rem;
  font-size: 0.78rem;
}

.variacion-badge.up,
.variacion-mini.up {
  background: rgba(72, 187, 120, 0.13);
  color: #1f7a43;
}

.variacion-badge.down,
.variacion-mini.down {
  background: rgba(245, 101, 101, 0.13);
  color: #c53030;
}

.periodo-label {
  color: #6c757d;
  font-size: 0.75rem;
}

.general-descripcion {
  grid-column: 1 / -1;
  color: #495057;
  font-size: 0.94rem;
  line-height: 1.6;
  margin-top: 0.35rem;
  padding-top: 0.95rem;
  border-top: 1px solid #edf0f2;
}

.subindices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.subindice-card {
  background: #fff;
  border: 1px solid #edf0f2;
  border-top: 4px solid var(--indice-color, var(--color-primary));
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 1.1rem;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.subindice-card:hover {
  border-color: rgba(33, 37, 41, 0.1);
  border-top-color: var(--indice-color, var(--color-primary));
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(33, 37, 41, 0.07);
}

.subindice-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.subindice-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  color: #fff;
  background: var(--indice-color, var(--color-primary));
  border-radius: 8px;
  font-size: 1rem;
}

.subindice-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 0;
}

.subindice-nombre-corto {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.subindice-nombre {
  color: #343a40;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 0.6rem;
  min-height: 2.35em;
}

.subindice-descripcion {
  color: #5c6972;
  font-size: 0.78rem;
  line-height: 1.45;
  margin: 0.9rem 0 0;
}

.subindice-valor-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.subindice-valor {
  color: #343a40;
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.variacion-mini {
  gap: 1px;
  padding: 0.18rem 0.45rem;
  font-size: 0.72rem;
}

.subindice-barra-bg {
  height: 8px;
  background: #f0f0f4;
  border-radius: 4px;
  overflow: hidden;
}

.subindice-barra-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
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

@media (max-width: 600px) {
  .resumen-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .filtro-localidad {
    min-width: 100%;
  }
  .subindices-grid {
    grid-template-columns: 1fr;
  }
  .general-inner {
    grid-template-columns: 1fr;
  }
  .general-icon {
    width: 46px;
    height: 46px;
  }
  .general-valor {
    font-size: 2.6rem;
    text-align: left;
  }
  .subindice-descripcion,
  .subindice-nombre {
    min-height: 0;
  }
  .general-meta {
    justify-content: flex-start;
  }
  .card-icc-general {
    padding: 1.2rem;
  }
}
</style>
