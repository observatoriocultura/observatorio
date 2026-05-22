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
  main: ['#003F97'],
  category: [
    '#003F97',
    '#CAE3F9',
    '#B61678',
    '#438BE3',
    '#5D4294',
    '#FF9800',
    '#00BCD4',
    '#AB47BC',
    '#FF4081',
  ],
  scale_asc_3: ['#bdd3f1', '#6093db', '#003F97'],
  scale_asc_4: ['#bdd3f1', '#6796dbff', '#316fccff', '#003F97'],
  scale_desc_4: ['#003F97', '#316fccff', '#6796dbff', '#bdd3f1'],
  scale_asc_5: ['#94b5e7ff', '#739cdcff', '#5283d1ff', '#316bc5ff', '#0f52baff'],
  scale_desc_5: ['#0f52baff', '#316bc5ff', '#5283d1ff', '#739cdcff', '#94b5e7ff'],
  boolean_asc_4: ['#E0115F', '#eb5790ff', '#9cc9ab', '#50c878'],
  boolean_desc_4: ['#50C878', '#9cc9ab', 'rgb(29, 25, 25)', '#D32F2F'],
  boolean_asc_2: ['#dfdfdf', '#1CDEA2'],
  boolean_desc_2: ['#dfdbe4ff', '#e0115f'],
  yes_no_asc: ['#003366', '#CAE3F9'],
  yes_no_desc: ['#CAE3F9', '#003366'],
  yes_selection: ['#003F97', '#FAFAFA'],
  custom_44: ['#bdd3f1', '#003F97', '#6796dbff', '#D32F2F'],
  custom_27_1: [
    '#bdd3f1',
    '#6093db',
    '#003F97',
    '#d4a3c2',
    '#cf6ba9',
    '#B51678',
    '#50C878',
    '#CAE3F9',
  ],
  gender: ['#d5c3f0', '#0F52BA', '#9cc9ab'],
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
    key: 'practicas-artisticas',
    title: 'Prácticas artísticas, culturales y creativas',
    description:
      'Explora la participación activa de las personas en actividades artísticas, culturales y creativas, así como su frecuencia, motivaciones, trayectorias de inicio, espacios de realización, formas de participación y barreras para su desarrollo. Esta sección permite analizar cómo se expresan, sostienen o interrumpen estas prácticas en la vida cotidiana.',
    icon: 'bi bi-palette-fill',
    numSection: '3',
    color: '#00A3E0',
  },
  {
    number: 2,
    key: 'formacion',
    title: 'Formación',
    description:
      'Indaga sobre las trayectorias de formación artística, cultural y patrimonial de las personas, incluyendo niveles, modalidades, espacios, áreas de formación, frecuencia de participación y percepciones sobre sus aportes personales y sociales. Esta sección permite analizar cómo la formación incide en el desarrollo de capacidades, la participación cultural y la construcción de experiencias significativas.',
    icon: 'bi bi-mortarboard-fill',
    numSection: '4',
    color: '#F6B700',
  },
  {
    number: 3,
    key: 'equipamientos-culturales',
    title: 'Equipamientos culturales',
    description:
      'Examina el conocimiento, uso, acceso y valoración de los equipamientos culturales de la localidad y de la ciudad, así como los canales mediante los cuales las personas consultan su programación. Permite comprender el papel de la infraestructura cultural en la participación ciudadana y en el acceso a la oferta artística y cultural.',
    icon: 'bi bi-building-fill',
    numSection: '5',
    color: '#8E44AD',
  },
  {
    number: 4,
    key: 'practicas-culturales',
    title: 'Prácticas culturales',
    description:
      'Recoge información sobre la asistencia, acceso y participación en actividades culturales, artísticas y patrimoniales, tanto presenciales como virtuales, así como sus motivaciones, barreras de acceso, hábitos de consumo y niveles de identificación con expresiones y comunidades culturales. Estos datos permiten comprender la relación de la ciudadanía con la oferta cultural de la ciudad.',
    icon: 'bi bi-people-fill',
    numSection: '6',
    color: '#E85D75',
  },
  {
    number: 5,
    key: 'practicas-patrimoniales',
    title: 'Prácticas patrimoniales',
    description:
      'Indaga sobre la asistencia y participación en espacios, recorridos, eventos y manifestaciones relacionados con el patrimonio cultural, histórico, artístico y territorial de la ciudad. Esta información permite analizar el vínculo de las personas con los bienes, memorias y expresiones patrimoniales de Bogotá.',
    icon: 'bi bi-bank2',
    numSection: '7',
    color: '#2BB673',
  },
  {
    number: 7,
    key: 'canales-de-television',
    title: 'Canales de televisión',
    description:
      'Recoge información sobre medios, canales y formas de acceso a contenidos culturales, artísticos o informativos, incluyendo canales tradicionales y digitales de consulta. Permite comprender cómo circula la información cultural y cuáles son los principales medios utilizados por la ciudadanía para conectarse con la oferta cultural.',
    icon: 'bi bi-tv-fill',
    numSection: '8',
    color: '#FF7A1A',
  },
  {
    number: 8,
    key: 'emociones-salud-mental',
    title: 'Emociones y salud mental',
    description:
      'Indaga sobre percepciones, experiencias y aportes asociados al bienestar emocional, la expresión de sentimientos, la reflexión personal y las relaciones con otras personas, especialmente en el marco de la formación y la participación cultural. Esta sección permite explorar la relación entre cultura, bienestar subjetivo y desarrollo personal.',
    icon: 'bi bi-heart-pulse-fill',
    numSection: '9',
    color: '#00B8A9',
  },
]

/**
 * Imágenes para el carrusel de la portada del tablero
 */
export const IMAGES_CAROUSEL = [
  'ensayo-2.jpg',
  'cine-2.jpg',
  'planetario-1.jpg',
  'familia-2.jpg',
  'patrimonio-1.jpg',
]
