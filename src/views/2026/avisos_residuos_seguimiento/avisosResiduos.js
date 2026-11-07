const trim = (value) => String(value ?? '').trim()

export const PILOT_MONTHS = [
  { key: '2026-06', label: 'Junio' },
  { key: '2026-07', label: 'Julio' },
  { key: '2026-08', label: 'Agosto' },
  { key: '2026-09', label: 'Septiembre' },
  { key: '2026-10', label: 'Octubre' },
]

export const sheetDateToIso = (value) => {
  const match = trim(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return ''

  const [, day, month, year] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const normalizeAvisoState = (value) => {
  const original = trim(value)
  const normalized = original
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized === 'si') {
    return { key: 'yes', value: 2, label: 'Sí se realizó', shortLabel: 'Sí' }
  }

  if (normalized === 'no') {
    return { key: 'no', value: 1, label: 'No se realizó', shortLabel: 'No' }
  }

  if (!normalized || /^[-–—]$/.test(original)) {
    return {
      key: 'not-expected',
      value: 0,
      label: 'No se esperaba aviso',
      shortLabel: 'No programado',
    }
  }

  return {
    key: 'missing',
    value: null,
    label: 'Estado sin información válida',
    shortLabel: 'Sin información',
  }
}

const getBarrioKey = (id, name) => (id ? `id:${id}` : `name:${name}`)

const MINUTES_PER_DAY = 24 * 60
const RADIANS_PER_MINUTE = (2 * Math.PI) / MINUTES_PER_DAY

const parseHoraAviso = (value) => {
  const match = trim(value).match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/)
  if (!match) return null

  const [, hours, minutes, seconds = '0'] = match
  return Number(hours) * 60 + Number(minutes) + Number(seconds) / 60
}

const summarizeHorario = (minutes) => {
  const horas_validas = minutes.length
  let hora_promedio = null
  let desviacion_estandar_aviso = null

  if (horas_validas && minutes.every((minute) => minute === minutes[0])) {
    hora_promedio = minutes[0]
    if (horas_validas > 1) desviacion_estandar_aviso = 0
  } else if (horas_validas) {
    let sine = 0
    let cosine = 0

    // Las horas cercanas a medianoche deben quedar juntas en el ciclo diario.
    for (const minute of minutes) {
      const angle = minute * RADIANS_PER_MINUTE
      sine += Math.sin(angle)
      cosine += Math.cos(angle)
    }

    const resultant = Math.min(1, Math.hypot(sine, cosine) / horas_validas)
    if (resultant > Number.EPSILON) {
      const mean = Math.atan2(sine, cosine) / RADIANS_PER_MINUTE
      hora_promedio = (mean + MINUTES_PER_DAY) % MINUTES_PER_DAY
      desviacion_estandar_aviso = Math.sqrt(-2 * Math.log(resultant)) / RADIANS_PER_MINUTE
    }
  }

  return { horas_validas, hora_promedio, desviacion_estandar_aviso }
}

const createBarrioSummary = (key, name) => ({
  key,
  name,
  completed: 0,
  missed: 0,
  hours: [],
  cantidad_avisos_cumple_franja: 0,
})

export const summarizeAvisosByBarrio = (avisos, barrios) => {
  const summaries = new Map()
  const idsByName = new Map()

  for (const barrio of barrios) {
    const name = trim(barrio.nombre_barrio)
    if (!name) continue

    const id = trim(barrio.id)
    const key = getBarrioKey(id, name)
    summaries.set(key, createBarrioSummary(key, name))

    if (id) {
      const previousId = idsByName.get(name)
      idsByName.set(name, previousId === undefined || previousId === id ? id : null)
    }
  }

  for (const aviso of avisos) {
    const { key: state } = normalizeAvisoState(aviso.estado_aviso)
    if (state !== 'yes' && state !== 'no') continue

    const name = trim(aviso.barrio)
    const id = trim(aviso.barrio_id) || idsByName.get(name)
    const key = getBarrioKey(id, name)
    let summary = summaries.get(key)

    if (!summary) {
      if (!name) continue
      summary = createBarrioSummary(key, name)
      summaries.set(key, summary)
    }

    if (state === 'yes') {
      summary.completed += 1
      if (trim(aviso.cumple_franja) === '1') summary.cantidad_avisos_cumple_franja += 1

      const minute = parseHoraAviso(aviso.hora_aviso)
      if (minute !== null) summary.hours.push(minute)
    } else {
      summary.missed += 1
    }
  }

  return [...summaries.values()]
    .map(({ hours, ...summary }) => {
      const total = summary.completed + summary.missed
      return {
        ...summary,
        compliance: total ? summary.completed / total : null,
        ...summarizeHorario(hours),
        porcentaje_avisos_cumple_franja: summary.completed
          ? summary.cantidad_avisos_cumple_franja / summary.completed
          : null,
      }
    })
    .sort(
      (a, b) =>
        (b.compliance ?? -1) - (a.compliance ?? -1) || a.name.localeCompare(b.name, 'es-CO'),
    )
}

export const summarizeAvisosByBarrioAndMonth = (avisos, barrios) => {
  const avisosByMonth = new Map(PILOT_MONTHS.map(({ key }) => [key, []]))

  for (const aviso of avisos) {
    const month = sheetDateToIso(aviso.fecha).slice(0, 7)
    avisosByMonth.get(month)?.push(aviso)
  }

  const monthlySummaries = PILOT_MONTHS.map(
    ({ key }) =>
      new Map(
        summarizeAvisosByBarrio(avisosByMonth.get(key), barrios).map((row) => [row.key, row]),
      ),
  )

  return summarizeAvisosByBarrio(avisos, barrios)
    .map(({ key, name }) => ({
      key,
      name,
      months: monthlySummaries.map((month) => month.get(key) ?? null),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es-CO'))
}
