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
  boolean_asc_4: ['#E0115F', '#eb5790ff', '#9cc9ab', '#50c878'],
  boolean_desc_4: ['#50C878', '#9cc9ab', '#cf8b8bff', '#D32F2F'],
  boolean_asc_2: ['#dfdbe4ff', '#50c878'],
  boolean_desc_2: ['#dfdbe4ff', '#e0115f'],
  yes_no_asc: ['#003366', '#00AEEF'],
  yes_no_desc: ['#654096', '#D9CBEA'],
  yes_selection: ['#0F52BA', '#FAFAFA'],
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
    icon: 'leo-percepciones.svg',
    numSection: '3',
    color: '#2196F3',
  },
  {
    number: 2,
    key: 'lectura',
    title: 'Hábitos de Lectura',
    icon: 'leo-lectura.svg',
    numSection: '4',
    color: '#FF9800',
  },
  {
    number: 3,
    key: 'escritura',
    title: 'Hábitos de Escritura',
    icon: 'leo-escritura.svg',
    numSection: '5',
    color: '#AB47BC',
  },
  {
    number: 4,
    key: 'oralidad',
    title: 'Hábitos de Oralidad',
    icon: 'leo-oralidad.svg',
    numSection: '6',
    color: '#FF4081',
  },
  {
    number: 5,
    key: 'espacios-leo',
    title: 'Espacios de Lectura, Escritura y Oralidad',
    icon: 'leo-espacios.svg',
    numSection: '7',
    color: '#00BCD4',
  },
]

/**
 * Imágenes para el carrusel de la portada del tablero
 */
export const IMAGES_CAROUSEL = [
  'espacios-1.jpg',
  'lectura-1.jpg',
  'lectura-2.jpg',
  'escritura-1.jpg',
  'escritura-2.jpg',
  'espacios-2.jpg',
  'oralidad-1.jpg',
  'oralidad-3.jpg',
  'oralidad-2.jpg',
]
