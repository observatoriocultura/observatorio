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
  main: ['#0F52BA'],
  category: [
    '#0F52BA',
    '#50C878',
    '#E0115F',
    '#5D4294',
    '#FF9800',
    '#00BCD4',
    '#AB47BC',
    '#FF4081',
  ],
  scale_asc_4: ['#94b5e7ff', '#6796dbff', '#316fccff', '#0F52BA'],
  scale_desc_4: ['#0F52BA', '#316fccff', '#6796dbff', '#94b5e7ff'],
  scale_asc_5: ['#94b5e7ff', '#739cdcff', '#5283d1ff', '#316bc5ff', '#0f52baff'],
  scale_desc_5: ['#0f52baff', '#316bc5ff', '#5283d1ff', '#739cdcff', '#94b5e7ff'],
  boolean_asc_4: ['#D32F2F', '#cf8b8bff', '#9cc9ab', '#50c878'],
  boolean_desc_4: ['#50C878', '#9cc9ab', '#cf8b8bff', '#D32F2F'],
  boolean_asc_2: ['#dfdbe4ff', '#50c878'],
  boolean_desc_2: ['#dfdbe4ff', '#e0115f'],
  yes_no_asc: ['#003366', '#00AEEF'],
  yes_no_desc: ['#654096', '#D9CBEA'],
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
    key: 'percepciones-generales',
    title: 'Percepciones generales',
    icon: 'iconos-cultura-politica-y-ciudadana.svg',
    numSection: '3',
    color: '#2196F3',
  },
  {
    number: 2,
    key: 'lectura',
    title: 'Hábitos de Lectura',
    icon: 'espacio-publico.svg',
    numSection: '4',
    color: '#FF9800',
  },
  {
    number: 3,
    key: 'escritura',
    title: 'Hábitos de Escritura',
    icon: 'equidad-de-genero.svg',
    numSection: '5',
    color: '#AB47BC',
  },
  {
    number: 4,
    key: 'oralidad',
    title: 'Hábitos de Oralidad',
    icon: 'convivencia-y-cultura-de-paz.svg',
    numSection: '6',
    color: '#FF4081',
  },
  {
    number: 5,
    key: 'espacios-leo',
    title: 'Espacios de Lectura, Escritura y Oralidad',
    icon: 'espacio-publico.svg',
    numSection: '7',
    color: '#00BCD4',
  },
]

/**
 * Imágenes para el carrusel de la portada del tablero
 */
export const IMAGES_CAROUSEL = [
  'oralidad.png',
  'oralidad-3.jpg',
  'lectura-1.jpg',
  'lectura-2.jpg',
  'escritura-1.jpg',
  'oralidad-2.jpg',
]
