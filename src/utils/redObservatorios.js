import { fetchGoogleSheetCsv } from './googleSheets.js'

export const RED_OBSERVATORIOS_SOURCE = Object.freeze({
  fileId: '1u5BIFNa2XSRZue-0gDyjBi9AAVDKtVFW9rNigwg1MbY',
  gid: '355605787',
})

const catalogos = {
  tipo_actor: {
    entidad: 'Entidad',
    persona: 'Persona',
  },
  tipo_entidad: {
    entidad: 'Entidad',
    observatorio: 'Observatorio',
    'grupo-investigacion': 'Grupo de investigación',
    red: 'Red',
    'persona-investigacion': 'Investigador/a',
    otro: 'Otro',
  },
  naturaleza_institucional: {
    gobierno: 'Gobierno',
    universidad: 'Universidad',
    'organizacion-independiente': 'Organización independiente',
    'persona-investigacion': 'Investigador/a',
    otro: 'Otro',
  },
  escala_territorial: {
    local: 'Local',
    regional: 'Regional',
    nacional: 'Nacional',
    multiescalar: 'Multiescalar',
    iberoamericana: 'Iberoamericana',
  },
}

export const getEntityFieldLabel = (field, value) => {
  return catalogos[field]?.[value] || value || 'No informado'
}

// Los enlaces de la hoja se usan directamente en href/src: admitir solo HTTP(S).
export const getEntityUrl = (value) => {
  const text = String(value ?? '').trim()

  if (!text) return ''

  try {
    const url = new URL(/^www\./i.test(text) ? `https://${text}` : text)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export const normalizeEntities = (rows) => {
  const ids = new Set()

  return rows
    .filter((row) => String(row.nombre ?? '').trim())
    .map((row) => {
      const fields = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, String(value ?? '').trim()]),
      )

      if (!fields.id || ids.has(fields.id)) {
        throw new Error(
          'El directorio contiene entidades sin identificador o con identificadores duplicados.',
        )
      }

      ids.add(fields.id)

      return {
        ...fields,
        pais_territorio: (fields.pais_territorio || '').toUpperCase(),
        url_principal: getEntityUrl(fields.url_principal),
        logo_url: getEntityUrl(fields.logo_url),
      }
    })
}

export const fetchRedObservatoriosEntities = async () => {
  const rows = await fetchGoogleSheetCsv({
    ...RED_OBSERVATORIOS_SOURCE,
    requiredHeaders: [
      'id',
      'nombre',
      'tipo_actor',
      'tipo_entidad',
      'pais_territorio',
      'descripcion',
    ],
  })

  return normalizeEntities(rows)
}
