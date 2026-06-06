/**
 * Funciones para convertir geometrías GeoJSON en paths SVG.
 * 2026-06-06
 */

// Calcula los limites geograficos totales de un conjunto de features GeoJSON.
export function getGeoJsonBounds(features, padding = 0) {
  const points = features.flatMap((feature) => {
    if (feature.geometry.type === 'Polygon') return feature.geometry.coordinates.flat()
    if (feature.geometry.type === 'MultiPolygon') return feature.geometry.coordinates.flat(2)
    return []
  })

  const boundsWithoutPadding = points.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity,
    },
  )

  return {
    minLng: boundsWithoutPadding.minLng - padding,
    maxLng: boundsWithoutPadding.maxLng + padding,
    minLat: boundsWithoutPadding.minLat - padding,
    maxLat: boundsWithoutPadding.maxLat + padding,
  }
}

// Calcula el ancho y alto del SVG manteniendo la proporcion del mapa original.
export function getSvgMapSize(bounds, width = 800) {
  const longitudeRange = bounds.maxLng - bounds.minLng
  const latitudeRange = bounds.maxLat - bounds.minLat
  const height = (latitudeRange / longitudeRange) * width

  return { width, height }
}

// Genera el atributo viewBox que necesita el SVG para encuadrar el mapa.
export function getSvgViewBox(bounds, width = 800) {
  const size = getSvgMapSize(bounds, width)

  return `0 0 ${size.width} ${size.height}`
}

// Proyecta un punto GeoJSON [longitud, latitud] a coordenadas planas del SVG.
export function projectGeoJsonPoint([lng, lat], bounds, width = 800) {
  const { height } = getSvgMapSize(bounds, width)
  const longitudeRange = bounds.maxLng - bounds.minLng
  const latitudeRange = bounds.maxLat - bounds.minLat

  return [
    ((lng - bounds.minLng) / longitudeRange) * width,
    ((bounds.maxLat - lat) / latitudeRange) * height,
  ]
}

// Convierte un anillo de coordenadas GeoJSON en comandos de path SVG.
export function geoJsonRingToSvgPath(ring, bounds, width = 800) {
  return ring
    .map((point, index) => {
      const [x, y] = projectGeoJsonPoint(point, bounds, width)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
    .concat(' Z')
}

// Convierte una geometria Polygon o MultiPolygon de GeoJSON en un path SVG.
export function geoJsonGeometryToSvgPath(geometry, bounds, width = 800) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => geoJsonRingToSvgPath(ring, bounds, width)).join(' ')
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .flatMap((polygon) => polygon.map((ring) => geoJsonRingToSvgPath(ring, bounds, width)))
      .join(' ')
  }

  return ''
}
