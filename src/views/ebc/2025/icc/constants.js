/**
 * Constantes compartidas para el visualizador de datos
 */

export const GRUPOS_EDAD = [
  { id: 2, nombre: '13-28 años' },
  { id: 3, nombre: '29-59 años' },
  { id: 4, nombre: '60 años o más' },
]

/** Helper para obtener el nombre de un grupo de edad por su ID */
export const getNombreGrupoEdad = (id) => {
  const grupo = GRUPOS_EDAD.find((g) => Number(g.id) === Number(id))
  return grupo ? grupo.nombre : `Grupo ${id}`
}

/**
 * Paleta de colores para gráficos, según las opciones de respuesta de cada pregunta
 * 2026-03-29
 */
export const PALETAS_COLOR = {
  main: ['#D9CBEA'],
  category: [
    '#D9CBEA',
    '#9BBAE9',
    '#E8D6B8',
    '#A8D4C8',
    '#C3B2E0',
    '#C5DEBA',
    '#7DA9E5',
    '#DEB8C5',
  ],
  scale_asc_4: ['#D9CBEA', '#c1a0e9ff', '#8962bdff', '#654096'],
  scale_desc_4: ['#388E3C', '#00AEEF', '#F9A825', '#D32F2F'],
  boolean_asc_4: ['#D32F2F', '#cf8b8bff', '#9cc9ab', '#50c878'],
  boolean_desc_4: ['#50c878', '#9cc9ab', '#cf8b8bff', '#D32F2F'],
  boolean_asc_2: ['#dfdbe4ff', '#50c878'],
  boolean_desc_2: ['#dfdbe4ff', '#e0115f'],
  yes_no_asc: ['#003366', '#00AEEF'],
  yes_no_desc: ['#654096', '#D9CBEA'],
  custom_84: ['#CCCCCC', '#000000', '#D9CBEA', '#50c878'],
  icc_years: ['#D9CBEA', '#8d6abbff', '#ffca28'],
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
    icon: 'inclusion-e-identidades-sociales-diversas.svg',
    numSection: '3',
    color: '#FF9800',
  },
  {
    number: 2,
    key: 'equidad-de-genero',
    title: 'Equidad de género',
    icon: 'equidad-de-genero.svg',
    numSection: '4',
    color: '#AB47BC',
  },
  {
    number: 3,
    key: 'cultura-politica-y-ciudadana',
    title: 'Cultura política y ciudadana',
    icon: 'iconos-cultura-politica-y-ciudadana.svg',
    numSection: '6',
    color: '#2196F3',
  },
  {
    number: 4,
    key: 'convivencia-y-cultura-de-paz',
    title: 'Convivencia y cultura de paz',
    icon: 'convivencia-y-cultura-de-paz.svg',
    numSection: '6',
    color: '#FF4081',
  },
  {
    number: 5,
    key: 'espacio-publico',
    title: 'Espacio Público',
    icon: 'espacio-publico.svg',
    numSection: '3',
    color: '#00BCD4',
  },
  {
    number: 6,
    key: 'cultura-ambiental',
    title: 'Cultura ambiental',
    icon: 'cultura-ambiental.svg',
    numSection: '9',
    color: '#4CAF50',
  },
  {
    number: 7,
    key: 'movilidad',
    title: 'Movilidad',
    icon: 'movilidad.svg',
    numSection: '10',
    color: '#78909C',
  },
]

/**
 * Imágenes para el carrusel de la portada del tablero
 */
export const IMAGES_CAROUSEL = [
  'ambiente.jpg',
  'cultura-ciudadana.jpg',
  'equidad-de-genero.jpg',
  'espacio-publico.jpg',
  'inclusion-de-identidades.jpg',
  'movilidad.jpg',
]
