import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchGoogleSheetCsv } from '../src/utils/googleSheets.js'
import {
  fetchRedObservatoriosEntities,
  getEntityUrl,
  normalizeEntities,
} from '../src/utils/redObservatorios.js'

test('carga la pestaña de entidades y conserva comas, acentos y saltos de línea del CSV', async (t) => {
  const csv =
    '\uFEFFid, nombre ,subtitulo,tipo_actor,tipo_entidad,pais_territorio,descripcion,url_principal\r\n' +
    '1,Observatorio,Universidad,entidad,observatorio, col ,"Cultura, patrimonio\ny creación",https://example.org\r\n' +
    '2,María,,persona,persona-investigacion,ESP,Investigadora,\r\n' +
    ', ,,,,,,\r\n'
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(csv))

  const entities = await fetchRedObservatoriosEntities()
  const url = new URL(fetchMock.mock.calls[0].arguments[0])

  assert.equal(url.pathname, '/spreadsheets/d/1u5BIFNa2XSRZue-0gDyjBi9AAVDKtVFW9rNigwg1MbY/export')
  assert.equal(url.searchParams.get('gid'), '355605787')
  assert.equal(url.searchParams.get('format'), 'csv')
  assert.equal(entities.length, 2)
  assert.equal(entities[0].descripcion, 'Cultura, patrimonio\ny creación')
  assert.equal(entities[0].pais_territorio, 'COL')
  assert.equal(entities[1].nombre, 'María')
  assert.equal(entities[1].tipo_actor, 'persona')
  assert.equal(entities[1].logo_url, '')
})

test('rechaza respuestas de acceso denegado y páginas HTML de Google', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('', { status: 403 }),
  )
  await assert.rejects(fetchRedObservatoriosEntities(), /403/)

  fetchMock.mock.mockImplementation(
    async () => new Response('<!DOCTYPE html><html>Iniciar sesión</html>'),
  )
  await assert.rejects(fetchRedObservatoriosEntities(), /HTML instead of CSV/)
})

test('detecta una pestaña equivocada y CSV con filas incompletas', async (t) => {
  const fetchMock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('Campo,Tipo\nid,uuid'),
  )
  await assert.rejects(fetchRedObservatoriosEntities(), /missing required headers/)

  fetchMock.mock.mockImplementation(async () => new Response('id,nombre\n1,Observatorio,extra'))
  await assert.rejects(fetchGoogleSheetCsv({ fileId: 'test' }), /Could not parse/)
})

test('una fuente vacía con encabezados válidos representa un directorio vacío', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('id,nombre,tipo_actor,tipo_entidad,pais_territorio,descripcion\r\n'),
  )
  assert.deepEqual(await fetchRedObservatoriosEntities(), [])
})

test('impide mezclar identidades cuando faltan identificadores o están duplicados', () => {
  assert.throws(() => normalizeEntities([{ nombre: 'Sin ID' }]), /identificador/)
  assert.throws(
    () =>
      normalizeEntities([
        { id: '1', nombre: 'Primera' },
        { id: '1', nombre: 'Segunda' },
      ]),
    /duplicados/,
  )
})

test('solo permite enlaces web seguros en sitios, perfiles y logos', () => {
  assert.equal(getEntityUrl('javascript:alert(1)'), '')
  assert.equal(getEntityUrl('data:text/html,test'), '')
  assert.equal(getEntityUrl('no es un enlace'), '')
  assert.equal(getEntityUrl(' www.example.org/perfil '), 'https://www.example.org/perfil')
  assert.equal(getEntityUrl('https://example.org/perfil'), 'https://example.org/perfil')
})

test('conserva los slugs de la fuente y da una ruta estable a los registros sin slug', () => {
  const entities = normalizeEntities([
    { id: '1', nombre: 'Observatorio cultural', slug: ' observatorio-cultural ' },
    { id: '2', nombre: 'Otra entidad' },
  ])
  assert.equal(entities[0].slug, 'observatorio-cultural')
  assert.equal(entities[1].slug, 'entidad-2')
  assert.equal(normalizeEntities([{ id: '2', nombre: 'Nombre actualizado' }])[0].slug, 'entidad-2')
})

test('rechaza rutas de perfil ambiguas en lugar de abrir otra entidad', () => {
  assert.throws(
    () =>
      normalizeEntities([
        { id: '1', nombre: 'Primera', slug: 'observatorio' },
        { id: '2', nombre: 'Segunda', slug: 'observatorio' },
      ]),
    /slugs duplicados/,
  )
  assert.throws(
    () =>
      normalizeEntities([
        { id: '1', nombre: 'Primera', slug: 'entidad-2' },
        { id: '2', nombre: 'Segunda' },
      ]),
    /slugs duplicados/,
  )
})
