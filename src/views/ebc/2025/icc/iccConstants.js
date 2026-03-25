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
  const grupo = GRUPOS_EDAD.find(g => Number(g.id) === Number(id))
  return grupo ? grupo.nombre : `Grupo ${id}`
}
