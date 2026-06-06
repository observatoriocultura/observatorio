<script setup>
import { computed, ref } from 'vue'
import LocalidadesUrbanas from '../../components/mapas/LocalidadesUrbanas.vue'

const colorMin = ref('#EDE8F4')
const colorMax = ref('#654096')
const strokeColor = ref('#1d122b')
const backgroundColor = ref('#FCFCFC')
const rotation = ref(-98)
const zoom = ref(1.4)
const pastedDataText = ref('')
const presetsOpen = ref(true)
const dataView = ref('input')
const toastMessage = ref('')
const showToast = ref(false)
let toastTimeout = null

const localidadesValores = ref([
  { localidad_cod: 1, valor: 72 },
  { localidad_cod: 2, valor: 38 },
  { localidad_cod: 3, valor: 91 },
  { localidad_cod: 4, valor: 2 },
  { localidad_cod: 5, valor: 150 },
  { localidad_cod: 6, valor: 47 },
  { localidad_cod: 7, valor: 83 },
  { localidad_cod: 8, valor: 55 },
  { localidad_cod: 9, valor: 29 },
  { localidad_cod: 10, valor: 78 },
  { localidad_cod: 11, valor: 62 },
  { localidad_cod: 12, valor: 34 },
  { localidad_cod: 13, valor: 88 },
  { localidad_cod: 14, valor: 19 },
  { localidad_cod: 15, valor: 51 },
  { localidad_cod: 16, valor: 96 },
  { localidad_cod: 17, valor: 27 },
  { localidad_cod: 18, valor: 69 },
  { localidad_cod: 19, valor: 43 },
])

const colorOptions = [
  {
    key: 'cultura-bogota',
    name: 'Cultura Bogotá',
    colorMin: '#EDE8F4',
    colorMax: '#654096',
    strokeColor: '#1d122b',
    backgroundColor: '#FCFCFC',
  },
  {
    key: 'magenta-claro',
    name: 'Magenta claro',
    colorMin: '#FDE7FF',
    colorMax: '#FF74FF',
    strokeColor: '#B91CB8',
    backgroundColor: '#FFF1FF',
  },
  {
    key: 'verde-movilidad',
    name: 'Verde movilidad',
    colorMin: '#FFFFFF',
    colorMax: '#A5B300',
    strokeColor: '#15803D',
    backgroundColor: '#FFFFFF',
  },
  {
    key: 'cultura-ciudadana',
    name: 'Cultura Ciudadana',
    colorMin: '#FEF3C7',
    colorMax: '#F59E0B',
    strokeColor: '#B45309',
    backgroundColor: '#FFFFFF',
  },
  {
    key: 'cyan-tecnico',
    name: 'Cyan tecnico',
    colorMin: '#CFFAFE',
    colorMax: '#06B6D4',
    strokeColor: '#0E7490',
    backgroundColor: '#ECFEFF',
  },
  {
    key: 'gris-editorial',
    name: 'Gris editorial',
    colorMin: '#F1F5F9',
    colorMax: '#64748B',
    strokeColor: '#475569',
    backgroundColor: '#F8FAFC',
  },
]

const section = ref('mapa')
const menuItems = [
  { key: 'mapa', label: 'Mapa' },
  { key: 'datos', label: 'Datos' },
]

const selectedColorOptionKey = computed(() => {
  const selectedOption = colorOptions.find(
    (option) =>
      option.colorMin === colorMin.value &&
      option.colorMax === colorMax.value &&
      option.strokeColor === strokeColor.value &&
      option.backgroundColor === backgroundColor.value,
  )

  return selectedOption?.key
})

function selectColorOption(option) {
  colorMin.value = option.colorMin
  colorMax.value = option.colorMax
  strokeColor.value = option.strokeColor
  backgroundColor.value = option.backgroundColor
}

function parseExcelData(text) {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)

  if (!rows.length) return []

  const parsedRows = rows.map((row) => row.split(/\t|,|;/).map((cell) => cell.trim()))
  const firstRow = parsedRows[0].map((cell) => cell.toLowerCase())
  const hasHeader = firstRow.includes('localidad_cod') && firstRow.includes('valor')
  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows
  const localidadIndex = hasHeader ? firstRow.indexOf('localidad_cod') : 0
  const valorIndex = hasHeader ? firstRow.indexOf('valor') : 1

  return dataRows
    .map((row) => ({
      localidad_cod: Number(row[localidadIndex]),
      valor: Number(String(row[valorIndex]).replace(',', '.')),
    }))
    .filter((item) => Number.isFinite(item.localidad_cod) && Number.isFinite(item.valor))
}

function updateLocalidadesValores() {
  const parsedValues = parseExcelData(pastedDataText.value)

  if (parsedValues.length) {
    localidadesValores.value = parsedValues
    dataView.value = 'tabla'
    showUpdateToast(`Datos actualizados: ${parsedValues.length} localidades.`)
    return
  }

  showUpdateToast('No se encontraron datos válidos para actualizar.')
}

function showUpdateToast(message) {
  toastMessage.value = message
  showToast.value = true
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 3500)
}
</script>

<template>
  <main class="mapa-localidades">
    <header class="mapa-localidades__header">
      <h1>Mapa de Localidades</h1>
    </header>

    <nav class="mapa-localidades__nav" aria-label="Secciones del mapa de localidades">
      <ul class="nav nav-tabs">
        <li v-for="item in menuItems" :key="item.key" class="nav-item">
          <button
            class="nav-link"
            :class="{ active: section === item.key }"
            type="button"
            :aria-current="section === item.key ? 'page' : undefined"
            @click="section = item.key"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </nav>

    <section v-if="section === 'mapa'" class="mapa-localidades__map-container">
      <LocalidadesUrbanas
        :color-min="colorMin"
        :color-max="colorMax"
        :stroke-color="strokeColor"
        :background-color="backgroundColor"
        :localidades-valores="localidadesValores"
        :rotation="rotation"
        :zoom="zoom"
      />

      <aside class="mapa-localidades__palette" aria-label="Opciones de color del mapa">
        <div class="mapa-localidades__color-controls">
          <label class="mapa-localidades__color-control">
            <span>Color mínimo</span>
            <input v-model="colorMin" type="color" aria-label="Color mínimo de localidades" />
          </label>

          <label class="mapa-localidades__color-control">
            <span>Color máximo</span>
            <input v-model="colorMax" type="color" aria-label="Color máximo de localidades" />
          </label>

          <label class="mapa-localidades__color-control">
            <span>Color de borde</span>
            <input v-model="strokeColor" type="color" aria-label="Color de borde de localidades" />
          </label>

          <label class="mapa-localidades__color-control">
            <span>Color de fondo</span>
            <input v-model="backgroundColor" type="color" aria-label="Color de fondo del mapa" />
          </label>
        </div>

        <div class="accordion mapa-localidades__accordion" id="mapa-localidades-presets">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button"
                :class="{ collapsed: !presetsOpen }"
                type="button"
                :aria-expanded="presetsOpen"
                aria-controls="mapa-localidades-presets-body"
                @click="presetsOpen = !presetsOpen"
              >
                Combinaciones
              </button>
            </h2>

            <div
              id="mapa-localidades-presets-body"
              class="accordion-collapse collapse"
              :class="{ show: presetsOpen }"
            >
              <div class="accordion-body">
                <button
                  v-for="option in colorOptions"
                  :key="option.key"
                  class="mapa-localidades__palette-option"
                  :class="{
                    'mapa-localidades__palette-option--selected':
                      selectedColorOptionKey === option.key,
                  }"
                  type="button"
                  @click="selectColorOption(option)"
                >
                  <span
                    class="mapa-localidades__swatch"
                    :style="{
                      background: `linear-gradient(90deg, ${option.colorMin}, ${option.colorMax})`,
                      borderColor: option.strokeColor,
                      boxShadow: `0 0 0 3px ${option.backgroundColor}`,
                    }"
                    aria-hidden="true"
                  ></span>
                  <span class="mapa-localidades__palette-name">{{ option.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mapa-localidades__transform-controls">
          <label class="mapa-localidades__range-control">
            <span>Zoom</span>
            <input
              v-model.number="zoom"
              class="form-range"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
            />
            <output>{{ zoom.toFixed(2) }}</output>
          </label>

          <label class="mapa-localidades__range-control">
            <span>Rotación</span>
            <input
              v-model.number="rotation"
              class="form-range"
              type="range"
              min="-180"
              max="180"
              step="1"
            />
            <output>{{ rotation }}°</output>
          </label>
        </div>
      </aside>
    </section>

    <section v-else class="mapa-localidades__data-container">
      <div class="mapa-localidades__data-toolbar">
        <div class="btn-group" role="group" aria-label="Vista de datos de localidades">
          <button
            class="btn btn-outline-secondary"
            :class="{ active: dataView === 'input' }"
            type="button"
            @click="dataView = 'input'"
          >
            Cargar datos
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: dataView === 'tabla' }"
            type="button"
            @click="dataView = 'tabla'"
          >
            Ver tabla
          </button>
        </div>
      </div>

      <div v-if="dataView === 'input'" class="mapa-localidades__data-input">
        <div class="mapa-localidades__data-input-header">
          <label class="form-label" for="localidades-valores-text">
            Pegar datos desde Excel
          </label>
          <button class="btn btn-primary" type="button" @click="updateLocalidadesValores">
            Actualizar
          </button>
        </div>
        <textarea
          id="localidades-valores-text"
          v-model="pastedDataText"
          class="form-control"
          rows="8"
          placeholder="localidad_cod&#9;valor&#10;1&#9;72&#10;2&#9;38"
        ></textarea>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle">
          <thead>
            <tr>
              <th scope="col">Código localidad</th>
              <th scope="col">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in localidadesValores" :key="item.localidad_cod">
              <td>{{ item.localidad_cod }}</td>
              <td>{{ item.valor }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          class="toast align-items-center text-bg-primary border-0"
          :class="{ show: showToast }"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div class="d-flex">
            <div class="toast-body">{{ toastMessage }}</div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              aria-label="Cerrar"
              @click="showToast = false"
            ></button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.mapa-localidades {
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 1.5rem clamp(1rem, 2vw, 2.5rem);
  box-sizing: border-box;
  overflow: hidden;
}

.mapa-localidades h1 {
  margin: 0;
  font-size: clamp(1.75rem, 2vw, 2.5rem);
  font-weight: 700;
  color: #1f2937;
}

.mapa-localidades__header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1.5rem;
}

.mapa-localidades__nav {
  flex: 0 0 auto;
  margin: 0 0 1rem;
}

.mapa-localidades__nav .nav-link {
  color: #475569;
}

.mapa-localidades__nav .nav-link.active {
  color: #1f2937;
  font-weight: 700;
}

.mapa-localidades__map-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  gap: 1.25rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.mapa-localidades__data-container {
  flex: 1 1 auto;
  min-height: 0;
  width: min(100%, 1400px);
  overflow: auto;
}

.mapa-localidades__data-input {
  margin: 0 0 1.25rem;
}

.mapa-localidades__data-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 1rem;
}

.mapa-localidades__data-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 0 0 0.5rem;
}

.mapa-localidades__data-input-header .form-label {
  margin: 0;
}

.mapa-localidades__color-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}

.mapa-localidades__color-controls {
  display: grid;
  gap: 1rem;
  margin: 0;
}

.mapa-localidades__color-control input {
  width: 2.75rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: transparent;
  cursor: pointer;
}

.mapa-localidades__palette {
  align-self: stretch;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #ffffff;
  overflow: auto;
}

.mapa-localidades__accordion {
  margin: 1rem 0 0;
}

.mapa-localidades__accordion .accordion-button {
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  background: #ffffff;
}

.mapa-localidades__accordion .accordion-button:not(.collapsed) {
  color: #1f2937;
  background: #f8fafc;
  box-shadow: inset 0 -1px 0 #e2e8f0;
}

.mapa-localidades__accordion .accordion-body {
  display: grid;
  gap: 0.4rem;
  padding: 0.65rem;
}

.mapa-localidades__palette-option {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.75rem;
  padding: 0.55rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  background: transparent;
  color: #334155;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mapa-localidades__palette-option:hover,
.mapa-localidades__palette-option:focus-visible {
  border-color: #cbd5e1;
  background: #f8fafc;
  outline: none;
}

.mapa-localidades__palette-option--selected {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.mapa-localidades__swatch {
  width: 1.6rem;
  height: 1.6rem;
  flex: 0 0 auto;
  border: 3px solid;
  border-radius: 999px;
}

.mapa-localidades__palette-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.mapa-localidades__transform-controls {
  display: grid;
  gap: 1rem;
  margin: 1rem 0 0;
  padding: 1rem 0 0;
  border-top: 1px solid #e2e8f0;
}

.mapa-localidades__range-control {
  display: grid;
  grid-template-columns: 4.25rem minmax(0, 1fr) 3rem;
  align-items: center;
  gap: 0.75rem;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
}

.mapa-localidades__range-control input {
  min-width: 0;
}

.mapa-localidades__range-control output {
  text-align: right;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .mapa-localidades__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .mapa-localidades__map-container {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }
}
</style>
