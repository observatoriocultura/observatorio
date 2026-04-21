export const TIPOS_CONTENIDO = [
  { nombre: 'Documento', icon: 'bi bi-file-earmark-text', colorClass: 'tipo-documento' },
  {
    nombre: 'Hoja de cálculo',
    icon: 'bi bi-file-earmark-spreadsheet',
    colorClass: 'tipo-hoja-calculo',
  },
  { nombre: 'Carpeta', icon: 'bi bi-folder', colorClass: 'tipo-carpeta' },
  { nombre: 'Presentación', icon: 'bi bi-file-earmark-slides', colorClass: 'tipo-presentacion' },
  { nombre: 'Dataviz', icon: 'bi bi-bar-chart', colorClass: 'tipo-dataviz' },
]

export const getTipoContenido = (nombre) => {
  const tipoBuscado = nombre?.trim().toLowerCase()

  return (
    TIPOS_CONTENIDO.find((tipo) => tipo.nombre.toLowerCase() === tipoBuscado) || {
      nombre,
      icon: 'bi bi-file-earmark',
      colorClass: 'tipo-default',
    }
  )
}
