import { getRigccCity, getRigccCountryColor } from '../constants/catalogs/index.js'

// Una ubicación por ciudad: los registros coincidentes se consultan en la misma ficha.
export function createObservatoriosMapData(entities) {
  const cities = new Map()
  const unlocated = []

  for (const entity of entities) {
    // La unión requiere ambos campos: no inferir un país ni una capital en la vista.
    const city = String(entity.pais_territorio ?? '').trim()
      ? getRigccCity(entity.ciudad, entity.pais_territorio)
      : null

    if (!city) {
      unlocated.push(entity)
      continue
    }

    if (!cities.has(city.key)) cities.set(city.key, { city, entities: [] })
    cities.get(city.key).entities.push(entity)
  }

  const groups = [...cities.values()].sort((a, b) => a.city.label.localeCompare(b.city.label, 'es'))

  return {
    groups,
    unlocated,
    geojson: {
      type: 'FeatureCollection',
      features: groups.map(({ city, entities }) => ({
        type: 'Feature',
        id: city.key,
        geometry: { type: 'Point', coordinates: [city.longitud, city.latitud] },
        properties: {
          cityKey: city.key,
          country: city.pais,
          color: getRigccCountryColor(city.pais),
          count: entities.length,
        },
      })),
    },
  }
}
