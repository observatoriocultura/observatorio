export const GRUPOS = {
  IDC: {
    codigo: 'IDC',
    nombre: 'Índice de Derechos Culturales',
    nombreCompleto: 'Índice de Derechos Culturales',
    codigoTotal: 'IDC',
    singular: 'coordenada',
    plural: 'coordenadas',
  },
  IHC: {
    codigo: 'IHC',
    nombre: 'Índice de Horizontes',
    nombreCompleto: 'Índice de Derecho a la Ciudad y Derechos Culturales',
    codigoTotal: 'IHC',
    singular: 'horizonte',
    plural: 'horizontes',
  },
}

export function crearEstadoGrupo(configuracion) {
  return {
    indice: configuracion.codigoTotal,
    ordenMatrizPor: configuracion.codigoTotal,
    ordenMatrizAsc: false,
  }
}

export function ordenarSubindices(subindices, codigoTotal) {
  return [...subindices].sort((a, b) => {
    if (a.codigo === b.codigo) return 0
    if (a.codigo === codigoTotal) return -1
    if (b.codigo === codigoTotal) return 1
    return a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
  })
}
