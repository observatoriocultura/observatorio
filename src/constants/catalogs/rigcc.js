// Paleta pastel compartida por el mapa y los gráficos, inspirada en las banderas.
export const RIGCC_COUNTRY_KEYS = Object.freeze({
  ANDORRA: 'AND',
  ARGENTINA: 'ARG',
  BOLIVIA: 'BOL',
  BRASIL: 'BRA',
  CHILE: 'CHL',
  COLOMBIA: 'COL',
  COSTA_RICA: 'CRI',
  CUBA: 'CUB',
  REPUBLICA_DOMINICANA: 'DOM',
  ECUADOR: 'ECU',
  ESPANA: 'ESP',
  GUATEMALA: 'GTM',
  HONDURAS: 'HND',
  MEXICO: 'MEX',
  NICARAGUA: 'NIC',
  PANAMA: 'PAN',
  PERU: 'PER',
  PORTUGAL: 'PRT',
  PARAGUAY: 'PRY',
  EL_SALVADOR: 'SLV',
  URUGUAY: 'URY',
  VENEZUELA: 'VEN',
  PUERTO_RICO: 'PRI',
})

export const RIGCC_DEFAULT_COUNTRY_COLOR = '#C9BDB0'

export const RIGCC_COUNTRIES = Object.freeze([
  { key: RIGCC_COUNTRY_KEYS.ANDORRA, label: 'Andorra', color: '#F3DC9D' },
  { key: RIGCC_COUNTRY_KEYS.ARGENTINA, label: 'Argentina', color: '#AACFE8' },
  { key: RIGCC_COUNTRY_KEYS.BOLIVIA, label: 'Bolivia', color: '#C5D7A5' },
  { key: RIGCC_COUNTRY_KEYS.BRASIL, label: 'Brasil', color: '#ADD3B3' },
  { key: RIGCC_COUNTRY_KEYS.CHILE, label: 'Chile', color: '#E8AAAA' },
  { key: RIGCC_COUNTRY_KEYS.COLOMBIA, label: 'Colombia', color: '#F2D36B' },
  { key: RIGCC_COUNTRY_KEYS.COSTA_RICA, label: 'Costa Rica', color: '#E6ADB6' },
  { key: RIGCC_COUNTRY_KEYS.CUBA, label: 'Cuba', color: '#AEBFE0' },
  { key: RIGCC_COUNTRY_KEYS.REPUBLICA_DOMINICANA, label: 'República Dominicana', color: '#B6C7E0' },
  { key: RIGCC_COUNTRY_KEYS.ECUADOR, label: 'Ecuador', color: '#EEDB8D' },
  { key: RIGCC_COUNTRY_KEYS.ESPANA, label: 'España', color: '#E9B2A1' },
  { key: RIGCC_COUNTRY_KEYS.GUATEMALA, label: 'Guatemala', color: '#B0D9E8' },
  { key: RIGCC_COUNTRY_KEYS.HONDURAS, label: 'Honduras', color: '#B3DCE9' },
  { key: RIGCC_COUNTRY_KEYS.MEXICO, label: 'México', color: '#A8CDB1' },
  { key: RIGCC_COUNTRY_KEYS.NICARAGUA, label: 'Nicaragua', color: '#B4C8E8' },
  { key: RIGCC_COUNTRY_KEYS.PANAMA, label: 'Panamá', color: '#E4B3B7' },
  { key: RIGCC_COUNTRY_KEYS.PERU, label: 'Perú', color: '#E6A6AC' },
  { key: RIGCC_COUNTRY_KEYS.PORTUGAL, label: 'Portugal', color: '#B4CEA7' },
  { key: RIGCC_COUNTRY_KEYS.PARAGUAY, label: 'Paraguay', color: '#DFB3BF' },
  { key: RIGCC_COUNTRY_KEYS.EL_SALVADOR, label: 'El Salvador', color: '#B7D1EB' },
  { key: RIGCC_COUNTRY_KEYS.URUGUAY, label: 'Uruguay', color: '#C4DBE8' },
  { key: RIGCC_COUNTRY_KEYS.VENEZUELA, label: 'Venezuela', color: '#EBD58F' },
  { key: RIGCC_COUNTRY_KEYS.PUERTO_RICO, label: 'Puerto Rico', color: '#B9C5E8' },
])

export function getRigccCountry(value) {
  const key = String(value ?? '')
    .trim()
    .toUpperCase()
  return RIGCC_COUNTRIES.find((country) => country.key === key) || null
}

export function normalizeRigccCountry(value) {
  return getRigccCountry(value)?.key || ''
}

export function getRigccCountryLabel(value) {
  return getRigccCountry(value)?.label || String(value || 'País no informado')
}

export function getRigccCountryColor(value) {
  return getRigccCountry(value)?.color || RIGCC_DEFAULT_COUNTRY_COLOR
}

// Ciudades del demo RIGCC, según la tabla ciudades revisada el 2026-10-22.
// Fuente: https://docs.google.com/spreadsheets/d/1u5BIFNa2XSRZue-0gDyjBi9AAVDKtVFW9rNigwg1MbY/edit?gid=2008151925
// Coordenadas representativas de la ciudad en grados decimales, no de las sedes.
// Las decisiones de asignación de entidades/personas siguen en rigcc_entidades.notas.
export const RIGCC_CITY_KEYS = Object.freeze({
  VALENCIA: 'esp-valencia',
  QUITO: 'ecu-quito',
  MEDELLIN: 'col-medellin',
  BOGOTA: 'col-bogota',
  EL_CARMEN_DE_VIBORAL: 'col-el-carmen-de-viboral',
  LHOSPITALET_DE_LLOBREGAT: 'esp-lhospitalet-de-llobregat',
  VITORIA_GASTEIZ: 'esp-vitoria-gasteiz',
  CIUDAD_DE_MEXICO: 'mex-ciudad-de-mexico',
  RIO_DE_JANEIRO: 'bra-rio-de-janeiro',
  AVELLANEDA: 'arg-avellaneda',
  PARANA: 'arg-parana',
  FORTALEZA: 'bra-fortaleza',
  BUENOS_AIRES: 'arg-buenos-aires',
  VILAMANISCLE: 'esp-vilamaniscle',
  GUAYAQUIL: 'ecu-guayaquil',
  SANTIAGO: 'chl-santiago',
  VILLA_MARIA: 'arg-villa-maria',
  SAN_JUAN: 'pri-san-juan',
  PONCE: 'pri-ponce',
  SANTA_FE: 'arg-santa-fe',
  SALVADOR: 'bra-salvador',
  SAN_SALVADOR: 'slv-san-salvador',
  GUADALAJARA: 'mex-guadalajara',
})

export const RIGCC_CITIES = Object.freeze([
  {
    key: RIGCC_CITY_KEYS.VALENCIA,
    label: 'València',
    pais: 'ESP',
    latitud: 39.47391,
    longitud: -0.37966,
  },
  {
    key: RIGCC_CITY_KEYS.QUITO,
    label: 'Quito',
    pais: 'ECU',
    latitud: -0.22985,
    longitud: -78.52495,
  },
  {
    key: RIGCC_CITY_KEYS.MEDELLIN,
    label: 'Medellín',
    pais: 'COL',
    latitud: 6.245,
    longitud: -75.57151,
  },
  {
    key: RIGCC_CITY_KEYS.BOGOTA,
    label: 'Bogotá',
    pais: 'COL',
    latitud: 4.60971,
    longitud: -74.08175,
  },
  {
    key: RIGCC_CITY_KEYS.EL_CARMEN_DE_VIBORAL,
    label: 'El Carmen de Viboral',
    pais: 'COL',
    latitud: 6.08236,
    longitud: -75.33509,
  },
  {
    key: RIGCC_CITY_KEYS.LHOSPITALET_DE_LLOBREGAT,
    label: 'L’Hospitalet de Llobregat',
    pais: 'ESP',
    latitud: 41.35967,
    longitud: 2.10028,
  },
  {
    key: RIGCC_CITY_KEYS.VITORIA_GASTEIZ,
    label: 'Vitoria-Gasteiz',
    pais: 'ESP',
    latitud: 42.84998,
    longitud: -2.67268,
  },
  {
    key: RIGCC_CITY_KEYS.CIUDAD_DE_MEXICO,
    label: 'Ciudad de México',
    pais: 'MEX',
    latitud: 19.42847,
    longitud: -99.12766,
  },
  {
    key: RIGCC_CITY_KEYS.RIO_DE_JANEIRO,
    label: 'Rio de Janeiro',
    pais: 'BRA',
    latitud: -22.90642,
    longitud: -43.18223,
  },
  {
    key: RIGCC_CITY_KEYS.AVELLANEDA,
    label: 'Avellaneda',
    pais: 'ARG',
    latitud: -34.66018,
    longitud: -58.36744,
  },
  {
    key: RIGCC_CITY_KEYS.PARANA,
    label: 'Paraná',
    pais: 'ARG',
    latitud: -31.73271,
    longitud: -60.52897,
  },
  {
    key: RIGCC_CITY_KEYS.FORTALEZA,
    label: 'Fortaleza',
    pais: 'BRA',
    latitud: -3.71722,
    longitud: -38.54306,
  },
  {
    key: RIGCC_CITY_KEYS.BUENOS_AIRES,
    label: 'Buenos Aires',
    pais: 'ARG',
    latitud: -34.61315,
    longitud: -58.37723,
  },
  {
    key: RIGCC_CITY_KEYS.VILAMANISCLE,
    label: 'Vilamaniscle',
    pais: 'ESP',
    latitud: 42.37641,
    longitud: 3.06713,
  },
  {
    key: RIGCC_CITY_KEYS.GUAYAQUIL,
    label: 'Guayaquil',
    pais: 'ECU',
    latitud: -2.19616,
    longitud: -79.88621,
  },
  {
    key: RIGCC_CITY_KEYS.SANTIAGO,
    label: 'Santiago',
    pais: 'CHL',
    latitud: -33.45694,
    longitud: -70.64827,
  },
  {
    key: RIGCC_CITY_KEYS.VILLA_MARIA,
    label: 'Villa María',
    pais: 'ARG',
    latitud: -32.40751,
    longitud: -63.24016,
  },
  {
    key: RIGCC_CITY_KEYS.SAN_JUAN,
    label: 'San Juan',
    pais: 'PRI',
    latitud: 18.46633,
    longitud: -66.10572,
  },
  {
    key: RIGCC_CITY_KEYS.PONCE,
    label: 'Ponce',
    pais: 'PRI',
    latitud: 18.01031,
    longitud: -66.62398,
  },
  {
    key: RIGCC_CITY_KEYS.SANTA_FE,
    label: 'Santa Fe',
    pais: 'ARG',
    latitud: -31.64881,
    longitud: -60.70868,
  },
  {
    key: RIGCC_CITY_KEYS.SALVADOR,
    label: 'Salvador',
    pais: 'BRA',
    latitud: -12.97563,
    longitud: -38.49096,
  },
  {
    key: RIGCC_CITY_KEYS.SAN_SALVADOR,
    label: 'San Salvador',
    pais: 'SLV',
    latitud: 13.68935,
    longitud: -89.18718,
  },
  {
    key: RIGCC_CITY_KEYS.GUADALAJARA,
    label: 'Guadalajara',
    pais: 'MEX',
    latitud: 20.67738,
    longitud: -103.34749,
  },
])

export const RIGCC_CITY_LABELS = Object.freeze(
  Object.fromEntries(RIGCC_CITIES.map(({ key, label }) => [key, label])),
)

const normalizeCityValue = (value) =>
  String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es')

// Acepta una key o un nombre conocido. El país corresponde al código de la hoja (COL, ESP…).
// Si un nombre coincide con varias ciudades, se requiere el país para resolverlo.
export function getRigccCity(value, pais = '') {
  const normalized = normalizeCityValue(value)
  const country = String(pais ?? '')
    .trim()
    .toUpperCase()
  if (!normalized) return null

  const matches = RIGCC_CITIES.filter(
    (city) =>
      (!country || city.pais === country) &&
      (city.key === normalized || normalizeCityValue(city.label) === normalized),
  )

  return matches.length === 1 ? matches[0] : null
}

export function normalizeRigccCity(value, pais = '') {
  return getRigccCity(value, pais)?.key || ''
}

export function getRigccCityLabel(value, pais = '') {
  return RIGCC_CITY_LABELS[normalizeRigccCity(value, pais)] || String(value || 'Sin ciudad')
}
