import assert from 'node:assert/strict'
import test from 'node:test'
import { RIGCC_CITIES } from '../src/constants/catalogs/index.js'
import { createObservatoriosMapData } from '../src/utils/redObservatoriosMapa.js'

test('agrupa entidades y personas de la misma ciudad sin perder sus fichas', () => {
  const entities = [
    { id: '1', nombre: 'Observatorio', ciudad: 'Bogotá', pais_territorio: 'COL' },
    { id: '2', nombre: 'Investigadora', ciudad: ' BOGOTA ', pais_territorio: 'col' },
    { id: '3', nombre: 'Red', ciudad: 'col-bogota', pais_territorio: 'COL' },
  ]
  const data = createObservatoriosMapData(entities)
  assert.equal(data.groups.length, 1)
  assert.deepEqual(data.groups[0].entities, entities)
  assert.equal(data.geojson.features[0].properties.count, 3)
  assert.deepEqual(data.geojson.features[0].geometry.coordinates, [-74.08175, 4.60971])
  assert.equal(data.unlocated.length, 0)
})

test('conserva los registros sin ubicación y evita asignarlos a otro país o a una capital', () => {
  const entities = [
    { id: '1', ciudad: 'Bogotá', pais_territorio: 'MEX' },
    { id: '2', ciudad: '', pais_territorio: 'COL' },
    { id: '3', ciudad: 'Ciudad desconocida', pais_territorio: 'ESP' },
    { id: '4', ciudad: 'Bogotá' },
    { id: '5', ciudad: 'Bogotá', pais_territorio: '   ' },
  ]
  const data = createObservatoriosMapData(entities)
  assert.deepEqual(data.unlocated, entities)
  assert.deepEqual(data.geojson.features, [])
})

test('ubica todas las ciudades del catálogo y reconstruye los puntos cuando cambian los datos', () => {
  const entities = RIGCC_CITIES.map((city) => ({
    id: city.key,
    ciudad: city.label,
    pais_territorio: city.pais,
  }))
  const data = createObservatoriosMapData(entities)
  assert.equal(data.groups.length, RIGCC_CITIES.length)
  assert.equal(data.unlocated.length, 0)
  assert.equal(new Set(data.geojson.features.map((f) => f.id)).size, RIGCC_CITIES.length)
  assert.deepEqual(createObservatoriosMapData([]).geojson.features, [])
  assert.equal(data.groups.flatMap((group) => group.entities).length, entities.length)
})
