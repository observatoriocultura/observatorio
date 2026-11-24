import assert from 'node:assert/strict'
import test from 'node:test'
import {
  crearSeriesConsumoPorDimension,
  filtrarConsumosPorClaseUso,
  filtrarConsumosPorEstrato,
  filtrarConsumosPorLocalidad,
  prepararConsumos,
  resumirPeriodosConsumo,
} from './consumoAgua.js'
import { crearTablaConsumoTsv } from './consumoAguaExport.js'

const consumos = prepararConsumos([
  {
    periodo: '2024-01',
    clase_uso_cod: '101',
    localidad_cod: '1',
    estrato: '1',
    consumo_m3: '10',
    cuentas_unicas: '1',
  },
  {
    periodo: '2024-01',
    clase_uso_cod: '101',
    localidad_cod: '1',
    estrato: '1',
    consumo_m3: '90',
    cuentas_unicas: '3',
  },
  {
    periodo: '2024-01',
    clase_uso_cod: '102',
    localidad_cod: '2',
    estrato: '6',
    consumo_m3: '20',
    cuentas_unicas: '2',
  },
  {
    periodo: '2024-02',
    clase_uso_cod: '101',
    localidad_cod: '2',
    estrato: '2',
    consumo_m3: '9',
    cuentas_unicas: '3',
  },
  {
    periodo: '2024-03',
    clase_uso_cod: '102',
    localidad_cod: '2',
    estrato: '3',
    consumo_m3: '0',
    cuentas_unicas: '0',
  },
  {
    periodo: '2025-12',
    clase_uso_cod: '103',
    localidad_cod: '1',
    estrato: '2',
    consumo_m3: '8',
    cuentas_unicas: '1',
  },
])
const catalogos = {
  clasesUso: [
    { clase_uso_cod: 102, clase_uso: 'Comercial' },
    { clase_uso_cod: 101, clase_uso: 'Residencial' },
    { clase_uso_cod: 104, clase_uso: 'Oficial' },
  ],
  localidades: [
    { localidad_cod: 1, nombre: 'Usaquén' },
    { localidad_cod: 2, nombre: 'Chapinero' },
    { localidad_cod: 20, nombre: 'Sumapaz' },
  ],
}

test('El resumen muestra el máximo mensual y divide por la suma de cuentas, no por el máximo', () => {
  const [serie] = crearSeriesConsumoPorDimension(consumos)
  const resumen = resumirPeriodosConsumo(serie.periodos)
  assert.deepEqual(resumen, {
    consumo_m3: 137,
    cuentas_maximas: 6,
    cuentas_acumuladas: 10,
    consumo_promedio: 13.7,
  })
  assert.equal(
    crearTablaConsumoTsv(serie.periodos).split('\r\n').at(-1),
    'Total\t137,000\t6\t13,700',
  )
})

test('El resumen se adapta a los filtros y devuelve promedio nulo cuando no hay cuentas', () => {
  const [serie] = crearSeriesConsumoPorDimension(filtrarConsumosPorClaseUso(consumos, 101))
  assert.deepEqual(resumirPeriodosConsumo(serie.periodos), {
    consumo_m3: 109,
    cuentas_maximas: 4,
    cuentas_acumuladas: 7,
    consumo_promedio: 109 / 7,
  })
  assert.deepEqual(resumirPeriodosConsumo([]), {
    consumo_m3: 0,
    cuentas_maximas: 0,
    cuentas_acumuladas: 0,
    consumo_promedio: null,
  })
  assert.equal(crearTablaConsumoTsv([]).split('\r\n').at(-1), 'Total\t0,000\t0\t')
})

test('Ninguna produce una sola serie mensual con el cociente de los totales', () => {
  const [serie] = crearSeriesConsumoPorDimension(consumos)
  assert.equal(serie.id, 'total')
  assert.equal(serie.periodos.length, 24)
  assert.equal(serie.periodos[0].consumo_m3, 120)
  assert.equal(serie.periodos[0].cuentas_unicas, 6)
  assert.equal(serie.periodos[0].consumo_promedio, 20)
  assert.equal(serie.periodos.at(-1).id, 202512)
})

test('Las clases usan el catálogo, conservan códigos desconocidos y calculan promedios por grupo', () => {
  const series = crearSeriesConsumoPorDimension(consumos, 'clase_uso', catalogos)
  assert.deepEqual(
    series.map((serie) => serie.nombre),
    ['Residencial', 'Comercial', 'Clase de uso 103'],
  )
  assert.equal(series[0].periodos[0].consumo_promedio, 25)
  assert.notEqual(series[0].periodos[0].consumo_promedio, (10 / 1 + 90 / 3) / 2)
  assert.equal(series[1].periodos[2].consumo_promedio, null)
})

test('Localidad y estrato mantienen las 24 posiciones mensuales y todos los estratos presentes', () => {
  const localidades = crearSeriesConsumoPorDimension(consumos, 'localidad', catalogos)
  assert.deepEqual(
    localidades.map((serie) => serie.nombre),
    ['Usaquén', 'Chapinero'],
  )
  const estratos = crearSeriesConsumoPorDimension(consumos, 'estrato', catalogos)
  assert.deepEqual(
    estratos.map((serie) => serie.nombre),
    ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 6'],
  )
  for (const serie of [...localidades, ...estratos]) {
    assert.equal(serie.periodos.length, 24)
    assert.equal(serie.periodos[0].id, 202401)
    assert.equal(serie.periodos[11].id, 202412)
    assert.equal(serie.periodos[12].id, 202501)
    assert.equal(serie.periodos[11].consumo_m3, 0)
    assert.equal(serie.periodos[11].cuentas_unicas, 0)
    assert.equal(serie.periodos[11].consumo_promedio, null)
  }
})

test('Los desgloses conservan las sumas mensuales de consumo y cuentas', () => {
  const [total] = crearSeriesConsumoPorDimension(consumos)
  for (const dimension of ['clase_uso', 'localidad', 'estrato']) {
    const series = crearSeriesConsumoPorDimension(consumos, dimension, catalogos)
    for (let mes = 0; mes < 24; mes++) {
      assert.equal(
        series.reduce((suma, serie) => suma + serie.periodos[mes].consumo_m3, 0),
        total.periodos[mes].consumo_m3,
      )
      assert.equal(
        series.reduce((suma, serie) => suma + serie.periodos[mes].cuentas_unicas, 0),
        total.periodos[mes].cuentas_unicas,
      )
    }
  }
})

test('El desglose respeta la intersección de filtros y las selecciones sin datos', () => {
  const filtrados = filtrarConsumosPorEstrato(
    filtrarConsumosPorLocalidad(filtrarConsumosPorClaseUso(consumos, 101), 1),
    1,
  )
  for (const dimension of ['clase_uso', 'localidad', 'estrato']) {
    const series = crearSeriesConsumoPorDimension(filtrados, dimension, catalogos)
    assert.equal(series.length, 1)
    assert.equal(series[0].periodos[0].consumo_m3, 100)
    assert.equal(series[0].periodos[0].consumo_promedio, 25)
    assert.deepEqual(crearSeriesConsumoPorDimension([], dimension, catalogos), [])
  }
  assert.throws(() => crearSeriesConsumoPorDimension(consumos, 'inexistente'))
})
