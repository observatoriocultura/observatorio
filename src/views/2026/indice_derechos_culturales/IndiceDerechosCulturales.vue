<template>
  <section class="idc-tablero">
    <header class="tablero-cabecera">
      <div class="tablero-identidad">
        <span class="tablero-marca" aria-hidden="true">IDC</span>
        <h1>Índice de Derechos Culturales</h1>
      </div>
      <IndiceMenu v-model="vistaActiva" />
    </header>

    <IndiceInfo v-if="vistaActiva === 'info'" />
    <p v-else-if="cargando" class="tablero-estado" role="status">Cargando datos...</p>
    <p v-else-if="error" class="tablero-estado text-danger" role="alert">{{ error }}</p>
    <template v-else>
      <IndiceTabla
        v-if="vistaActiva === 'tabla'"
        v-model="indiceSeleccionado"
        :subindices="subindices"
        :localidades="localidades"
        :valores="valores"
      />
      <IndiceMapa
        v-else-if="vistaActiva === 'mapa'"
        v-model="indiceSeleccionado"
        :subindices="subindices"
        :localidades="localidades"
        :valores="valores"
      />
      <IndiceMatriz
        v-else-if="vistaActiva === 'matriz'"
        :subindices="subindices"
        :localidades="localidades"
        :valores="valores"
      />
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import IndiceTabla from './indice/IndiceTabla.vue'
import IndiceMenu from './indice/IndiceMenu.vue'
import IndiceMapa from './indice/IndiceMapa.vue'
import IndiceInfo from './indice/IndiceInfo.vue'
import IndiceMatriz from './indice/IndiceMatriz.vue'

const subindices = ref([])
const localidades = ref([])
const valores = ref([])
const indiceSeleccionado = ref('IDC')
const vistaActiva = ref('matriz')
const cargando = ref(true)
const error = ref('')

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
    console.error('Error al cargar los datos del Índice de Derechos Culturales:', err)
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
.tablero-identidad {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.tablero-marca {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 1px solid #ded8e5;
  border-radius: 10px;
  background: var(--idc-soft);
  color: var(--idc-accent);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.tablero-identidad h1 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 650;
  line-height: 1.5;
  letter-spacing: 0.065em;
  text-transform: uppercase;
  color: var(--idc-ink);
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
  .tablero-marca {
    display: none;
  }
  .tablero-identidad {
    min-height: 36px;
    padding-left: 2.85rem;
  }
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
