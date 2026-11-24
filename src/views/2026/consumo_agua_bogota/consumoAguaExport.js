import { resumirPeriodosConsumo } from './consumoAgua.js'

// Tabulaciones entre columnas y saltos de línea entre filas para pegar en hojas de cálculo.
export const crearTablaConsumoTsv = (periodos) => {
  const resumen = resumirPeriodosConsumo(periodos)
  const formatoNumero = new Intl.NumberFormat('es-CO', {
    useGrouping: false,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
  const filas = [
    ['Período', 'Consumo (m³)', 'Cantidad de cuentas', 'Consumo promedio (m³/cuenta)'],
    ...periodos.map((periodo) => [
      periodo.etiqueta,
      formatoNumero.format(periodo.consumo_m3),
      String(periodo.cuentas_unicas),
      periodo.consumo_promedio === null ? '' : formatoNumero.format(periodo.consumo_promedio),
    ]),
    [
      'Total',
      formatoNumero.format(resumen.consumo_m3),
      String(resumen.cuentas_maximas),
      resumen.consumo_promedio === null ? '' : formatoNumero.format(resumen.consumo_promedio),
    ],
  ]

  return filas.map((fila) => fila.join('\t')).join('\r\n')
}
