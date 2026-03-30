/**
 * Constantes compartidas para el visualizador ICC
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
  category: ['#003366', '#00AEEF', '#F9A825', '#D32F2F', '#388E3C', '#7B1FA2'],
  scale_asc_4: ['#D32F2F', '#F9A825', '#00AEEF', '#388E3C'],
  scale_desc_4: ['#388E3C', '#00AEEF', '#F9A825', '#D32F2F'],
  yes_no_asc: ['#003366', '#00AEEF'],
  yes_no_desc: ['#00AEEF', '#003366'],
}

/**
 * Helper para obtener la paleta de colores según el tipo de respuesta
 * @param {string} tipo - Tipo de respuesta
 * @returns {string[]} - Paleta de colores
 */
export const getPaletaColor = (tipo) => {
  return PALETAS_COLOR[tipo] || PALETAS_COLOR.category
}
