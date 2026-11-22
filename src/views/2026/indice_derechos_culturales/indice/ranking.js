export const CODIGO_BOGOTA = 97
export const COLOR_SIN_DATOS = '#f5f5f5'

// Una escala pastel fija de 20 puestos: altos en verde, medios en amarillo y bajos en rojo.
export const COLORES_POR_PUESTO = [
  '#b9dfc8',
  '#c1e1c7',
  '#c9e3c6',
  '#d0e5c4',
  '#d8e7c3',
  '#e0e9c2',
  '#e8ebc1',
  '#efedbf',
  '#f7efbe',
  '#fff1bd',
  '#fff1bd',
  '#fdecbe',
  '#fbe6bf',
  '#fae0bf',
  '#f8dbc0',
  '#f6d5c1',
  '#f4d0c2',
  '#f3cac2',
  '#f1c5c3',
  '#efbfc4',
]

export function colorPorPuesto(puesto) {
  return COLORES_POR_PUESTO[puesto - 1] ?? COLOR_SIN_DATOS
}

export function crearRanking(localidades, valores, codigoIndice) {
  const valoresPorLocalidad = new Map(
    valores
      .filter((item) => item.codigo === codigoIndice)
      .map((item) => [Number(item.cod_localidad), item.valor]),
  )
  const registros = localidades
    .filter(
      (item) => Number(item.es_localidad) === 1 || Number(item.cod_localidad) === CODIGO_BOGOTA,
    )
    .map((item) => {
      const valor = valoresPorLocalidad.get(Number(item.cod_localidad))
      return {
        codigo: Number(item.cod_localidad),
        nombre: item.nombre,
        valor: typeof valor === 'number' && Number.isFinite(valor) ? valor : null,
      }
    })

  // Se ordenan los valores originales, sin redondear; los empates se resuelven por código.
  const ordenadas = registros
    .filter((item) => item.codigo !== CODIGO_BOGOTA)
    .sort((a, b) => {
      if (a.valor === null && b.valor === null) return a.codigo - b.codigo
      if (a.valor === null) return 1
      if (b.valor === null) return -1
      return b.valor - a.valor || a.codigo - b.codigo
    })
  const clasificadas = ordenadas.map((item, index) => {
    const posicion = item.valor === null ? null : index + 1
    return { ...item, posicion, color: colorPorPuesto(posicion) }
  })

  const totalConDatos = clasificadas.filter((item) => item.valor !== null).length
  const totalBogota = registros.find((item) => item.codigo === CODIGO_BOGOTA)
  let bogota = null
  if (totalBogota) {
    // Bogotá no se inserta en el ranking: solo toma el color de su puesto equivalente.
    // Por debajo de todas las localidades conserva el color del último puesto disponible.
    const puestoReferencia =
      totalBogota.valor === null || !totalConDatos
        ? null
        : Math.min(
            totalConDatos,
            1 +
              clasificadas.filter((item) => item.valor !== null && item.valor > totalBogota.valor)
                .length,
          )
    bogota = {
      ...totalBogota,
      posicion: null,
      puestoReferencia,
      totalConDatos,
      color: colorPorPuesto(puestoReferencia),
    }
  }
  return { localidades: clasificadas, bogota }
}

export function descripcionColorBogota(bogota) {
  if (!bogota?.puestoReferencia) return 'Sin datos suficientes para asignar un color de referencia.'
  return `Color del puesto equivalente ${bogota.puestoReferencia} entre ${bogota.totalConDatos} localidades. Bogotá no forma parte del ranking.`
}
