<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  datosPorLocalidad: { type: Array, required: true },
  indices: { type: Array, required: true },
  localidades: { type: Array, required: true },
  numPeriodos: { type: Number, required: true },
})

const localidadSeleccionada = ref(null)

/** Sub-índices (excluye el índice general num=0, key='indice') */
const subIndices = computed(() => props.indices.filter((i) => i.key !== 'indice'))

/** Índice general (key='indice', num=0) */
const indiceGeneral = computed(() => props.indices.find((i) => i.key === 'indice'))

/** Datos de la localidad activa (o Bogotá D.C. si no hay selección) */
const datosActivos = computed(() => {
  const cod = localidadSeleccionada.value
  if (cod !== null) {
    return props.datosPorLocalidad.find((d) => d.localidad_cod === cod) || null
  }
  // Bogotá D.C. = cod 22
  return props.datosPorLocalidad.find((d) => d.localidad_cod === 22) || null
})

/** Valor del último periodo para un índice dado (usa cod = indice_cod de icc.json) */
const ultimoValor = (indice_cod) => {
  if (!datosActivos.value) return null
  const vals = datosActivos.value.indices[indice_cod]
  return vals ? vals[vals.length - 1] : null
}

/** Variación respecto al periodo anterior */
const variacion = (indice_cod) => {
  if (!datosActivos.value) return null
  const vals = datosActivos.value.indices[indice_cod]
  if (!vals || vals.length < 2) return null
  return vals[vals.length - 1] - vals[vals.length - 2]
}

/** Color de barra según el valor (0-1) */
const colorBarra = (valor) => {
  if (valor === null) return '#e2e8f0'
  if (valor >= 0.6) return '#48bb78'
  if (valor >= 0.45) return '#ecc94b'
  return '#f56565'
}

/** Formato porcentual */
const formatValor = (v) => {
  if (v === null || v === undefined) return '—'
  return (v * 100).toFixed(1)
}
</script>

<template>
  <div class="indice-resumen">
    <!-- Filtro de localidad -->
    <div class="filtro-localidad mb-4">
      <select
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

    <!-- Tarjeta del índice general -->
    <div v-if="indiceGeneral && datosActivos" class="card-icc-general card-premium mb-4">
      <div class="general-inner">
        <div class="general-label">
          <i class="bi bi-award me-2"></i>{{ indiceGeneral.nombre }}
        </div>
        <div class="general-abrev">{{ indiceGeneral.abreviatura }}</div>
        <div class="general-valor">
          {{ formatValor(ultimoValor(indiceGeneral.cod)) }}
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
            {{ (variacion(indiceGeneral.cod) * 100).toFixed(1) }} pp
          </span>
          <span class="periodo-label">vs. periodo anterior</span>
        </div>
      </div>
    </div>

    <!-- Grid de sub-índices -->
    <div class="subindices-grid">
      <div v-for="idx in subIndices" :key="idx.cod" class="subindice-card card-premium">
        <div class="subindice-header-row">
          <span class="subindice-abrev">{{ idx.abreviatura }}</span>
          <span class="subindice-nombre-corto">{{ idx.nombre_corto }}</span>
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
            {{ Math.abs(variacion(idx.cod) * 100).toFixed(1) }}
          </span>
        </div>
        <div class="subindice-barra-bg">
          <div
            class="subindice-barra-fill"
            :style="{
              width: (ultimoValor(idx.cod) || 0) * 100 + '%',
              backgroundColor: colorBarra(ultimoValor(idx.cod)),
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.indice-resumen {
  animation: fadeSlideIn 0.4s ease-out;
}

.filtro-localidad {
  max-width: 400px;
}

/* ── Tarjeta índice general ── */
.card-icc-general {
  background: linear-gradient(135deg, #32204a 0%, #4a3068 100%);
  color: #fff;
  border-radius: var(--radius-premium);
  padding: 1.5rem 2rem;
}

.general-inner {
  text-align: center;
}

.general-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.85;
  margin-bottom: 0.25rem;
}

.general-abrev {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.general-valor {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.general-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.variacion-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.78rem;
}

.variacion-badge.up {
  background: rgba(72, 187, 120, 0.25);
  color: #9ae6b4;
}

.variacion-badge.down {
  background: rgba(245, 101, 101, 0.25);
  color: #feb2b2;
}

.periodo-label {
  opacity: 0.6;
  font-size: 0.75rem;
}

/* ── Grid de sub-índices ── */
.subindices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.subindice-card {
  padding: 1.2rem 1.3rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.subindice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(50, 32, 74, 0.08);
}

.subindice-header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.subindice-abrev {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #fff;
  background: var(--color-primary);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.subindice-nombre-corto {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.subindice-nombre {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.6rem;
  line-height: 1.3;
}

.subindice-valor-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.subindice-valor {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}

.variacion-mini {
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.variacion-mini.up {
  color: #38a169;
}

.variacion-mini.down {
  color: #e53e3e;
}

.subindice-barra-bg {
  height: 6px;
  background: #f0f0f4;
  border-radius: 3px;
  overflow: hidden;
}

.subindice-barra-fill {
  height: 100%;
  border-radius: 3px;
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
  .subindices-grid {
    grid-template-columns: 1fr;
  }
  .general-valor {
    font-size: 2.4rem;
  }
  .card-icc-general {
    padding: 1.2rem;
  }
}
</style>
