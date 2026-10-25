import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getObservatoriosFanLayout,
  OBSERVATORIOS_FAN_PAGE_SIZE,
} from '../src/utils/redObservatoriosAbanico.js'

test('las seis tarjetas caben sin solaparse y conservan libre la ubicación real', () => {
  assert.equal(OBSERVATORIOS_FAN_PAGE_SIZE, 6)
  const point = Object.freeze({ x: 600, y: 320 })
  for (let count = 1; count <= 6; count++) {
    const layout = getObservatoriosFanLayout({ point, width: 1200, height: 640, count })
    assert.equal(layout.mode, 'radial')
    assert.equal(layout.cards.length, count)
    for (const [index, card] of layout.cards.entries()) {
      assert.ok(card.x >= 0 && card.y >= 0)
      assert.ok(card.x + card.width <= 1200 && card.y + card.height <= 640)
      assert.ok(
        point.x < card.x ||
          point.x > card.x + card.width ||
          point.y < card.y ||
          point.y > card.y + card.height,
      )
      assert.ok(card.endX >= card.x - 1e-8 && card.endX <= card.x + card.width + 1e-8)
      assert.ok(card.endY >= card.y - 1e-8 && card.endY <= card.y + card.height + 1e-8)
      for (const other of layout.cards.slice(index + 1)) {
        assert.ok(
          card.x + card.width <= other.x ||
            other.x + other.width <= card.x ||
            card.y + card.height <= other.y ||
            other.y + other.height <= card.y,
        )
      }
    }
  }
  assert.deepEqual(point, { x: 600, y: 320 })
})

test('ajusta las tarjetas a los bordes superior, inferior y laterales', () => {
  for (const point of [
    { x: 20, y: 20 },
    { x: 1180, y: 620 },
    { x: 600, y: 10 },
    { x: 600, y: 630 },
  ]) {
    const layout = getObservatoriosFanLayout({ point, width: 1200, height: 640, count: 3 })
    assert.equal(layout.mode, 'radial')
    for (const card of layout.cards) {
      assert.ok(card.x >= 0 && card.y >= 0)
      assert.ok(card.x + card.width <= 1200 && card.y + card.height <= 640)
    }
  }
})

test('usa un panel cuando el espacio disponible no permite un abanico legible', () => {
  for (const input of [
    { point: { x: 195, y: 110 }, width: 390, height: 540, count: 6 },
    { point: { x: 600, y: 180 }, width: 1200, height: 360, count: 3 },
    { point: { x: 20, y: 320 }, width: 1200, height: 640, count: 6 },
    { point: { x: 400, y: 260 }, width: 800, height: 520, count: 6 },
  ])
    assert.equal(getObservatoriosFanLayout(input).mode, 'panel')
})

test('oculta el despliegue sin entidades, sin dimensiones o con el punto fuera del mapa', () => {
  for (const input of [
    { point: { x: 600, y: 320 }, width: 1200, height: 640, count: 0 },
    { point: null, width: 1200, height: 640, count: 2 },
    { point: { x: 600, y: 320 }, width: 0, height: 0, count: 2 },
    { point: { x: -1, y: 320 }, width: 1200, height: 640, count: 2 },
    { point: { x: 600, y: 641 }, width: 1200, height: 640, count: 2 },
  ])
    assert.equal(getObservatoriosFanLayout(input).mode, 'hidden')
})
