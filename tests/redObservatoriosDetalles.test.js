import assert from 'node:assert/strict'
import test from 'node:test'
import {
  RIGCC_DETAIL_TYPES,
  RIGCC_DETAIL_TYPE_KEYS,
  getRigccDetailType,
  getRigccDetailTypeLabel,
  normalizeRigccDetailType,
} from '../src/constants/catalogs/index.js'
import {
  fetchRedObservatoriosDetails,
  normalizeEntityDetails,
  getEntityDetails,
  groupEntityDetails,
  getEntityDetailContent,
} from '../src/utils/redObservatoriosDetalles.js'

test('el catálogo resuelve variantes conocidas sin crear tipos nuevos', () => {
  assert.equal(RIGCC_DETAIL_TYPES.length, 7)
  assert.equal(normalizeRigccDetailType(' Investigación '), RIGCC_DETAIL_TYPE_KEYS.RESEARCH)
  assert.equal(
    normalizeRigccDetailType('Capacidad compartida'),
    RIGCC_DETAIL_TYPE_KEYS.SHARED_CAPACITY,
  )
  assert.equal(getRigccDetailTypeLabel('metodologia'), 'Metodología')
  assert.equal(getRigccDetailType('nuevo-tipo'), null)
  assert.equal(normalizeRigccDetailType('nuevo-tipo'), '')
  assert.equal(getRigccDetailTypeLabel('nuevo-tipo'), 'nuevo-tipo')
})

test('lee la pestaña de detalles con CSV multilínea y admite filas sin ID', async (t) => {
  const csv =
    'id,entidad_id,tipo_detalle,titulo,descripcion,contenido,url,orden,estado_publicacion\r\n' +
    ',2,investigacion,Proyecto,,"Primera línea, con coma\nSegunda línea",https://example.org,2,borrador\r\n' +
    ',2,fuente,Entrevistas,,,,1,publicado\r\n'
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(csv))
  const rows = await fetchRedObservatoriosDetails()
  const url = new URL(fetchMock.mock.calls[0].arguments[0])
  assert.equal(url.searchParams.get('gid'), '195791648')
  assert.equal(rows.length, 2)
  assert.equal(rows[0].entidad_id, '2')
  assert.equal(rows[0].contenido, 'Primera línea, con coma\nSegunda línea')
  assert.equal(new Set(rows.map((row) => row.key)).size, 2)
  assert.equal(rows[0].id, '')
})

test('la unión usa el ID de entidad completo y ordena de forma numérica sin mezclar perfiles', () => {
  const rows = normalizeEntityDetails([
    {
      entidad_id: ' 2 ',
      tipo_detalle: 'tema',
      titulo: 'Diez',
      orden: '10',
      estado_publicacion: 'publicado',
    },
    {
      entidad_id: '20',
      tipo_detalle: 'tema',
      titulo: 'De otra entidad',
      orden: '1',
      estado_publicacion: 'publicado',
    },
    {
      entidad_id: '2',
      tipo_detalle: 'tema',
      titulo: 'Dos',
      orden: '2',
      estado_publicacion: 'publicado',
    },
    {
      entidad_id: 'uuid-entidad',
      tipo_detalle: 'tema',
      titulo: 'Con UUID',
      orden: '1',
      estado_publicacion: 'publicado',
    },
  ])
  assert.deepEqual(
    getEntityDetails(rows, 2).map((row) => row.titulo),
    ['Dos', 'Diez'],
  )
  assert.equal(getEntityDetails(rows, 'uuid-entidad')[0].titulo, 'Con UUID')
  assert.deepEqual(getEntityDetails(rows, ''), [])
  assert.equal(rows[0].titulo, 'Diez')
})

test('los borradores son una opción explícita del demo y los archivados se excluyen siempre', () => {
  const rows = normalizeEntityDetails(
    ['publicado', 'borrador', 'archivado', 'desconocido', ''].map((state) => ({
      entidad_id: '2',
      tipo_detalle: 'tema',
      titulo: state || 'Estado vacío',
      estado_publicacion: state,
    })),
  )
  assert.deepEqual(
    getEntityDetails(rows, '2').map((row) => row.titulo),
    ['publicado'],
  )
  assert.deepEqual(
    getEntityDetails(rows, '2', { includeDrafts: true }).map((row) => row.titulo),
    ['publicado', 'borrador', 'Estado vacío'],
  )
})

test('la agrupación conserva todos los detalles y los tipos desconocidos van a Otros detalles', () => {
  const rows = normalizeEntityDetails([
    ...RIGCC_DETAIL_TYPES.map((type) => ({
      entidad_id: '2',
      tipo_detalle: type.key,
      titulo: type.label,
    })),
    { entidad_id: '2', tipo_detalle: 'nuevo-tipo', titulo: 'Dato nuevo' },
  ])
  const groups = groupEntityDetails(rows)
  assert.deepEqual(
    groups.slice(0, 7).map((group) => group.key),
    RIGCC_DETAIL_TYPES.map((type) => type.key),
  )
  assert.equal(groups.at(-1).groupLabel, 'Otros detalles')
  assert.equal(groups.at(-1).items[0].titulo, 'Dato nuevo')
  assert.equal(groups.flatMap((group) => group.items).length, rows.length)
})

test('descarta filas incompletas, normaliza el orden y bloquea enlaces ejecutables', () => {
  const rows = normalizeEntityDetails([
    { entidad_id: '', titulo: 'Sin entidad' },
    { entidad_id: '2', titulo: '' },
    { entidad_id: '2', titulo: 'Enlace inseguro', orden: '-2', url: 'javascript:alert(1)' },
    { entidad_id: '2', titulo: 'Enlace web', orden: 'no-numérico', url: 'www.example.org' },
  ])
  assert.equal(rows.length, 2)
  assert.equal(rows[0].url, '')
  assert.equal(rows[0].orden, 0)
  assert.equal(rows[1].url, 'https://www.example.org/')
  assert.equal(rows[1].orden, 0)
  assert.throws(
    () =>
      normalizeEntityDetails([
        { id: 'id-1', entidad_id: '2', titulo: 'Uno' },
        { id: 'id-1', entidad_id: '3', titulo: 'Dos' },
      ]),
    /identificadores duplicados/,
  )
})

test('evita repetir el título o el resumen sin recortar el contenido ampliado', () => {
  assert.equal(getEntityDetailContent({ titulo: 'Tema cultural', contenido: 'Tema\ncultural' }), '')
  assert.equal(
    getEntityDetailContent({ descripcion: 'Resumen completo', contenido: ' Resumen completo ' }),
    '',
  )
  assert.equal(
    getEntityDetailContent({
      titulo: 'Proyecto',
      contenido: 'Una explicación\ncon varios párrafos.',
    }),
    'Una explicación\ncon varios párrafos.',
  )
})

test('rechaza una pestaña equivocada y propaga errores para permitir reintentar', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('id,nombre\n1,Entidad'))
  await assert.rejects(fetchRedObservatoriosDetails(), /missing required headers/)
  mock.mock.mockImplementation(async () => new Response('', { status: 503 }))
  await assert.rejects(fetchRedObservatoriosDetails(), /503/)
})
