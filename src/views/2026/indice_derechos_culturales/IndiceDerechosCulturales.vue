<template>
  <section class="idc-tablero">
    <header class="tablero-cabecera">
      <IndiceGrupoSelector v-model="grupoActivo" />
      <component :is="menus[grupoActivo]" v-model="vistaActiva" />
    </header>

    <IndiceInfo v-if="vistaActiva === 'info'" />
    <p v-else-if="cargando" class="tablero-estado" role="status">Cargando datos...</p>
    <p v-else-if="error" class="tablero-estado text-danger" role="alert">{{ error }}</p>
    <component
      :is="vistas[grupoActivo][vistaActiva]"
      v-else
      :key="`${grupoActivo}-${vistaActiva}`"
      v-bind="propiedadesVista"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import IndiceGrupoSelector from './IndiceGrupoSelector.vue'
import IndiceInfo from './IndiceInfo.vue'
import IdcMenu from './idc/IdcMenu.vue'
import IdcMatriz from './idc/IdcMatriz.vue'
import IdcMapa from './idc/IdcMapa.vue'
import IhcMenu from './ihc/IhcMenu.vue'
import IhcMatriz from './ihc/IhcMatriz.vue'
import IhcMapa from './ihc/IhcMapa.vue'
import { GRUPOS, crearEstadoGrupo } from './configuracion.js'

const menus = { IDC: IdcMenu, IHC: IhcMenu }
const vistas = {
  IDC: { matriz: IdcMatriz, mapa: IdcMapa },
  IHC: { matriz: IhcMatriz, mapa: IhcMapa },
}

const subindices = ref([])
const localidades = ref([])
const valores = ref([])
const grupoActivo = ref('IDC')
const vistaActiva = ref('matriz')
const estados = reactive(
  Object.fromEntries(Object.values(GRUPOS).map((grupo) => [grupo.codigo, crearEstadoGrupo(grupo)])),
)
const cargando = ref(true)
const error = ref('')

const subindicesGrupo = computed(() =>
  subindices.value.filter((item) => item.grupo === grupoActivo.value),
)
const valoresGrupo = computed(() => {
  const codigos = new Set(subindicesGrupo.value.map((item) => item.codigo))
  return valores.value.filter((item) => codigos.has(item.codigo))
})

// El estado vive aquí para conservarlo aunque se desmonte una vista o su mapa.
const propiedadesVista = computed(() => {
  const estado = estados[grupoActivo.value]
  const datos = {
    subindices: subindicesGrupo.value,
    localidades: localidades.value,
    valores: valoresGrupo.value,
  }
  if (vistaActiva.value === 'matriz') {
    return {
      ...datos,
      ordenarPor: estado.ordenMatrizPor,
      ordenAsc: estado.ordenMatrizAsc,
      'onUpdate:ordenarPor': (codigo) => {
        estado.ordenMatrizPor = codigo
      },
      'onUpdate:ordenAsc': (ascendente) => {
        estado.ordenMatrizAsc = ascendente
      },
    }
  }
  return {
    ...datos,
    modelValue: estado.indice,
    'onUpdate:modelValue': (codigo) => {
      estado.indice = codigo
    },
  }
})

async function leerDatos(nombre) {
  const ruta = `${import.meta.env.BASE_URL}content/2026/indice_derechos_culturales_datos/${nombre}.json`
  const respuesta = await fetch(ruta)

  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${nombre}.json`)
  }

  const datos = await respuesta.json()
  if (!Array.isArray(datos)) {
    throw new Error(`El archivo ${nombre}.json no contiene una lista de registros`)
  }
  return datos
}

onMounted(async () => {
  try {
    const [datosSubindices, datosLocalidades, datosValores] = await Promise.all([
      leerDatos('subindices'),
      leerDatos('localidades'),
      leerDatos('valores'),
    ])
    subindices.value = datosSubindices
    localidades.value = datosLocalidades
    valores.value = datosValores
  } catch (err) {
    console.error('Error al cargar los datos del informe IDC e IHC:', err)
    error.value = 'No fue posible cargar los datos. Intenta recargar la página.'
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.idc-tablero {
  --idc-ink: #292534;
  --idc-muted: #6a6875;
  --idc-accent: #483357;
  --idc-line: #e8e7ed;
  --idc-soft: #f6f4f8;
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  padding: 1.5rem clamp(1rem, 2.5vw, 2.5rem) 3rem;
  color: var(--idc-ink);
  font-family: Inter, 'Segoe UI', sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.6;
}
.idc-tablero :deep(h1),
.idc-tablero :deep(h2),
.idc-tablero :deep(h3),
.idc-tablero :deep(button),
.idc-tablero :deep(select) {
  font-family: inherit;
}
.idc-tablero :deep(button:focus-visible),
.idc-tablero :deep(select:focus-visible),
.idc-tablero :deep(summary:focus-visible) {
  outline: 2px solid var(--idc-accent);
  outline-offset: 3px;
}
.idc-tablero :deep(.idc-panel) {
  background: #fff;
  border: 1px solid var(--idc-line);
  border-radius: 14px;
  box-shadow: 0 2px 6px #29253403;
}
.idc-tablero :deep(.idc-layout) {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;
}
.idc-tablero :deep(.idc-sidebar) {
  display: grid;
  gap: 1rem;
  min-width: 0;
}
.idc-tablero :deep(.idc-eyebrow) {
  display: block;
  color: var(--idc-muted);
  font-size: 0.65rem;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.idc-tablero :deep(.idc-note) {
  color: var(--idc-muted);
  font-size: 0.75rem;
  line-height: 1.7;
}
.tablero-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 0;
  margin-bottom: 1.25rem;
}
.tablero-estado {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--idc-muted);
}
@media (max-width: 900px) {
  .idc-tablero :deep(.idc-layout) {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 1rem;
  }
}
@media (max-width: 800px) {
  .idc-tablero :deep(.idc-layout) {
    grid-template-columns: minmax(0, 1fr);
  }
  .idc-tablero :deep(.idc-sidebar) {
    gap: 0.75rem;
  }
}
@media (max-width: 767px) {
  .tablero-cabecera {
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .tablero-cabecera > nav {
    margin-left: auto;
  }
}
</style>
