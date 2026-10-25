export const OBSERVATORIOS_FAN_PAGE_SIZE = 6

const CARD_WIDTH = 224
const CARD_HEIGHT = 152
const GAP = 16
const POINT_GAP = 70
const MARGIN = 16
const TOP_SPACE = 84
const BOTTOM_SPACE = 64
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// Distribución en píxeles. Las coordenadas geográficas de las entidades no cambian.
export function getObservatoriosFanLayout({ point, width, height, count }) {
  const panel = { mode: 'panel', cards: [] }
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    !point ||
    ![point.x, point.y, width, height].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0
  ) {
    return { mode: 'hidden', cards: [] }
  }
  if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
    return { mode: 'hidden', cards: [] }
  }
  if (width < 760 || height < 500 || count > OBSERVATORIOS_FAN_PAGE_SIZE) return panel

  const canLeft = point.x >= CARD_WIDTH + POINT_GAP + MARGIN
  const canRight = width - point.x >= CARD_WIDTH + POINT_GAP + MARGIN
  if ((!canLeft && !canRight) || ((!canLeft || !canRight) && count > 3)) return panel

  const leftCount = canLeft && canRight ? Math.floor(count / 2) : canLeft ? count : 0
  const rightCount = count - leftCount
  const maxRows = Math.max(leftCount, rightCount)
  const step = CARD_HEIGHT + GAP
  const blockHeight = maxRows * CARD_HEIGHT + (maxRows - 1) * GAP
  if (blockHeight > height - TOP_SPACE - BOTTOM_SPACE) return panel
  const centerY = clamp(
    point.y,
    TOP_SPACE + blockHeight / 2,
    height - BOTTOM_SPACE - blockHeight / 2,
  )

  const offsets = (rows) => {
    if (!rows) return []
    if (rows === 1) return [maxRows === 2 ? -step / 2 : 0]
    const extent = ((maxRows - 1) * step) / 2
    return Array.from({ length: rows }, (_, index) => -extent + (2 * extent * index) / (rows - 1))
  }
  const left = offsets(leftCount).map((y) => ({
    x: point.x - POINT_GAP - CARD_WIDTH,
    y: centerY + y - CARD_HEIGHT / 2,
  }))
  const right = offsets(rightCount).map((y) => ({
    x: point.x + POINT_GAP,
    y: centerY + y - CARD_HEIGHT / 2,
  }))
  // Recorrido alrededor del punto: superior izquierda, lado derecho, inferior izquierda.
  const positions = left.length ? [left[0], ...right, ...left.slice(1).reverse()] : right
  const cards = positions.map(({ x, y }) => {
    const cx = x + CARD_WIDTH / 2
    const cy = y + CARD_HEIGHT / 2
    const dx = point.x - cx
    const dy = point.y - cy
    const scale = Math.min(CARD_WIDTH / 2 / Math.abs(dx), CARD_HEIGHT / 2 / Math.abs(dy))
    return {
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      endX: cx + dx * scale,
      endY: cy + dy * scale,
    }
  })
  return { mode: 'radial', cards }
}
