const paises = [
  { code: 'AR', iso3: 'ARG', name: 'Argentina', icon: 'argentina.png', flag: '🇦🇷' },
  { code: 'CL', iso3: 'CHL', name: 'Chile', icon: 'chile.png', flag: '🇨🇱' },
  { code: 'BO', iso3: 'BOL', name: 'Bolivia', icon: 'bolivia.png', flag: '🇧🇴' },
  { code: 'EC', iso3: 'ECU', name: 'Ecuador', icon: 'ecuador.png', flag: '🇪🇨' },
  { code: 'BR', iso3: 'BRA', name: 'Brasil', icon: 'brasil.png', flag: '🇧🇷' },
  { code: 'PY', iso3: 'PRY', name: 'Paraguay', icon: 'paraguay.png', flag: '🇵🇾' },
  { code: 'UY', iso3: 'URY', name: 'Uruguay', icon: 'uruguay.png', flag: '🇺🇾' },
  { code: 'VE', iso3: 'VEN', name: 'Venezuela', icon: 'venezuela.png', flag: '🇻🇪' },
  { code: 'PE', iso3: 'PER', name: 'Perú', icon: 'peru.png', flag: '🇵🇪' },
  { code: 'CO', iso3: 'COL', name: 'Colombia', icon: 'colombia.png', flag: '🇨🇴' },
  { code: 'CR', iso3: 'CRI', name: 'Costa Rica', icon: 'costarica.png', flag: '🇨🇷' },
  { code: 'SV', iso3: 'SLV', name: 'El Salvador', icon: 'elsalvador.png', flag: '🇸🇻' },
  { code: 'GT', iso3: 'GTM', name: 'Guatemala', icon: 'guatemala.png', flag: '🇬🇹' },
  { code: 'HN', iso3: 'HND', name: 'Honduras', icon: 'honduras.png', flag: '🇭🇳' },
  { code: 'MX', iso3: 'MEX', name: 'México', icon: 'mexico.png', flag: '🇲🇽' },
  { code: 'NI', iso3: 'NIC', name: 'Nicaragua', icon: 'nicaragua.png', flag: '🇳🇮' },
  { code: 'PA', iso3: 'PAN', name: 'Panamá', icon: 'panama.png', flag: '🇵🇦' },
  { code: 'CU', iso3: 'CUB', name: 'Cuba', icon: 'cuba.png', flag: '🇨🇺' },
  { code: 'DO', iso3: 'DOM', name: 'República Dominicana', icon: 'dominicana.png', flag: '🇩🇴' },
  { code: 'PR', iso3: 'PRI', name: 'Puerto Rico', icon: 'puertorico.png', flag: '🇵🇷' },
  { code: 'US', iso3: 'USA', name: 'USA', icon: 'usa.png', flag: '' },
  { code: 'PT', iso3: 'PRT', name: 'Portugal', icon: 'portugal.png', flag: '🇵🇹' },
  { code: 'ES', iso3: 'ESP', name: 'España', icon: 'espana.png', flag: '🇪🇸' },
]

const RciPaises = new (function () {
  const normalizeCode = (code) => String(code || '').trim().toUpperCase()

  const findCountry = (code) => {
    const normalizedCode = normalizeCode(code)

    return paises.find((pais) => pais.code === normalizedCode || pais.iso3 === normalizedCode)
  }

  /**
   * Obtener un campo (por defecto: name) a partir de un código ISO alpha-2 o alpha-3.
   * @param {string} code - Código ISO del país
   * @param {string} field - Campo a retornar (name, icon, flag, etc.)
   * @returns {string}
   */
  this.codeTo = function (code, field = 'name') {
    const pais = findCountry(code)
    return pais ? pais[field] || pais.name : 'ND'
  }

  /**
   * Retorna la URL al ícono PNG oficial de bandera.
   * Acepta códigos ISO alpha-2 y alpha-3.
   * @param {string} code - Código ISO del país
   * @returns {string}
   */
  this.flagIconUrl = function (code) {
    const pais = findCountry(code)

    return pais ? `https://flagcdn.com/w20/${pais.code.toLowerCase()}.png` : ''
  }
})()

// Permite usar el catálogo desde scripts cargados directamente desde la carpeta public.
globalThis.RciPaises = RciPaises
