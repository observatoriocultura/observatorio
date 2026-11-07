import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PILOT_MONTHS,
  summarizeAvisosByBarrio,
  summarizeAvisosByBarrioAndMonth,
} from '../src/views/2026/avisos_residuos_seguimiento/avisosResiduos.js'

const barrios = [{ id: '1', nombre_barrio: 'Belén' }]
const aviso = (estado_aviso, hora_aviso) => ({ barrio_id: '1', estado_aviso, hora_aviso })

test('calcula los indicadores horarios sin alterar el conteo de avisos', () => {
  const [summary] = summarizeAvisosByBarrio(
    [
      aviso('Sí', '8:00'),
      aviso('SI', '08:10:00'),
      aviso('Sí', '08:20'),
      aviso('Sí', '24:00'),
      aviso('Sí', ''),
      aviso('No', '10:00'),
      aviso('-', '12:00'),
    ],
    barrios,
  )

  assert.equal(summary.completed, 5)
  assert.equal(summary.missed, 1)
  assert.equal(summary.compliance, 5 / 6)
  assert.equal(summary.horas_validas, 3)
  assert.equal(Math.round(summary.hora_promedio), 490)
  assert.equal(summary.desviacion_estandar_aviso.toFixed(1), '8.2')
})

test('conserva la cercanía entre las horas a ambos lados de medianoche', () => {
  const [summary] = summarizeAvisosByBarrio([aviso('Sí', '23:55'), aviso('Sí', '00:05')], barrios)

  assert.equal(Math.round(summary.hora_promedio) % 1440, 0)
  assert.equal(summary.desviacion_estandar_aviso.toFixed(1), '5.0')
})

test('distingue la falta de horas válidas de una dispersión observada de cero', () => {
  const [empty] = summarizeAvisosByBarrio([aviso('Sí', '-')], barrios)
  const [single] = summarizeAvisosByBarrio([aviso('Sí', '00:00')], barrios)
  const [identical] = summarizeAvisosByBarrio([aviso('Sí', '00:00'), aviso('Sí', '0:00')], barrios)

  assert.equal(empty.hora_promedio, null)
  assert.equal(empty.desviacion_estandar_aviso, null)
  assert.equal(single.hora_promedio, 0)
  assert.equal(single.desviacion_estandar_aviso, null)
  assert.equal(identical.hora_promedio, 0)
  assert.equal(identical.desviacion_estandar_aviso, 0)
})

test('calcula el cumplimiento de la franja sobre los avisos realizados', () => {
  const [summary] = summarizeAvisosByBarrio(
    [
      { ...aviso('Sí', '08:00'), cumple_franja: '1' },
      { ...aviso('Sí', ''), cumple_franja: 1 },
      { ...aviso('Sí', '22:00'), cumple_franja: '0' },
      { ...aviso('Sí', ''), cumple_franja: '' },
      { ...aviso('No', ''), cumple_franja: '1' },
      { ...aviso('–', ''), cumple_franja: '1' },
    ],
    barrios,
  )

  assert.equal(summary.cantidad_avisos_cumple_franja, 2)
  assert.equal(summary.porcentaje_avisos_cumple_franja, 2 / 4)
})

test('distingue cero dentro de la franja de la ausencia de avisos realizados', () => {
  const [outside] = summarizeAvisosByBarrio(
    [{ ...aviso('Sí', '22:00'), cumple_franja: 0 }],
    barrios,
  )
  const [none] = summarizeAvisosByBarrio([{ ...aviso('No', ''), cumple_franja: '1' }], barrios)

  assert.equal(outside.cantidad_avisos_cumple_franja, 0)
  assert.equal(outside.porcentaje_avisos_cumple_franja, 0)
  assert.equal(none.cantidad_avisos_cumple_franja, 0)
  assert.equal(none.porcentaje_avisos_cumple_franja, null)
})

test('calcula cada mes del piloto con los avisos de ese barrio y mes', () => {
  const [summary] = summarizeAvisosByBarrioAndMonth(
    [
      { ...aviso('Sí', '23:55'), fecha: '1/6/2026', cumple_franja: '1' },
      { ...aviso('Sí', '00:05'), fecha: '02/06/2026', cumple_franja: '0' },
      { ...aviso('No', ''), fecha: '30/06/2026' },
      { ...aviso('Sí', '10:00'), fecha: '01/07/2026', cumple_franja: '0' },
      { ...aviso('No', ''), fecha: '31/10/2026' },
      { ...aviso('Sí', '12:00'), fecha: '01/11/2026', cumple_franja: '1' },
      { ...aviso('Sí', '12:00'), fecha: '01/06/2025', cumple_franja: '1' },
      { ...aviso('Sí', '12:00'), fecha: '', cumple_franja: '1' },
    ],
    barrios,
  )

  const [june, july, august, september, october] = summary.months
  assert.deepEqual(
    PILOT_MONTHS.map(({ key }) => key),
    ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
  )
  assert.deepEqual(
    summary.months.map((month) => month.completed),
    [2, 1, 0, 0, 0],
  )
  assert.equal(june.missed, 1)
  assert.equal(june.compliance, 2 / 3)
  assert.equal(june.desviacion_estandar_aviso.toFixed(1), '5.0')
  assert.equal(june.porcentaje_avisos_cumple_franja, 1 / 2)
  assert.equal(july.desviacion_estandar_aviso, null)
  assert.equal(july.porcentaje_avisos_cumple_franja, 0)
  assert.equal(august.compliance, null)
  assert.equal(september.compliance, null)
  assert.equal(october.compliance, 0)
  assert.equal(october.porcentaje_avisos_cumple_franja, null)
})

test('conserva los barrios de la tabla general aunque queden fuera del piloto', () => {
  const catalog = [...barrios, { id: '2', nombre_barrio: 'Centenario' }]
  const [belen, centenario, sanFelipe, villa] = summarizeAvisosByBarrioAndMonth(
    [
      { ...aviso('Sí', '08:00'), barrio: 'Nombre anterior', fecha: '01/08/2026' },
      { ...aviso('No', ''), barrio_id: '2', fecha: '01/08/2026' },
      { ...aviso('Sí', '07:00'), barrio_id: '3', barrio: 'Villa Emilia', fecha: '01/09/2026' },
      { ...aviso('Sí', '07:00'), barrio_id: '4', barrio: 'San Felipe', fecha: '01/11/2026' },
    ],
    catalog,
  )

  assert.equal(belen.name, 'Belén')
  assert.equal(belen.months[2].compliance, 1)
  assert.equal(centenario.months[2].compliance, 0)
  assert.equal(sanFelipe.key, 'id:4')
  assert.deepEqual(sanFelipe.months, [null, null, null, null, null])
  assert.equal(villa.months[2], null)
  assert.equal(villa.months[3].compliance, 1)
})
