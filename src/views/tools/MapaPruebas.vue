<template>
  <main class="mapa-pruebas">
    <header class="mapa-pruebas__toolbar">
      <button class="mapa-pruebas__button" type="button">Reset</button>
    </header>

    <section class="mapa-pruebas__map">
      <MapLibreA :localidades-valores="localidadesValores" />
    </section>
  </main>
</template>

<script setup>
import MapLibreA from '../../components/mapas/MapLibreA.vue'

const localidadesValores = [
  { LocCodigo: '01', valor: 84 },
  { LocCodigo: '02', valor: 57 },
  { LocCodigo: '03', valor: 73 },
  { LocCodigo: '04', valor: 41 },
  { LocCodigo: '05', valor: 92 },
  { LocCodigo: '06', valor: 36 },
  { LocCodigo: '07', valor: 68 },
  { LocCodigo: '08', valor: 79 },
  { LocCodigo: '09', valor: 48 },
  { LocCodigo: '10', valor: 100 },
  { LocCodigo: '11', valor: 95 },
  { LocCodigo: '12', valor: 29 },
  { LocCodigo: '13', valor: 54 },
  { LocCodigo: '14', valor: 33 },
  { LocCodigo: '15', valor: 46 },
  { LocCodigo: '16', valor: 71 },
  { LocCodigo: '17', valor: 5 },
  { LocCodigo: '18', valor: 66 },
  { LocCodigo: '19', valor: 88 },
]
</script>

<style scoped>
.mapa-pruebas {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mapa-pruebas__toolbar {
  height: 50px;
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  border-bottom: 1px solid #1f2937;
  background: #0f172a;
}

.mapa-pruebas__button {
  height: 34px;
  padding: 0 0.9rem;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  background: #1e293b;
  color: #f8fafc;
  font: inherit;
  cursor: pointer;
}

.mapa-pruebas__button:hover,
.mapa-pruebas__button:focus-visible {
  border-color: #7dd3fc;
  background: #334155;
  outline: none;
}

.mapa-pruebas__map {
  flex: 1 1 auto;
  min-height: 0;
}

.mapa-pruebas :deep(.map) {
  width: 100%;
  height: 100%;
}
</style>
