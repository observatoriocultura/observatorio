<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useToast } from 'vue-toastification'
import { fetchGoogleSheetCsv } from '../../../utils/googleSheets.js'
import ConsumoAguaGrafica from './ConsumoAguaGrafica.vue'
import ConsumoAguaControlSegmentado from './ConsumoAguaControlSegmentado.vue'
import { crearTablaConsumoTsv } from './consumoAguaExport.js'
import {
  DESGLOSES_CONSUMO,
  PERIODOS_CONSUMO,
  VARIABLES_CONSUMO,
  crearSeriesConsumoPorDimension,
  filtrarConsumosPorClaseUso,
  filtrarConsumosPorEstrato,
  filtrarConsumosPorLocalidad,
  filtrarConsumosPorRangoPeriodo,
  prepararClasesUso,
  prepararConsumos,
  prepararLocalidades,
  resumirPeriodosConsumo,
  sumarConsumoPorPeriodo,
} from './consumoAgua.js'

const SHEET_FILE_ID = '1Uul53YtxMTHT-8Hq5y7kb0KUxibTQlIFDeNGk5PbsIM'
const registros = shallowRef([])
const clasesUso = shallowRef([])
const localidades = shallowRef([])
const opcionesLocalidad = computed(() =>
  localidades.value.filter((localidad) => Number(localidad.es_localidad) === 1),
)
const cargando = ref(true)
const error = ref('')
const copiando = ref(false)
const toast = useToast()
const claseUsoSeleccionada = ref(null)
const estratoSeleccionado = ref(null)
const opcionesEstrato = [1, 2, 3, 4, 5, 6]
const localidadSeleccionada = ref(null)
const periodoInicial = ref(202403)
const periodoFinal = ref(202512)
const periodosSeleccionados = computed(() =>
  PERIODOS_CONSUMO.filter(
    (periodo) => periodo.id >= periodoInicial.value && periodo.id <= periodoFinal.value,
  ),
)
const etiquetaPeriodo = computed(
  () =>
    `${periodosSeleccionados.value[0].etiqueta} – ${periodosSeleccionados.value.at(-1).etiqueta}`,
)

function ajustarRango(extremo) {
  if (periodoInicial.value > periodoFinal.value) {
    if (extremo === 'inicial') periodoFinal.value = periodoInicial.value
    else periodoInicial.value = periodoFinal.value
  }
}
const variableSeleccionada = ref('consumo_m3')
const opcionesVariable = VARIABLES_CONSUMO.map((variable) => ({
  id: variable.id,
  nombre: {
    consumo_m3: 'Consumo total',
    cuentas_unicas: 'Cuentas',
    consumo_promedio: 'Promedio por cuenta',
  }[variable.id],
}))
const desgloseSeleccionado = ref('ninguna')
const variableGrafica = computed(() =>
  VARIABLES_CONSUMO.find((variable) => variable.id === variableSeleccionada.value),
)

const registrosFiltrados = computed(() =>
  filtrarConsumosPorRangoPeriodo(
    filtrarConsumosPorLocalidad(
      filtrarConsumosPorEstrato(
        filtrarConsumosPorClaseUso(registros.value, claseUsoSeleccionada.value),
        estratoSeleccionado.value,
      ),
      localidadSeleccionada.value,
    ),
    periodoInicial.value,
    periodoFinal.value,
  ),
)
const etiquetaClaseUso = computed(
  () =>
    clasesUso.value.find((clase) => clase.clase_uso_cod === claseUsoSeleccionada.value)
      ?.clase_uso ?? 'Todas las clases de uso',
)
const consumoPorPeriodo = computed(() =>
  sumarConsumoPorPeriodo(registrosFiltrados.value, periodosSeleccionados.value),
)
const seriesGrafica = computed(() =>
  crearSeriesConsumoPorDimension(registrosFiltrados.value, desgloseSeleccionado.value, {
    clasesUso: clasesUso.value,
    localidades: localidades.value,
    periodos: periodosSeleccionados.value,
  }),
)
const etiquetaLocalidad = computed(
  () =>
    localidades.value.find((localidad) => localidad.localidad_cod === localidadSeleccionada.value)
      ?.nombre ?? 'Todas las localidades',
)
const etiquetaEstrato = computed(() =>
  estratoSeleccionado.value === null
    ? 'Todos los estratos'
    : `Estrato ${estratoSeleccionado.value}`,
)
const contextoSeleccion = computed(
  () => `${etiquetaClaseUso.value} · ${etiquetaEstrato.value} · ${etiquetaLocalidad.value}`,
)
const resumenPeriodos = computed(() => resumirPeriodosConsumo(consumoPorPeriodo.value))
const formatoConsumo = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const formatoCuentas = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

async function copiarTabla() {
  if (copiando.value) return
  copiando.value = true

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('El navegador no permite copiar al portapapeles en esta página.')
    }
    await navigator.clipboard.writeText(crearTablaConsumoTsv(consumoPorPeriodo.value))
    toast.success('Tabla copiada. Ya puedes pegarla en Excel o Google Sheets.')
  } catch (cause) {
    console.error('No se pudo copiar la tabla:', cause)
    toast.error(
      'No se pudo copiar la tabla. Revisa el permiso del portapapeles e inténtalo de nuevo.',
    )
  } finally {
    copiando.value = false
  }
}

onMounted(async () => {
  try {
    const [consumos, catalogo, catalogoLocalidades] = await Promise.all([
      fetchGoogleSheetCsv({
        fileId: SHEET_FILE_ID,
        gid: '1265755834',
        requiredHeaders: [
          'periodo',
          'clase_uso_cod',
          'localidad_cod',
          'estrato',
          'consumo_m3',
          'cuentas_unicas',
        ],
      }),
      fetchGoogleSheetCsv({
        fileId: SHEET_FILE_ID,
        gid: '1753675245',
        requiredHeaders: ['clase_uso_cod', 'clase_uso'],
      }),
      fetchGoogleSheetCsv({
        fileId: SHEET_FILE_ID,
        gid: '580960941',
        requiredHeaders: ['localidad_cod', 'nombre', 'es_localidad'],
      }),
    ])
    registros.value = prepararConsumos(consumos)
    clasesUso.value = prepararClasesUso(catalogo)
    localidades.value = prepararLocalidades(catalogoLocalidades)
  } catch (cause) {
    console.error('No se pudieron cargar los datos de consumo de agua:', cause)
    error.value =
      'No se pudieron cargar o procesar los consumos y los catálogos de clases de uso y localidades.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="informe-agua">
    <header class="informe-cabecera">
      <p class="informe-antetitulo">Informe de consumo · Serie mensual</p>
      <h1>Consumo de agua en Bogotá <span>2024–2025</span></h1>
    </header>
    <p
      v-if="cargando || error"
      class="informe-estado"
      :class="{ 'informe-error': error }"
      aria-live="polite"
    >
      <template v-if="cargando">Cargando registros de consumo de agua en Bogotá…</template>
      <template v-else-if="error">{{ error }}</template>
    </p>
    <div
      v-if="!cargando && !error"
      class="informe-filtros"
      role="group"
      aria-label="Filtros del informe"
    >
      <div>
        <label for="clase-uso-consumo" class="form-label">Clase de uso</label>
        <select
          id="clase-uso-consumo"
          v-model="claseUsoSeleccionada"
          class="form-select"
          :class="{ 'filtro-activo': claseUsoSeleccionada !== null }"
        >
          <option :value="null">Todas las clases de uso</option>
          <option
            v-for="clase in clasesUso"
            :key="clase.clase_uso_cod"
            :value="clase.clase_uso_cod"
          >
            {{ clase.clase_uso }}
          </option>
        </select>
      </div>
      <div>
        <label for="estrato-consumo" class="form-label">Estrato</label>
        <select
          id="estrato-consumo"
          v-model="estratoSeleccionado"
          class="form-select"
          :class="{ 'filtro-activo': estratoSeleccionado !== null }"
        >
          <option :value="null">Todos los estratos</option>
          <option v-for="estrato in opcionesEstrato" :key="estrato" :value="estrato">
            Estrato {{ estrato }}
          </option>
        </select>
      </div>
      <div>
        <label for="localidad-consumo" class="form-label">Localidad</label>
        <select
          id="localidad-consumo"
          v-model="localidadSeleccionada"
          class="form-select"
          :class="{ 'filtro-activo': localidadSeleccionada !== null }"
        >
          <option :value="null">Todas las localidades</option>
          <option
            v-for="localidad in opcionesLocalidad"
            :key="localidad.localidad_cod"
            :value="localidad.localidad_cod"
          >
            {{ localidad.nombre }}
          </option>
        </select>
      </div>
      <div>
        <label for="periodo-inicial-consumo" class="form-label">Periodo inicial</label>
        <select
          id="periodo-inicial-consumo"
          v-model="periodoInicial"
          class="form-select"
          :class="{ 'filtro-activo': periodoInicial !== PERIODOS_CONSUMO[0].id }"
          @change="ajustarRango('inicial')"
        >
          <option v-for="periodo in PERIODOS_CONSUMO" :key="periodo.id" :value="periodo.id">
            {{ periodo.etiqueta }}
          </option>
        </select>
      </div>
      <div>
        <label for="periodo-final-consumo" class="form-label">Periodo final</label>
        <select
          id="periodo-final-consumo"
          v-model="periodoFinal"
          class="form-select"
          :class="{ 'filtro-activo': periodoFinal !== PERIODOS_CONSUMO.at(-1).id }"
          @change="ajustarRango('final')"
        >
          <option v-for="periodo in PERIODOS_CONSUMO" :key="periodo.id" :value="periodo.id">
            {{ periodo.etiqueta }}
          </option>
        </select>
      </div>
    </div>
    <ConsumoAguaGrafica
      v-if="!cargando && !error"
      :periodos="consumoPorPeriodo"
      :contexto="contextoSeleccion"
      :rango-periodo="etiquetaPeriodo"
      :variable="variableGrafica"
      :series="seriesGrafica"
      :desglose="desgloseSeleccionado"
    >
      <template #controles>
        <div class="controles-grafica" role="group" aria-label="Controles de la gráfica">
          <ConsumoAguaControlSegmentado
            v-model="variableSeleccionada"
            :opciones="opcionesVariable"
            etiqueta="Variable"
            nombre="variable-consumo"
          />
          <ConsumoAguaControlSegmentado
            v-model="desgloseSeleccionado"
            :opciones="DESGLOSES_CONSUMO"
            etiqueta="Desglosar por"
            nombre="desglose-consumo"
          />
        </div>
      </template>
    </ConsumoAguaGrafica>
    <section v-if="!cargando && !error" class="informe-tabla" aria-labelledby="detalle-mensual">
      <div class="tabla-cabecera">
        <div>
          <h2 id="detalle-mensual">Detalle mensual</h2>
          <p>{{ contextoSeleccion }} · {{ etiquetaPeriodo }}</p>
        </div>
        <button
          type="button"
          class="boton-copiar"
          :disabled="copiando"
          :aria-busy="copiando"
          title="Copiar la tabla para pegar en Excel o Google Sheets"
          @click="copiarTabla"
        >
          <i class="bi bi-copy" aria-hidden="true"></i>
          <span>{{ copiando ? 'Copiando…' : 'Copiar tabla' }}</span>
        </button>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <caption class="visually-hidden">
            Consumo, cuentas y consumo promedio por mes.
            {{
              contextoSeleccion
            }}.
            {{
              etiquetaPeriodo
            }}.
          </caption>
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col" class="text-end">Consumo (m³)</th>
              <th scope="col" class="text-end">Cantidad de cuentas</th>
              <th scope="col" class="text-end">Consumo promedio (m³/cuenta)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="periodo in consumoPorPeriodo" :key="periodo.id">
              <th scope="row">{{ periodo.etiqueta }}</th>
              <td class="text-end">{{ formatoConsumo.format(periodo.consumo_m3) }}</td>
              <td class="text-end">{{ formatoCuentas.format(periodo.cuentas_unicas) }}</td>
              <td class="text-end">
                {{
                  periodo.consumo_promedio === null
                    ? 'Sin datos'
                    : formatoConsumo.format(periodo.consumo_promedio)
                }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td class="text-end fw-bold">
                {{ formatoConsumo.format(resumenPeriodos.consumo_m3) }}
              </td>
              <td class="text-end" title="Máximo de cuentas entre los meses mostrados">
                {{ formatoCuentas.format(resumenPeriodos.cuentas_maximas) }}
              </td>
              <td
                class="text-end"
                title="Consumo total dividido entre la suma de cuentas de todos los meses"
              >
                {{
                  resumenPeriodos.consumo_promedio === null
                    ? 'Sin datos'
                    : formatoConsumo.format(resumenPeriodos.consumo_promedio)
                }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.informe-agua {
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(24px, 4vw, 56px) clamp(16px, 3vw, 40px);
  color: #41464d;
  background: #fff;
  font-weight: 400;
}

.informe-cabecera {
  margin-bottom: 24px;
}
.informe-antetitulo {
  margin-bottom: 10px;
  color: #155fc3;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.informe-cabecera h1 {
  color: #155fc3;
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.2;
}
.informe-cabecera h1 span {
  white-space: nowrap;
  color: #6b6b6b;
}
.informe-estado {
  margin-bottom: 22px;
  color: #6b6b6b;
  font-size: 0.85rem;
}
.informe-error {
  color: #aa3030;
}
.informe-filtros {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr 1.15fr 1.2fr 1.2fr;
  gap: 12px;
  margin-bottom: 24px;
  padding: 18px 20px;
  border: 1px solid #dedede;
  border-radius: 16px;
  background: #f4f4f4;
}
.controles-grafica {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
  min-width: 0;
  margin: 0 8px 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ededed;
}
@media (max-width: 1100px) {
  .controles-grafica {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
.form-label {
  margin-bottom: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}
.form-select {
  min-width: 0;
  width: 100%;
  min-height: 38px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-color: #d9d9d9;
  border-radius: 8px;
  color: #41464d;
  font-size: 0.82rem;
  font-weight: 500;
}
.form-select.filtro-activo {
  border-color: #155fc3;
}
.form-select:focus {
  border-color: #155fc3;
  box-shadow: 0 0 0 3px #155fc320;
}
.informe-tabla {
  overflow: hidden;
  margin-top: 24px;
  border: 1px solid #dedede;
  border-radius: 16px;
  background: #fff;
}
.tabla-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 28px 18px;
}
.boton-copiar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  margin-left: auto;
  padding: 8px 14px;
  border: 1px solid #155fc3;
  border-radius: 8px;
  background: #fff;
  color: #155fc3;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.boton-copiar:hover {
  background: #edf3fc;
}
.boton-copiar:focus-visible {
  outline: 3px solid #155fc340;
  outline-offset: 2px;
}
.boton-copiar:disabled {
  opacity: 0.6;
  cursor: wait;
}
.tabla-cabecera h2 {
  color: #155fc3;
  margin: 0 0 5px;
  font-size: 1.15rem;
  font-weight: 750;
}
.tabla-cabecera p {
  margin: 0;
  color: #6b6b6b;
  font-size: 0.85rem;
}
.table {
  --bs-table-color: #41464d;
  --bs-table-border-color: #ededed;
  width: 100%;
  min-width: 680px;
  margin: 0;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}
.table > :not(caption) > * > * {
  padding: 15px 24px;
  box-shadow: none;
}
.table thead th {
  background: #f3f3f3;
  color: #6b6b6b;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
}
.table tbody th {
  font-weight: 500;
  text-transform: none;
}
.table tbody tr:hover > * {
  background: #f2f6fc;
}
.table tfoot > tr > * {
  border-bottom: 0;
  background: #f3f3f3;
  font-weight: 700;
}
@media (min-width: 768px) and (max-width: 1100px) {
  .informe-filtros {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .informe-filtros {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 18px;
  }
  .tabla-cabecera {
    padding: 20px;
  }
}
</style>
