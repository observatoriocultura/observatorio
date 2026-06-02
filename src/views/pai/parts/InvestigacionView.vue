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
                {{ formatNotaFecha(getNotaFecha(nota)) }}
                <span v-if="getTiempoHace(getNotaFecha(nota))">
                  - {{ getTiempoHace(getNotaFecha(nota)) }}
                </span>
              </p>
              <p class="nota-texto">{{ getNotaTexto(nota) }}</p>
            </article>
          </div>

          <p v-else class="notas-empty">No hay notas registradas para esta investigacion.</p>
        </section>

        <section class="investigacion-detalle-columna" aria-label="Productos de la investigacion">
          <h3 class="columna-titulo">Productos</h3>

          <div v-if="productosInvestigacion.length > 0" class="productos-list">
            <article
              v-for="producto in productosInvestigacion"
              :key="producto.id"
              class="producto-card"
            >
              <a
                v-if="getProductoUrlPublica(producto)"
                :class="getProductoTipoClass(producto)"
                :href="getProductoUrlPublica(producto)"
                :aria-label="`Abrir ${getProductoTitulo(producto)}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="bi" :class="getProductoIconClass(producto)"></i>
              </a>
              <span v-else :class="getProductoTipoClass(producto)" aria-hidden="true">
                <i class="bi" :class="getProductoIconClass(producto)"></i>
              </span>
              <div class="producto-content">
                <h4 class="mb-2">{{ getProductoTitulo(producto) }}</h4>
                <p v-if="producto.descripcion" class="producto-descripcion mb-2">
                  {{ producto.descripcion }}
                </p>
                <p class="producto-meta mb-2">{{ getProductoMeta(producto) }}</p>
                <div class="producto-links">
                  <a
                    v-if="getProductoUrlPublica(producto)"
                    class="producto-link"
                    :href="getProductoUrlPublica(producto)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                    Abrir
                  </a>
                  <a
                    v-if="getProductoUrlEditable(producto)"
                    class="producto-link"
                    :href="getProductoUrlEditable(producto)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i class="bi bi-pencil-square" aria-hidden="true"></i>
                    Abrir editable
                  </a>
                </div>
                <small
                  v-if="getProductoObservaciones(producto)"
                  class="text-muted producto-observaciones"
                >
                  {{ getProductoObservaciones(producto) }}
                </small>
              </div>
            </article>
          </div>

          <p v-else class="notas-empty">No hay productos registrados para esta investigacion.</p>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { toClassName } from '../../../utils/text'
import { etapasInvestigacion, tiposProducto } from '../constants'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.locale('es')

const props = defineProps({
  investigacion: {
    type: Object,
    default: null,
  },
  notas: {
    type: Array,
    default: () => [],
  },
  productos: {
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

const parseNotaFecha = (value) => {
  const fecha = String(value ?? '').trim()
  if (!fecha) return null

  const formatos = ['YYYY-MM-DD', 'DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY']
  const parsedFecha = dayjs(fecha, formatos, 'es', true)

  if (parsedFecha.isValid()) return parsedFecha.startOf('day')

  const fallbackFecha = dayjs(fecha)
  return fallbackFecha.isValid() ? fallbackFecha.startOf('day') : null
}

const formatNotaFecha = (fecha) => {
  const parsedFecha = parseNotaFecha(fecha)
  if (!parsedFecha) return 'Sin fecha'

  return parsedFecha.format('D [de] MMMM [de] YYYY')
}

const getTiempoHace = (fecha) => {
  const parsedFecha = parseNotaFecha(fecha)
  if (!parsedFecha) return ''
  if (parsedFecha.isSame(dayjs(), 'day')) return 'Hoy'

  return parsedFecha.fromNow()
}

const notasInvestigacion = computed(() =>
  props.notas.filter(
    (nota) =>
      String(getNotaInvestigacionId(nota)) === String(props.investigacion?.id) &&
      String(getNotaTexto(nota)).trim() !== '',
  ),
)

const productosInvestigacion = computed(() =>
  props.productos.filter(
    (producto) => String(producto?.investigacion_id) === String(props.investigacion?.id),
  ),
)

const getProductoTitulo = (producto) =>
  String(producto?.titulo ?? producto?.tipo_producto ?? 'Producto sin titulo').trim()

const getProductoUrlPublica = (producto) =>
  String(producto?.url_publica ?? producto?.url ?? '').trim()

const getProductoUrlEditable = (producto) => String(producto?.url_editable ?? '').trim()

const getProductoObservaciones = (producto) => String(producto?.observaciones ?? '').trim()

const getTipoProducto = (producto) =>
  tiposProducto.find((tipo) => toClassName(tipo.nombre) === toClassName(producto?.tipo_producto))

const getProductoIconClass = (producto) =>
  `bi-${getTipoProducto(producto)?.bs_icon ?? 'file-earmark'}`

const getProductoTipoClass = (producto) => [
  'tipo-producto-general',
  `tipo-producto-${toClassName(producto?.tipo_producto)}`,
]

const getProductoMeta = (producto) => {
  const meta = [
    producto?.paginas ? `${producto.paginas} paginas` : '',
    producto?.tipo_producto,
    producto?.radicado_orfeo ? `Radicado ${producto.radicado_orfeo}` : '',
  ].filter(Boolean)

  return meta.length > 0 ? meta.join(' - ') : 'Producto'
}
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

.productos-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.producto-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.6rem;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  padding: 0.65rem;
}

.producto-content {
  min-width: 0;
}

.producto-card h4 {
  margin: 0.2rem 0 0;
  color: #212529;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.producto-meta {
  color: #6c757d;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;
  text-transform: uppercase;
}

.producto-descripcion {
  margin-top: 0.35rem;
  overflow-wrap: anywhere;
}

.producto-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.producto-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #32204a;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
}

.producto-link:hover,
.producto-link:focus {
  color: #654096;
  text-decoration: underline;
}

.producto-observaciones {
  display: block;
  margin-top: 0.45rem;
  overflow-wrap: anywhere;
}

@media (max-width: 991.98px) {
  .investigacion-detalle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
