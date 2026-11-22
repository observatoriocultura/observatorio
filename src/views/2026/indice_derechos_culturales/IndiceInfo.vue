<script setup>
import { COLORES_POR_PUESTO } from './compartidos/ranking.js'
</script>

<template>
  <article class="indice-info">
    <header class="info-intro">
      <div class="info-presentacion">
        <span class="idc-eyebrow">Acerca del tablero</span>
        <h2>Dos índices para explorar Bogotá.</h2>
        <p>
          Este informe reúne dos miradas complementarias: el Índice de Derechos Culturales (IDC) y
          el Índice de Derecho a la Ciudad y Derechos Culturales, presentado como Índice de
          Horizontes (IHC). Compara los resultados de las 20 localidades y el total de la ciudad, en
          el marco del Plan de Cultura de Bogotá 2038. Esta guía explica ambos grupos.
        </p>
      </div>
      <dl class="info-cifras" aria-label="Estructura del informe">
        <div>
          <dt>Coordenadas IDC</dt>
          <dd>6</dd>
        </div>
        <div>
          <dt>Horizontes IHC</dt>
          <dd>10</dd>
        </div>
        <div>
          <dt>Localidades<br /><span>y total Bogotá</span></dt>
          <dd>20</dd>
        </div>
      </dl>
    </header>

    <div class="info-documento idc-panel">
      <section class="info-grupos" aria-label="Los dos índices del informe">
        <div>
          <span class="idc-eyebrow">IDC · C1–C6</span>
          <h3>Índice de Derechos Culturales</h3>
          <p>
            Se organiza en seis coordenadas que reúnen condiciones, percepciones y prácticas
            asociadas al ejercicio de los derechos culturales: acceso y prácticas, igualdad,
            ambiente, acción colectiva, economía y organización.
          </p>
        </div>
        <div>
          <span class="idc-eyebrow">IHC · H01–H10</span>
          <h3>Índice de Horizontes</h3>
          <p>
            Reúne diez horizontes del derecho a la ciudad y los derechos culturales: paz y
            convivencia, confianza y cuidado de lo público, participación, vínculos sociales,
            ambiente, productividad, tecnologías, movilidad, bienestar y formación cultural.
          </p>
        </div>
      </section>
      <div class="info-principal">
        <section class="info-seccion">
          <span class="seccion-etiqueta"><span>01</span> Interpretar</span>
          <h3>Una escala común de 0 a 1</h3>
          <p>
            Un valor más alto expresa condiciones más favorables en el indicador seleccionado.
            Compara las localidades dentro de un mismo índice o subíndice. El punto medio de la
            escala no establece un umbral de cumplimiento.
          </p>
          <div class="escala-valor" aria-label="Escala del índice de 0 a 1">
            <div>
              <strong>0</strong><span>Mayores<br />dificultades</span>
            </div>
            <div>
              <strong>0,5</strong><span>Punto medio<br />de la escala</span>
            </div>
            <div>
              <strong>1</strong><span>Mejores<br />condiciones</span>
            </div>
          </div>
          <p class="aclaracion">
            Un puntaje de 0,558 no significa que el 55,8 % de las personas ejerza sus derechos
            culturales. Es un valor del índice, no un porcentaje de población.
          </p>
        </section>

        <section class="info-seccion">
          <span class="seccion-etiqueta"><span>02</span> Explorar</span>
          <h3>Del índice a la localidad</h3>
          <ol class="pasos-lectura">
            <li>
              <i class="bi bi-sliders2" aria-hidden="true"></i>
              <div>
                <h4>Elige IDC o IHC</h4>
                <p>
                  Cambia de grupo en el menú superior. IDC reúne las coordenadas C1–C6; IHC, los
                  horizontes H01–H10. Cada grupo incluye también su índice total.
                </p>
              </div>
            </li>
            <li>
              <i class="bi bi-layout-split" aria-hidden="true"></i>
              <div>
                <h4>Compara en la matriz</h4>
                <p>
                  Cada columna es un indicador. Selecciona su código para ordenar las localidades;
                  vuelve a pulsarlo para invertir el orden. Bogotá permanece en la primera fila.
                </p>
              </div>
            </li>
            <li>
              <i class="bi bi-geo-alt" aria-hidden="true"></i>
              <div>
                <h4>Explora en el mapa y su tabla</h4>
                <p>
                  Elige un indicador en el selector lateral o desplegable. Los nombres cortos tienen
                  el nombre completo como ayuda. El mapa y la tabla se actualizan juntos; usa el
                  zoom y pasa sobre una localidad para consultar su valor y puesto.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <section class="info-comparacion">
        <div>
          <span class="seccion-etiqueta"><span>03</span> Comparar</span>
          <h3>Valor, puesto y color</h3>
          <dl class="claves-visuales">
            <div>
              <dt>Ancho de la barra</dt>
              <dd>Representa el valor del índice en escala de 0 a 1.</dd>
            </div>
            <div>
              <dt>Color de las barras, casillas y localidades del mapa</dt>
              <dd>
                Representa la posición entre las 20 localidades. El puesto 1 es el valor más alto;
                el 20, el más bajo.
              </dd>
            </div>
          </dl>
          <p class="idc-note mb-0">
            Cada columna de la matriz tiene su propio ranking. Reordenar las filas no cambia sus
            colores. Cada grupo conserva su selección y el orden de la matriz mientras navegas.
          </p>
        </div>
        <div class="guia-color">
          <h4>Una escala relativa</h4>
          <div class="muestra-colores" aria-hidden="true">
            <span
              v-for="(color, index) in COLORES_POR_PUESTO"
              :key="index"
              :style="{ backgroundColor: color }"
            ></span>
          </div>
          <div class="muestra-etiquetas">
            <span>1 · Mayor valor</span><span>10–11</span><span>20 · Menor valor</span>
          </div>
          <p>
            Verde, amarillo y rojo pastel comparan puestos dentro de la selección actual. No indican
            niveles de cumplimiento.
          </p>
          <div class="bogota-nota">
            <span class="idc-eyebrow">La referencia Bogotá</span>
            <p>
              Su color corresponde al puesto que ocuparía frente a las localidades, sin incluirla en
              el ranking ni modificar sus posiciones.
            </p>
          </div>
        </div>
      </section>

      <details class="notas-lectura">
        <summary>
          <span
            ><i class="bi bi-journal-text" aria-hidden="true"></i>Metodología y notas de
            lectura</span
          ><i class="bi bi-chevron-down" aria-hidden="true"></i>
        </summary>
        <div class="notas-grid">
          <section>
            <h4>Cálculo</h4>
            <p>
              El IDC es el promedio simple de sus seis coordenadas, construidas a partir de 27
              indicadores. El IHC es el promedio simple de sus diez horizontes. El tablero utiliza
              los resultados entregados para cada índice y subíndice, con su precisión original.
            </p>
          </section>
          <section>
            <h4>Precisión y datos ausentes</h4>
            <p>
              Se muestran tres decimales y se ordena con la precisión original. Dos valores que se
              ven iguales pueden ocupar puestos distintos. Los empates se resuelven por código de
              localidad. Un valor ausente se muestra como —; en la columna de posición, Bogotá
              también lleva — porque no participa en el ranking.
            </p>
          </section>
          <section>
            <h4>Fuentes y alcance</h4>
            <p>
              Los resultados suministrados se construyen con indicadores de la Encuesta Bienal de
              Culturas. El tablero presenta una medición de cada índice; no muestra variaciones
              entre periodos. Los resultados de Bogotá se incorporan como referencia de ciudad.
            </p>
          </section>
          <section>
            <h4>Total Bogotá</h4>
            <p>
              Se toma del resultado publicado; no se calcula promediando las localidades. Para su
              color se cuentan las localidades con un valor superior y se toma el color del
              siguiente puesto, limitado al último disponible.
            </p>
          </section>
        </div>
      </details>
      <footer class="info-fuente">
        <div>
          <span class="idc-eyebrow">Datos del informe</span>
          <p>Consulta el catálogo de indicadores, las localidades y los valores originales.</p>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/1_BgpPnUPy8pCMLXlMJ0xYf379JMlMzw6ukPtPHyQ-Ck/edit?gid=551854597#gid=551854597"
          target="_blank"
          rel="noopener noreferrer"
          >Consultar datos fuente <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i
          ><span class="visually-hidden"> (abre en otra pestaña)</span></a
        >
      </footer>
    </div>
  </article>
</template>

<style scoped>
.info-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
  align-items: end;
  gap: 2rem;
  padding: 0.5rem 0.25rem 1.75rem;
}
.info-presentacion h2 {
  max-width: 23ch;
  margin: 0.8rem 0 1rem;
  font-size: clamp(1.65rem, 2.4vw, 2.15rem);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.035em;
  color: var(--idc-ink);
  text-wrap: balance;
}
.info-presentacion p {
  max-width: 62ch;
  margin: 0;
  color: var(--idc-muted);
  line-height: 1.75;
}
.info-cifras {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 0 0 0.3rem;
}
.info-cifras > div {
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  border-left: 1px solid #ddd9e3;
  padding-left: 1rem;
}
.info-cifras dt {
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--idc-muted);
}
.info-cifras dt span {
  font-size: 0.65rem;
}
.info-cifras dd {
  margin: 0 0 0.65rem;
  font-size: 2rem;
  font-weight: 450;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--idc-accent);
}
.info-documento {
  overflow: hidden;
}
.info-documento > :is(.info-grupos, .info-principal, .info-comparacion) {
  padding: clamp(1.15rem, 2.5vw, 2rem);
  gap: clamp(1.5rem, 3vw, 3rem);
}
.info-grupos > div {
  min-width: 0;
}
.info-grupos > div + div {
  border-left: 1px solid var(--idc-line);
  padding-left: clamp(1.5rem, 3vw, 3rem);
}
.info-fuente {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem clamp(1.15rem, 2.5vw, 2rem);
  border-top: 1px solid var(--idc-line);
  background: #faf9fb;
}
.info-fuente p {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--idc-muted);
}
.info-fuente a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 550;
  color: var(--idc-accent);
  text-underline-offset: 3px;
  flex-shrink: 0;
}
.info-fuente a:focus-visible {
  outline: 2px solid var(--idc-accent);
  outline-offset: 4px;
  border-radius: 3px;
}
.info-grupos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2rem, 4vw, 4rem);
  padding: clamp(1.25rem, 3vw, 2.5rem);
  background: #faf9fb;
  border-bottom: 1px solid var(--idc-line);
}
.info-grupos h3 {
  margin-top: 0.6rem;
}
.info-grupos p {
  margin: 0;
  color: var(--idc-muted);
  font-size: 0.825rem;
  line-height: 1.85;
}
.info-principal,
.info-comparacion {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2rem, 4vw, 4rem);
  padding: clamp(1.25rem, 3vw, 2.5rem);
}
.seccion-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--idc-muted);
  margin-bottom: 1rem;
}
.seccion-etiqueta > span {
  color: var(--idc-accent);
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}
h3 {
  font-size: 1.15rem;
  font-weight: 550;
  letter-spacing: -0.025em;
  margin: 0 0 1rem;
  line-height: 1.4;
}
.info-seccion > p {
  font-size: 0.875rem;
  line-height: 1.85;
  color: var(--idc-muted);
}
.escala-valor {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-block: 1.5rem;
  border-top: 2px solid #d9d3e1;
}
.escala-valor > div {
  position: relative;
  padding-top: 0.75rem;
}
.escala-valor > div::before {
  content: '';
  position: absolute;
  top: -5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #857191;
}
.escala-valor > div:nth-child(2) {
  text-align: center;
}
.escala-valor > div:nth-child(2)::before {
  left: calc(50% - 3px);
}
.escala-valor > div:last-child {
  text-align: right;
}
.escala-valor > div:last-child::before {
  right: 0;
}
.escala-valor strong {
  display: block;
  font-size: 1.1rem;
  font-weight: 550;
  margin-bottom: 0.25rem;
}
.escala-valor span {
  font-size: 0.7rem;
  line-height: 1.6;
  color: var(--idc-muted);
  display: block;
}
.info-seccion .aclaracion {
  margin: 0;
  font-size: 0.8rem;
  padding-left: 0.8rem;
  border-left: 2px solid var(--idc-line);
}
.pasos-lectura {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.1rem;
}
.pasos-lectura li {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 0.8rem;
}
.pasos-lectura li > i {
  color: #857191;
  font-size: 1rem;
  padding-top: 0.05rem;
}
.pasos-lectura h4 {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  font-weight: 550;
}
.pasos-lectura p {
  margin: 0;
  color: var(--idc-muted);
  line-height: 1.75;
  font-size: 0.8rem;
}
.info-comparacion {
  border-top: 1px solid var(--idc-line);
}
.claves-visuales {
  margin: 0 0 1.25rem;
  font-size: 0.825rem;
}
.claves-visuales > div + div {
  margin-top: 1rem;
}
.claves-visuales dt {
  font-weight: 550;
  margin-bottom: 0.3rem;
}
.claves-visuales dd {
  margin: 0;
  line-height: 1.75;
  color: var(--idc-muted);
}
.guia-color {
  align-self: start;
  background: #faf9fb;
  border: 1px solid #f0edf3;
  border-radius: 10px;
  padding: 1.5rem;
}
.guia-color h4 {
  font-size: 0.8rem;
  font-weight: 550;
  margin: 0 0 1rem;
}
.muestra-colores {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  height: 14px;
  border-radius: 4px;
  overflow: hidden;
}
.muestra-etiquetas {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  color: var(--idc-muted);
  font-size: 0.62rem;
  margin-block: 0.5rem 1rem;
}
.guia-color p {
  color: var(--idc-muted);
  line-height: 1.75;
  font-size: 0.8rem;
  margin: 0;
}
.bogota-nota {
  margin-top: 1.25rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--idc-line);
}
.bogota-nota .idc-eyebrow {
  margin-bottom: 0.45rem;
}
.notas-lectura {
  border-top: 1px solid var(--idc-line);
}
.notas-lectura summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  list-style: none;
  padding: 1.15rem clamp(1.25rem, 3vw, 2.5rem);
  cursor: pointer;
  color: var(--idc-muted);
  font-size: 0.8rem;
}
.notas-lectura summary::-webkit-details-marker {
  display: none;
}
.notas-lectura summary span {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.notas-lectura[open] summary > i {
  transform: rotate(180deg);
}
.notas-lectura summary:hover {
  background: #faf9fb;
  color: var(--idc-accent);
}
.notas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem 3rem;
  padding: 0 clamp(1.25rem, 3vw, 2.5rem) 1.5rem;
}
.notas-grid h4 {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.notas-grid p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--idc-muted);
  line-height: 1.8;
}
@media (max-width: 1050px) {
  .info-intro {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.75rem;
  }
  .info-cifras {
    max-width: 28rem;
  }
}
@media (max-width: 650px) {
  .info-grupos > div + div {
    border-left: 0;
    border-top: 1px solid var(--idc-line);
    padding-left: 0;
    padding-top: 1.5rem;
  }
  .info-fuente {
    align-items: flex-start;
    flex-direction: column;
  }
  .info-intro {
    padding-bottom: 1.75rem;
  }
  .info-principal,
  .info-grupos,
  .info-comparacion,
  .notas-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .info-cifras {
    gap: 0.5rem;
  }
  .info-cifras > div {
    padding-left: 0.75rem;
  }
  .info-cifras dd {
    font-size: 2rem;
  }
  .guia-color {
    padding: 1rem;
  }
}
</style>
