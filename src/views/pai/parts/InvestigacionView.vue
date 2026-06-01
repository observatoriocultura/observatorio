<template>
  <section v-if="investigacion" class="investigacion-detalle" aria-label="Detalle de investigacion">
    <button type="button" class="volver-lista" @click="emit('back')">
      <i class="bi bi-arrow-left" aria-hidden="true"></i>
      Volver a la lista
    </button>

    <div class="investigacion-detalle-card">
      <div class="investigacion-detalle-grid">
        <section class="investigacion-detalle-columna" aria-label="Descripcion y avances">
          <header class="investigacion-detalle-header">
            <div class="investigacion-detalle-titulos">
              <span
                v-if="investigacion.linea_investigacion"
                class="label"
                :class="getLineaClass(investigacion.linea_investigacion)"
              >
                {{ investigacion.linea_investigacion }}
              </span>
              <span v-else class="text-muted">Sin linea registrada</span>

              <h2>{{ investigacion.nombre_clave }}</h2>
              <p>{{ investigacion.titulo }}</p>
            </div>

            <div class="avance-general" aria-label="Avance general">
              <span>Avance total</span>
              <strong>{{ formatAvance(investigacion.avance) }}</strong>
            </div>
          </header>

          <p v-if="investigacion.descripcion" class="investigacion-descripcion mb-3">
            {{ investigacion.descripcion }}
          </p>

          <div class="etapas-detalle" aria-label="Avance por etapas">
            <article v-for="etapa in etapasDetalle" :key="etapa.codigo" class="etapa-detalle">
              <span class="label etapa-codigo" :class="etapa.className">{{ etapa.codigo }}</span>
              <div class="etapa-info">
                <h3>{{ etapa.etiqueta }}</h3>
                <div
                  class="progress"
                  role="progressbar"
                  :aria-label="`Avance de ${etapa.nombre}`"
                  :aria-valuenow="getAvanceValue(etapa.avance)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    class="progress-bar"
                    :style="{ width: `${getAvanceValue(etapa.avance)}%` }"
                  ></div>
                </div>
              </div>
              <strong>{{ formatAvance(etapa.avance) }}</strong>
            </article>
          </div>
        </section>

        <section class="investigacion-detalle-columna" aria-label="Notas de la investigacion">
          <h3 class="columna-titulo">Notas</h3>

          <div v-if="notasInvestigacion.length > 0" class="notas-list">
            <article v-for="(nota, index) in notasInvestigacion" :key="index" class="nota-card">
              <p class="nota-meta">
                {{ getNotaFecha(nota) }} - {{ getTiempoHace(getNotaFecha(nota)) }}
              </p>
              <p class="nota-texto">{{ getNotaTexto(nota) }}</p>
            </article>
          </div>

          <p v-else class="notas-empty">No hay notas registradas para esta investigacion.</p>
        </section>

        <section class="investigacion-detalle-columna" aria-label="Espacio reservado"></section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { toClassName } from '../../../utils/text'
import { etapasInvestigacion } from '../constants'

const props = defineProps({
  investigacion: {
    type: Object,
    default: null,
  },
  notas: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['back'])

const campoAvancePorEtapa = {
  P: 'avance_planeacion',
  I: 'avance_instrumentos',
  R: 'avance_recoleccion',
  D: 'avance_documentacion',
  F: 'avance_finalizacion',
}

const clasePorEtapa = {
  P: 'etapa-planeacion',
  I: 'etapa-instrumento',
  R: 'etapa-recoleccion',
  D: 'etapa-documentacion',
  F: 'etapa-finalizacion',
}

const getLineaClass = (linea) => `bg-${toClassName(linea)}`

const getAvanceValue = (value) => {
  const avance = Number(value)
  if (!Number.isFinite(avance)) return 0
  return Math.min(Math.max(Math.round(avance), 0), 100)
}

const formatAvance = (value) => `${getAvanceValue(value)}%`

const etapasDetalle = computed(() =>
  etapasInvestigacion.map((etapa) => ({
    ...etapa,
    className: clasePorEtapa[etapa.codigo],
    avance: props.investigacion?.[campoAvancePorEtapa[etapa.codigo]],
  })),
)

const getNotaValueByKey = (nota, expectedKey) => {
  const normalizedExpectedKey = toClassName(expectedKey)
  const key = Object.keys(nota ?? {}).find(
    (notaKey) => toClassName(notaKey) === normalizedExpectedKey,
  )

  return key ? nota[key] : undefined
}

const getNotaInvestigacionId = (nota) =>
  getNotaValueByKey(nota, 'ID investigación') ?? nota?.investigacion_id ?? nota?.id_investigacion

const getNotaFecha = (nota) => getNotaValueByKey(nota, 'Fecha') ?? ''
const getNotaTexto = (nota) => getNotaValueByKey(nota, 'Nota') ?? ''

const parseLocalDate = (value) => {
  const [year, month, day] = String(value ?? '')
    .split('-')
    .map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

const getTiempoHace = (fecha) => {
  const date = parseLocalDate(fecha)
  if (!date) return ''

  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((todayDate.getTime() - date.getTime()) / 86400000)
  const absDays = Math.abs(diffDays)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  if (diffDays > 1) return `Hace ${diffDays} días`
  if (absDays === 1) return 'En 1 día'
  return `En ${absDays} días`
}

const notasInvestigacion = computed(() =>
  props.notas.filter(
    (nota) =>
      String(getNotaInvestigacionId(nota)) === String(props.investigacion?.id) &&
      String(getNotaTexto(nota)).trim() !== '',
  ),
)
</script>

<style scoped>
.investigacion-detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.investigacion-detalle-card {
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background-color: #fff;
  padding: 1.25rem;
}

.investigacion-detalle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;
}

.investigacion-detalle-columna {
  min-width: 0;
}

.volver-lista {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  align-self: flex-start;
  border: 1px solid #654096;
  border-radius: 8px;
  background-color: #f0ebf7;
  padding: 0.58rem 0.95rem;
  color: #32204a;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.2;
}

.volver-lista:hover,
.volver-lista:focus {
  background-color: #654096;
  color: #fff;
}

.volver-lista i {
  font-size: 1rem;
  line-height: 1;
}

.volver-lista:focus {
  outline: 3px solid rgba(101, 64, 150, 0.18);
  outline-offset: 2px;
}

.investigacion-detalle-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
}

.investigacion-detalle-titulos {
  min-width: 0;
}

.investigacion-detalle h2 {
  margin: 0.6rem 0 0.35rem;
  color: #212529;
  font-size: 1.35rem;
  line-height: 1.2;
}

.investigacion-detalle p {
  margin: 0;
  color: #495057;
  font-size: 0.92rem;
  line-height: 1.45;
}

.avance-general {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 3px solid #654096;
  padding-top: 0.65rem;
  text-align: left;
}

.avance-general span,
.etapa-peso {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.avance-general strong {
  color: #212529;
  font-size: 1.6rem;
  line-height: 1;
}

.investigacion-descripcion {
  border-top: 1px solid #eeeeee;
  padding-top: 1rem;
}

.etapas-detalle {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.45rem;
}

.etapa-detalle {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  padding: 0.5rem;
}

.etapa-detalle-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.65rem;
  align-items: start;
}

.etapa-codigo {
  display: inline-flex;
  width: 1.55rem;
  height: 1.55rem;
  align-items: center;
  justify-content: center;
  color: #212529;
}

.etapa-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.3rem;
}

.etapa-detalle h3 {
  margin: 0;
  color: #212529;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.2;
}

.etapa-detalle-header strong {
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.2;
}

.progress {
  height: 0.35rem;
  border-radius: 999px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: inherit;
  background-color: #654096;
}

.columna-titulo {
  margin: 0 0 0.75rem;
  color: #212529;
  font-size: 1rem;
  line-height: 1.2;
}

.notas-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.nota-card {
  border: 1px solid #eeeeee;
  border-radius: 6px;
  padding: 0.65rem;
}

.nota-card p {
  margin: 0;
}

.nota-meta {
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;
}

.nota-texto {
  margin-top: 0.35rem;
  color: #212529;
  font-size: 0.84rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.notas-empty {
  border: 1px dashed #d8d8d8;
  border-radius: 6px;
  padding: 0.75rem;
  color: #6c757d;
  font-size: 0.85rem;
}

@media (max-width: 991.98px) {
  .investigacion-detalle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
