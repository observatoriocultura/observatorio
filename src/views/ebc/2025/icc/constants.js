/**
 * Constantes compartidas para el visualizador de datos
 */

export const GRUPOS_EDAD = [
  { id: 2, nombre: '13-28 años', color: '#6698e4' },
  { id: 3, nombre: '29-59 años', color: '#427fda' },
  { id: 4, nombre: '60 años o más', color: '#0F52BA' },
]

/** Helper para obtener el nombre de un grupo de edad por su ID */
export const getNombreGrupoEdad = (id) => {
  const grupo = GRUPOS_EDAD.find((g) => Number(g.id) === Number(id))
  return grupo ? grupo.nombre : `Grupo ${id}`
}

/**
 * Sexos
 */
export const SEXOS = [
  { id: 1, nombre: 'Hombre', color: '#0F52BA' },
  { id: 2, nombre: 'Mujer', color: '#d5c3f0' },
]

/** Helper para obtener el nombre de un sexo por su CÓDIGO */
export const getNombreSexo = (id) => {
  const sexo = SEXOS.find((s) => Number(s.id) === Number(id))
  return sexo ? sexo.nombre : `Sexo ${id}`
}

/**
 * Clases de vivienda
 */
export const CLASES = [
  { id: 1, nombre: 'Urbano', color: '#51698f' },
  { id: 2, nombre: 'Rural', color: '#2dad58' },
]

/** Helper para obtener el nombre de una clase por su CÓDIGO */
export const getNombreClase = (id) => {
  const clase = CLASES.find((s) => Number(s.id) === Number(id))
  return clase ? clase.nombre : `Clase ${id}`
}

/**
 * Paleta de colores para gráficos, según las opciones de respuesta de cada pregunta
 * 2026-03-29
 */
export const PALETAS_COLOR = {
  main: ['#BFA7DC'],
  category: [
    '#BFA7DC',
    '#b7cbe9',
    '#E8D6B8',
    '#A8D4C8',
    '#C3B2E0',
    '#C5DEBA',
    '#7DA9E5',
    '#DEB8C5',
  ],
  scale_asc_4: ['#D9CBEA', '#c1a0e9ff', '#8962bdff', '#654096'],
  scale_desc_4: ['#388E3C', '#00AEEF', '#F9A825', '#D32F2F'],
  boolean_asc_4: ['#cf8b8bff', '#f5dbb1', '#c3e5f1', '#50c878'],
  boolean_desc_4: ['#50c878', '#9cc9ab', '#cf8b8bff', '#D32F2F'],
  boolean_asc_2: ['#dfdbe4ff', '#50c878'],
  boolean_desc_2: ['#dfdbe4ff', '#e0115f'],
  boolean_asc_3: ['#cf8b8bff', '#f5dbb1', '#50c878'],
  yes_no_asc: ['#003366', '#00AEEF'],
  yes_no_desc: ['#BFA7DC', '#e2eaf7'],
  yes_selection: ['#8962bdff', '#FAFAFA'],
  custom_52: ['#CCCCCC', '#cf8b8bff', '#c3e5f1', '#50c878'],
  custom_84: ['#CCCCCC', '#000000', '#D9CBEA', '#50c878'],
  icc_years: ['#D9CBEA', '#8d6abbff', '#ffca28'],
}

/**
 * Colores por año de medición del ICC.
 * Usar para lookup directo: ICC_YEAR_COLORS[2025]
 * El orden del array icc_years en PALETAS_COLOR corresponde a [2021, 2023, 2025].
 */
export const ICC_YEAR_COLORS = {
  2021: '#D9CBEA',
  2023: '#8D6ABB',
  2025: '#FFCA28',
}

/**
 * Helper para obtener la paleta de colores según el tipo de respuesta
 * @param {string} tipo - Tipo de respuesta
 * @returns {string[]} - Paleta de colores
 */
export const getPaletaColor = (tipo) => {
  return PALETAS_COLOR[tipo] || PALETAS_COLOR.category
}

/**
 * Elementos del menú principal de la portada del tablero EBC
 */
export const MENU_PRINCIPAL = [
  {
    number: 1,
    key: 'inclusion-e-identidades-sociales-diversas',
    title: 'Inclusión e identidades sociales diversas',
    description:
      'Preguntas sobre aceptación y apertura hacia diversidad étnica, social, religiosa, de género, discapacidad, origen y grupos vulnerables, evaluando prejuicios y rechazo como vecinos.',
    icon: 'inclusion-e-identidades-sociales-diversas.svg',
    numSection: '3',
    color: '#FF9800',
  },
  {
    number: 2,
    key: 'equidad-de-genero',
    title: 'Equidad de género',
    description:
      'Preguntas sobre estereotipos de roles de género, machismo, violencia doméstica, celos y responsabilidades desiguales en hogar, trabajo y relaciones.',
    icon: 'equidad-de-genero.svg',
    numSection: '4',
    color: '#AB47BC',
  },
  {
    number: 3,
    key: 'cultura-politica-y-ciudadana',
    title: 'Cultura política y ciudadana',
    description:
      'Preguntas sobre participación cívica, conocimiento de mecanismos democráticos, confianza en instituciones, motivación electoral y valoración de la democracia.',
    icon: 'iconos-cultura-politica-y-ciudadana.svg',
    numSection: '6',
    color: '#2196F3',
  },
  {
    number: 4,
    key: 'convivencia-y-cultura-de-paz',
    title: 'Convivencia y cultura de paz',
    description:
      'Preguntas sobre confianza interpersonal, justificación de desobediencia a la ley, importancia de ayudar al otro, percepción de impuestos y libertad de expresión. ',
    icon: 'convivencia-y-cultura-de-paz.svg',
    numSection: '6',
    color: '#FF4081',
  },
  {
    number: 5,
    key: 'espacio-publico',
    title: 'Espacio Público',
    description:
      'Preguntas sobre percepción de limpieza, seguridad, equipamiento y usos de parques, calles y barrios cercanos.',
    icon: 'espacio-publico.svg',
    numSection: '3',
    color: '#00BCD4',
  },
  {
    number: 6,
    key: 'cultura-ambiental',
    title: 'Cultura ambiental',
    description:
      'Preguntas sobre conductas de reciclaje, percepción de zonas verdes, arborización, descuidos ambientales y presencia de fauna en el barrio.',
    icon: 'cultura-ambiental.svg',
    numSection: '9',
    color: '#4CAF50',
  },
  {
    number: 7,
    key: 'movilidad',
    title: 'Movilidad',
    description:
      'Preguntas sobre percepción de seguridad vial, cumplimiento de normas por peatones, ciclistas, vehículos y conexión vial en el entorno.',
    icon: 'movilidad.svg',
    numSection: '10',
    color: '#78909C',
  },
]

/**
 * Imágenes para el carrusel de la portada del tablero
 */
export const IMAGES_CAROUSEL = [
  'movilidad.jpg',
  'cultura-ciudadana.jpg',
  'equidad-de-genero.jpg',
  'espacio-publico.jpg',
  'inclusion-de-identidades.jpg',
  'ambiente.jpg',
]
