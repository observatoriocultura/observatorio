function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max)
}

function normalizeHexColor(color) {
  if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(color)) return null

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
  }

  return color
}

function hexToRgb(color) {
  const normalizedColor = normalizeHexColor(color)

  if (!normalizedColor) return null

  return {
    r: parseInt(normalizedColor.slice(1, 3), 16),
    g: parseInt(normalizedColor.slice(3, 5), 16),
    b: parseInt(normalizedColor.slice(5, 7), 16),
  }
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

export function interpolateHexColor(colorMin, colorMax, ratio) {
  const startColor = hexToRgb(colorMin)
  const endColor = hexToRgb(colorMax)

  if (!startColor || !endColor) return colorMin

  const safeRatio = clamp(ratio)

  return rgbToHex({
    r: startColor.r + (endColor.r - startColor.r) * safeRatio,
    g: startColor.g + (endColor.g - startColor.g) * safeRatio,
    b: startColor.b + (endColor.b - startColor.b) * safeRatio,
  })
}

export function getScaledHexColor(value, min, max, colorMin, colorMax) {
  if (!Number.isFinite(value)) return colorMin
  if (max === min) return colorMax

  const ratio = (value - min) / (max - min)

  return interpolateHexColor(colorMin, colorMax, ratio)
}
