import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  GRUPOS,
  crearEstadoGrupo,
  ordenarSubindices,
} from '../src/views/2026/indice_derechos_culturales/configuracion.js'
import {
  crearRanking,
  COLORES_POR_PUESTO,
} from '../src/views/2026/indice_derechos_culturales/compartidos/ranking.js'

const leer = (nombre) =>
  JSON.parse(
    readFileSync(
      new URL(
        `../public/content/2026/indice_derechos_culturales_datos/${nombre}.json`,
        import.meta.url,
      ),
      'utf8',
    ),
  )
const subindices = leer('subindices')
const localidades = leer('localidades')
const valores = leer('valores')

test('cada indicador tiene exactamente un valor para Bogotá y cada una de las 20 localidades', () => {
  const codigos = new Set(subindices.map((item) => item.codigo))
  const territorios = localidades
    .filter((item) => item.es_localidad === 1 || item.cod_localidad === 97)
    .map((item) => item.cod_localidad)
    .sort((a, b) => a - b)
  assert.equal(codigos.size, 18)
  assert.equal(valores.length, 378)
  assert.equal(
    new Set(valores.map((item) => `${item.codigo}:${item.cod_localidad}`)).size,
    valores.length,
  )
  for (const valor of valores) {
    assert.ok(codigos.has(valor.codigo))
    assert.ok(Number.isFinite(valor.valor) && valor.valor >= 0 && valor.valor <= 1)
    assert.equal(
      localidades.find((item) => item.cod_localidad === valor.cod_localidad)?.nombre,
      valor.localidad,
    )
  }
  for (const codigo of codigos) {
    assert.deepEqual(
      valores
        .filter((item) => item.codigo === codigo)
        .map((item) => item.cod_localidad)
        .sort((a, b) => a - b),
      territorios,
    )
  }
})

test('cada matriz empieza por su propio índice total y contiene solo su familia de subíndices', () => {
  assert.deepEqual(
    ordenarSubindices(
      subindices.filter((item) => item.grupo === 'IDC'),
      'IDC',
    ).map((item) => item.codigo),
    ['IDC', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  )
  assert.deepEqual(
    ordenarSubindices(
      subindices.filter((item) => item.grupo === 'IHC'),
      'IHC',
    ).map((item) => item.codigo),
    ['IHC', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08', 'H09', 'H10'],
  )
})

test('los dos índices coinciden con el promedio de sus subíndices dentro de la precisión de la fuente', () => {
  for (const grupo of Object.values(GRUPOS)) {
    const codigos = subindices
      .filter((item) => item.grupo === grupo.codigo && item.codigo !== grupo.codigoTotal)
      .map((item) => item.codigo)
    for (const total of valores.filter((item) => item.codigo === grupo.codigoTotal)) {
      const partes = valores.filter(
        (item) => codigos.includes(item.codigo) && item.cod_localidad === total.cod_localidad,
      )
      const promedio = partes.reduce((suma, item) => suma + item.valor, 0) / partes.length
      assert.ok(Math.abs(promedio - total.valor) < 1e-9, `${grupo.codigo}: ${total.localidad}`)
    }
  }
})

test('IHC tiene ranking propio y Bogotá conserva el valor publicado fuera de las 20 posiciones', () => {
  const idc = crearRanking(localidades, valores, 'IDC')
  const ihc = crearRanking(localidades, valores, 'IHC')
  assert.equal(idc.localidades[0].nombre, 'La Candelaria')
  assert.equal(ihc.localidades[0].nombre, 'Sumapaz')
  assert.equal(ihc.bogota.valor, 0.4806137512)
  assert.equal(ihc.bogota.posicion, null)
  assert.deepEqual(
    ihc.localidades.map((item) => item.posicion),
    Array.from({ length: 20 }, (_, i) => i + 1),
  )
  assert.ok(!ihc.localidades.some((item) => item.codigo === 97))
})

test('el color de una localidad depende del puesto en cada columna y no del orden de la matriz', () => {
  const ihc = crearRanking(localidades, valores, 'IHC')
  const h01 = crearRanking(localidades, valores, 'H01')
  const sumapazIhc = ihc.localidades.find((item) => item.codigo === 20)
  const sumapazH01 = h01.localidades.find((item) => item.codigo === 20)
  assert.equal(sumapazIhc.color, COLORES_POR_PUESTO[0])
  assert.notEqual(sumapazIhc.color, sumapazH01.color)
  assert.equal(sumapazH01.color, COLORES_POR_PUESTO[sumapazH01.posicion - 1])
  assert.equal(
    ihc.bogota.color,
    COLORES_POR_PUESTO[
      Math.min(20, 1 + ihc.localidades.filter((item) => item.valor > ihc.bogota.valor).length) - 1
    ],
  )
})

test('las selecciones y los criterios de ordenación de los grupos son independientes', () => {
  const idc = crearEstadoGrupo(GRUPOS.IDC)
  const ihc = crearEstadoGrupo(GRUPOS.IHC)
  idc.indice = 'C3'
  idc.ordenMatrizPor = 'C5'
  idc.ordenMatrizAsc = true
  assert.equal(ihc.indice, 'IHC')
  assert.equal(ihc.ordenMatrizPor, 'IHC')
  assert.equal(ihc.ordenMatrizAsc, false)
})
