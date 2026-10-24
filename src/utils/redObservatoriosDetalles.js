import {
  RIGCC_DETAIL_TYPES,
  getRigccDetailType,
  normalizeRigccDetailType,
} from '../constants/catalogs/index.js'
import { fetchGoogleSheetCsv } from './googleSheets.js'
import { RED_OBSERVATORIOS_SOURCE, getEntityUrl } from './redObservatorios.js'

export const RED_OBSERVATORIOS_DETAILS_SOURCE = Object.freeze({
  fileId: RED_OBSERVATORIOS_SOURCE.fileId,
  gid: '195791648',
})

export function normalizeEntityDetails(rows) {
  const ids = new Set()
  return rows
    .map((row, index) => {
      const fields = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, String(value ?? '').trim()]),
      )
      if (!fields.entidad_id || !fields.titulo) return null
      if (fields.id) {
        if (ids.has(fields.id))
          throw new Error('La hoja de detalles contiene identificadores duplicados.')
        ids.add(fields.id)
      }
      const order = Number(fields.orden)
      return {
        ...fields,
        // La importación actual no tiene IDs: esta clave es solo para la interfaz.
        key: fields.id ? `id:${fields.id}` : `fila:${index + 1}`,
        tipo_detalle: normalizeRigccDetailType(fields.tipo_detalle) || fields.tipo_detalle || '',
        descripcion: fields.descripcion || '',
        contenido: fields.contenido || '',
        url: getEntityUrl(fields.url),
        orden: Number.isInteger(order) && order >= 0 ? order : 0,
        estado_publicacion: fields.estado_publicacion?.toLocaleLowerCase('es') || 'borrador',
      }
    })
    .filter(Boolean)
}

export async function fetchRedObservatoriosDetails() {
  const rows = await fetchGoogleSheetCsv({
    ...RED_OBSERVATORIOS_DETAILS_SOURCE,
    requiredHeaders: ['entidad_id', 'tipo_detalle', 'titulo', 'orden', 'estado_publicacion'],
  })
  return normalizeEntityDetails(rows)
}

export function getEntityDetails(details, entityId, { includeDrafts = false } = {}) {
  const id = String(entityId ?? '').trim()
  if (!id) return []
  return details
    .filter(
      (detail) =>
        detail.entidad_id === id &&
        (detail.estado_publicacion === 'publicado' ||
          (includeDrafts && detail.estado_publicacion === 'borrador')),
    )
    .sort((a, b) => a.orden - b.orden)
}

export function groupEntityDetails(details) {
  const groups = RIGCC_DETAIL_TYPES.map((type) => ({
    ...type,
    items: details.filter((detail) => detail.tipo_detalle === type.key),
  })).filter((group) => group.items.length)
  const unknown = details.filter((detail) => !getRigccDetailType(detail.tipo_detalle))
  if (unknown.length) {
    groups.push({
      key: 'otros',
      label: 'Otro detalle',
      groupLabel: 'Otros detalles',
      icon: 'bi-list-ul',
      items: unknown,
    })
  }
  return groups
}

export function getEntityDetailContent(detail) {
  const content = String(detail.contenido || '').trim()
  const normalize = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
  return [detail.titulo, detail.descripcion].some(
    (value) => normalize(value) === normalize(content),
  )
    ? ''
    : content
}
