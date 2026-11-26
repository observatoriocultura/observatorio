// Preparación y cálculos compartidos por las vistas del informe.
export const VARIABLES_CONSUMO = [
  { id: 'consumo_m3', nombre: 'Consumo total', unidad: 'm³', decimales: 3 },
  { id: 'cuentas_unicas', nombre: 'Cantidad de cuentas', unidad: 'cuentas', decimales: 0 },
  {
    id: 'consumo_promedio',
    nombre: 'Consumo promedio por cuenta',
    unidad: 'm³/cuenta',
    decimales: 3,
  },
]

export const DESGLOSES_CONSUMO = [
  { id: 'ninguna', nombre: 'Ninguna', campo: null },
  { id: 'clase_uso', nombre: 'Clase de uso', campo: 'clase_uso_cod' },
  { id: 'localidad', nombre: 'Localidad', campo: 'localidad_cod' },
  { id: 'estrato', nombre: 'Estrato', campo: 'estrato' },
]

const nombresMeses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const PERIODOS_CONSUMO = Array.from({ length: 24 }, (_, indice) => {
  const anio = 2024 + Math.floor(indice / 12)
  const mes = (indice % 12) + 1

  return {
    id: anio * 100 + mes,
    anio,
    mes,
    periodo: `${anio}-${String(mes).padStart(2, '0')}`,
    etiqueta: `${nombresMeses[mes - 1]} de ${anio}`,
  }
})

// Identificador mensual AAAAMM; admite "2025-1", "2025-01" y 202501.
export const normalizarPeriodo = (value) => {
  const coincidencia = String(value ?? '')
    .trim()
    .match(/^(\d{4})-?(\d{1,2})$/)
  if (!coincidencia) throw new Error(`Período inválido: ${value}`)

  const anio = Number(coincidencia[1])
  const mes = Number(coincidencia[2])
  if (anio < 1 || mes < 1 || mes > 12) throw new Error(`Período inválido: ${value}`)

  return anio * 100 + mes
}

export const filtrarConsumosPorPeriodo = (consumos, periodo) =>
  periodo === null ? consumos : consumos.filter((registro) => registro.periodo === periodo)

export const filtrarConsumosPorRangoPeriodo = (consumos, inicial, final) =>
  consumos.filter((registro) => registro.periodo >= inicial && registro.periodo <= final)

export const filtrarConsumosPorClaseUso = (consumos, codigo) =>
  codigo === null ? consumos : consumos.filter((registro) => registro.clase_uso_cod === codigo)

export const filtrarConsumosPorLocalidad = (consumos, codigo) =>
  codigo === null ? consumos : consumos.filter((registro) => registro.localidad_cod === codigo)

export const filtrarConsumosPorEstrato = (consumos, estrato) =>
  estrato === null ? consumos : consumos.filter((registro) => registro.estrato === estrato)

// m³ por cuenta: dividir los totales del conjunto filtrado y agrupado, sin redondear.
export const calcularConsumoPromedio = (consumoTotal, cantidadCuentas) => {
  if (!Number.isFinite(consumoTotal) || !Number.isFinite(cantidadCuentas) || cantidadCuentas <= 0) {
    return null
  }

  const promedio = consumoTotal / cantidadCuentas
  return Number.isFinite(promedio) ? promedio : null
}

// Resumen del período filtrado: máximo mensual de cuentas y promedio sobre sus sumas.
export const resumirPeriodosConsumo = (periodos) => {
  let consumoTotal = 0
  let cuentasAcumuladas = 0
  let cuentasMaximas = 0

  for (const periodo of periodos) {
    consumoTotal += periodo.consumo_m3
    cuentasAcumuladas += periodo.cuentas_unicas
    cuentasMaximas = Math.max(cuentasMaximas, periodo.cuentas_unicas)
  }

  return {
    consumo_m3: consumoTotal,
    cuentas_maximas: cuentasMaximas,
    cuentas_acumuladas: cuentasAcumuladas,
    consumo_promedio: calcularConsumoPromedio(consumoTotal, cuentasAcumuladas),
  }
}

// Mantiene los meses solicitados en orden, incluso cuando no tienen registros.
export const sumarConsumoPorPeriodo = (consumos, periodos = PERIODOS_CONSUMO) => {
  const totales = new Map()

  for (const registro of consumos) {
    const total = totales.get(registro.periodo) ?? { consumo_m3: 0, cuentas_unicas: 0 }
    total.consumo_m3 += registro.consumo_m3
    total.cuentas_unicas += registro.cuentas_unicas
    totales.set(registro.periodo, total)
  }

  return periodos.map((periodo) => {
    const total = totales.get(periodo.id) ?? { consumo_m3: 0, cuentas_unicas: 0 }

    return {
      ...periodo,
      ...total,
      consumo_promedio: calcularConsumoPromedio(total.consumo_m3, total.cuentas_unicas),
    }
  })
}

// Cada serie conserva los meses solicitados y su propio cociente de sumas.
export const crearSeriesConsumoPorDimension = (
  consumos,
  dimension = 'ninguna',
  { clasesUso = [], localidades = [], periodos = PERIODOS_CONSUMO } = {},
) => {
  const desglose = DESGLOSES_CONSUMO.find((opcion) => opcion.id === dimension)
  if (!desglose) throw new Error(`Dimensión de desglose inválida: ${dimension}`)

  if (!desglose.campo) {
    return [
      {
        id: 'total',
        nombre: 'Total',
        codigo: 0,
        periodos: sumarConsumoPorPeriodo(consumos, periodos),
      },
    ]
  }

  const nombres = new Map(
    dimension === 'clase_uso'
      ? clasesUso.map((clase) => [clase.clase_uso_cod, clase.clase_uso])
      : localidades.map((localidad) => [localidad.localidad_cod, localidad.nombre]),
  )
  const grupos = new Map()

  for (const registro of consumos) {
    const codigo = registro[desglose.campo]
    if (!grupos.has(codigo)) grupos.set(codigo, [])
    grupos.get(codigo).push(registro)
  }

  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([codigo, registros]) => ({
      id: `${dimension}-${codigo}`,
      codigo,
      nombre:
        dimension === 'estrato'
          ? `Estrato ${codigo}`
          : (nombres.get(codigo) ?? `${desglose.nombre} ${codigo}`),
      periodos: sumarConsumoPorPeriodo(registros, periodos),
    }))
}

const normalizarCodigo = (value, dimension = 'clase de uso') => {
  const texto = String(value ?? '').trim()
  const codigo = Number(texto)

  if (!/^\d+$/.test(texto) || !Number.isSafeInteger(codigo)) {
    throw new Error(`Código de ${dimension} inválido: ${value}`)
  }

  return codigo
}

export const parseConsumoM3 = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  const texto = String(value ?? '').trim()
  // La hoja exporta coma decimal y puede incluir puntos de miles.
  const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto

  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d+$/.test(texto) && !/^-?\d+(?:\.\d+)?$/.test(texto)) {
    throw new Error(`Consumo en m³ inválido: ${value}`)
  }

  const consumo = Number(normalizado)
  if (!Number.isFinite(consumo)) throw new Error(`Consumo en m³ inválido: ${value}`)
  return consumo
}

export const parseCuentasUnicas = (value) => {
  const texto = String(value ?? '').trim()
  const cuentas = Number(texto)

  if (!/^\d+$/.test(texto) || !Number.isSafeInteger(cuentas)) {
    throw new Error(`Cantidad de cuentas inválida: ${value}`)
  }

  return cuentas
}

export const prepararClasesUso = (filas) => {
  const codigos = new Set()

  return filas.map((fila) => {
    const codigo = normalizarCodigo(fila.clase_uso_cod)
    const nombre = String(fila.clase_uso ?? '').trim()

    if (!nombre || codigos.has(codigo)) {
      throw new Error(`Clase de uso sin nombre o código duplicado: ${codigo}`)
    }

    codigos.add(codigo)
    return { ...fila, clase_uso_cod: codigo, clase_uso: nombre }
  })
}

export const prepararLocalidades = (filas) => {
  const codigos = new Set()

  return filas.map((fila) => {
    const codigo = normalizarCodigo(fila.localidad_cod, 'localidad')
    const nombre = String(fila.nombre ?? '').trim()

    if (!nombre || codigos.has(codigo)) {
      throw new Error(`Localidad sin nombre o código duplicado: ${codigo}`)
    }

    codigos.add(codigo)
    return { ...fila, localidad_cod: codigo, nombre }
  })
}

export const prepararConsumos = (filas) =>
  filas.map((fila) => ({
    ...fila,
    periodo: normalizarPeriodo(fila.periodo),
    clase_uso_cod: normalizarCodigo(fila.clase_uso_cod),
    localidad_cod: normalizarCodigo(fila.localidad_cod, 'localidad'),
    estrato: normalizarCodigo(fila.estrato, 'estrato'),
    consumo_m3: parseConsumoM3(fila.consumo_m3),
    cuentas_unicas: parseCuentasUnicas(fila.cuentas_unicas),
  }))

// Recibe datos preparados. Incluye clases sin consumo y conserva códigos sin catálogo.
export const sumarConsumoPorClaseUso = (consumos, clasesUso) => {
  const grupos = new Map(
    clasesUso.map((clase) => [
      clase.clase_uso_cod,
      { clase_uso_cod: clase.clase_uso_cod, clase_uso: clase.clase_uso, consumo_m3: 0 },
    ]),
  )

  for (const registro of consumos) {
    const codigo = registro.clase_uso_cod
    if (!grupos.has(codigo)) {
      grupos.set(codigo, {
        clase_uso_cod: codigo,
        clase_uso: `Sin catálogo (${codigo})`,
        consumo_m3: 0,
      })
    }
    grupos.get(codigo).consumo_m3 += registro.consumo_m3
  }

  return [...grupos.values()].sort((a, b) => a.clase_uso_cod - b.clase_uso_cod)
}
