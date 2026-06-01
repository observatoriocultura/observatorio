export const etapasInvestigacion = [
  {
    codigo: 'P',
    nombre: 'Planeación',
    descripcion: 'Alcance, definiciones, objetivos, instrumentos',
    etiqueta: '1 Planeación',
    peso: 0.2,
  },
  {
    codigo: 'I',
    nombre: 'Diseño Instrumento',
    descripcion: 'Diseño de instrumentos de recolección de información',
    etiqueta: '2 Instrumento',
    peso: 0.1,
  },
  {
    codigo: 'R',
    nombre: 'Recolección información',
    descripcion: 'Salida a campo',
    etiqueta: '3 Recolección',
    peso: 0.2,
  },
  {
    codigo: 'D',
    nombre: 'Análisis y Documentación',
    descripcion: 'Escritura de documentos y preparación de productos',
    etiqueta: '4 Documentación',
    peso: 0.3,
  },
  {
    codigo: 'F',
    nombre: 'Finalización y entrega',
    descripcion: 'Diagramación, entrega final',
    etiqueta: '5 Finalización',
    peso: 0.2,
  },
]

/**
 * Líneas de investigación del PAI. Cada línea tiene un nombre, una clave única y una clase CSS para su estilo.
 * La clase CSS se utiliza para aplicar estilos específicos a cada línea de investigación en la interfaz de usuario.
 * La clave única se utiliza para identificar cada línea de investigación en el código y asociarla con los datos correspondientes.
 */
export const lineasInvestigacion = [
  {
    nombre: 'Cultura Ciudadana',
    key: 'cultura-ciudadana',
    clase: 'bg-cultura-ciudadana',
  },
  {
    nombre: 'Sector Cultura',
    key: 'sector-cultura',
    clase: 'bg-sector-cultura',
  },
]

/**
 * Datos de detalle de cada vigencia del PAI. Con rutas y claves para consulta de datos.
 */
export const vigencias = [
  {
    year: 2023,
    nombre: '2023',
    key: '2023',
    file_id: '',
    notas_gid: '',
  },
  {
    year: 2024,
    nombre: '2024',
    key: '2024',
    file_id: '',
    notas_gid: '',
  },
  {
    year: 2025,
    nombre: '2025',
    key: '2025',
    file_id: '1E26lwaWDXqi6kvbjr_uOCvr6jVbs_85DHD571CvoBQ0',
    notas_gid: '48170642',
  },
  {
    year: 2026,
    nombre: '2026',
    key: '2026',
    file_id: '1u0WZmcJRNEUEb5kDJtwS2loSNIG7lORmgJuiWdBhMz8',
    notas_gid: '48170642',
  },
]

const vigenciasPorYear = Object.fromEntries(
  vigencias.map((vigencia) => [vigencia.year, vigencia]),
)

export const vigenciaPorYear = (year) => vigenciasPorYear[Number(year)] ?? null
