// Los valores conservan el número y el texto utilizados en el estado de la investigación.
export const ESTADOS_INVESTIGACION_KEYS = Object.freeze({
  SIN_INICIAR: '1 Sin iniciar',
  EN_EJECUCION: '2 En ejecución',
  EN_PAUSA: '3 En Pausa',
  ENTREGADA: '4 Entregada',
  FINALIZADA: '5 Finalizada',
  NO_APLICA: '6 No aplica',
  CANCELADA: '9 Cancelada',
})

// Colores y clases correspondientes a src/assets/styles/pai.css.
export const ESTADOS_INVESTIGACION = Object.freeze([
  {
    orden: 1,
    key: ESTADOS_INVESTIGACION_KEYS.SIN_INICIAR,
    label: '1 Sin iniciar',
    className: 'estado-investigacion-1-sin-iniciar',
    color: '#ffcfc9',
    textColor: '#b10202',
  },
  {
    orden: 2,
    key: ESTADOS_INVESTIGACION_KEYS.EN_EJECUCION,
    label: '2 En ejecución',
    className: 'estado-investigacion-2-en-ejecucion',
    color: '#bfe1f6',
    textColor: '#0a53a8',
  },
  {
    orden: 3,
    key: ESTADOS_INVESTIGACION_KEYS.EN_PAUSA,
    label: '3 En Pausa',
    className: 'estado-investigacion-3-en-pausa',
    color: '#ffe5a0',
    textColor: '#473821',
  },
  {
    orden: 4,
    key: ESTADOS_INVESTIGACION_KEYS.ENTREGADA,
    label: '4 Entregada',
    className: 'estado-investigacion-4-entregada',
    color: '#e6cff2',
    textColor: '#653596',
  },
  {
    orden: 5,
    key: ESTADOS_INVESTIGACION_KEYS.FINALIZADA,
    label: '5 Finalizada',
    className: 'estado-investigacion-5-finalizada',
    color: '#d4edbc',
    textColor: '#11734b',
  },
  {
    orden: 6,
    key: ESTADOS_INVESTIGACION_KEYS.NO_APLICA,
    label: '6 No aplica',
    className: 'estado-investigacion-6-no-aplica',
    color: '#e6e6e6',
    textColor: '#5a5a5a',
  },
  {
    orden: 9,
    key: ESTADOS_INVESTIGACION_KEYS.CANCELADA,
    label: '9 Cancelada',
    className: 'estado-investigacion-9-cancelada',
    color: '#3d3d3d',
    textColor: '#ffffff',
  },
])
