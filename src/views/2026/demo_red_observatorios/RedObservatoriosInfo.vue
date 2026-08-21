<template>
  <article class="red-observatorios-info">
    <header class="info-header">
      <p class="info-eyebrow">Red de Observatorios</p>
      <h1>Explora las entidades de la red</h1>
      <p class="info-lead">
        Conoce los observatorios, centros de pensamiento y organizaciones vinculadas con la
        cultura que hacen parte de esta primera versión demostrativa de la red.
      </p>
    </header>

    <aside class="demo-notice" aria-labelledby="demo-title">
      <i class="bi bi-bezier2" aria-hidden="true"></i>
      <div>
        <h2 id="demo-title">Este sitio es un prototipo</h2>
        <p>
          La información, las fichas y las conexiones que se presentan son demostrativas. Este
          prototipo permite probar la organización del directorio, la exploración de entidades y
          las posibilidades de relación entre iniciativas; no constituye todavía un registro
          oficial de la red. Los contenidos deberán validarse con cada organización antes de su
          publicación definitiva.
        </p>
      </div>
    </aside>

    <div class="info-grid">
      <section class="info-section" aria-labelledby="network-title">
        <p class="info-section-kicker">La iniciativa</p>
        <h2 id="network-title">¿Qué es la red?</h2>
        <p>
          Es una comunidad iberoamericana en construcción que reúne observatorios, universidades,
          centros de pensamiento, fundaciones, sistemas de información y otras iniciativas que
          producen o gestionan conocimiento sobre la vida cultural y los comportamientos
          ciudadanos.
        </p>
        <p>
          Parte del reconocimiento de que la región ya cuenta con experiencias, metodologías y
          capacidades de medición valiosas. La red busca hacerlas visibles y ponerlas en diálogo
          para comprender mejor el lugar de la cultura en las ciudades y los países de
          Iberoamérica.
        </p>
      </section>

      <section class="info-section" aria-labelledby="purpose-title">
        <p class="info-section-kicker">Propósito</p>
        <h2 id="purpose-title">¿Qué buscamos?</h2>
        <ul class="purpose-list">
          <li>
            <i class="bi bi-search" aria-hidden="true"></i>
            <span>Reconocer quiénes producen conocimiento, qué miden y cómo lo hacen.</span>
          </li>
          <li>
            <i class="bi bi-arrow-left-right" aria-hidden="true"></i>
            <span>Intercambiar metodologías, herramientas, aprendizajes y recursos.</span>
          </li>
          <li>
            <i class="bi bi-people" aria-hidden="true"></i>
            <span>Identificar capacidades e intereses que puedan convertirse en cooperación.</span>
          </li>
          <li>
            <i class="bi bi-lightbulb" aria-hidden="true"></i>
            <span>Producir conocimiento e investigaciones de manera colaborativa.</span>
          </li>
          <li>
            <i class="bi bi-diagram-3" aria-hidden="true"></i>
            <span>Generar las condiciones para formalizar una red iberoamericana.</span>
          </li>
        </ul>
      </section>
    </div>

    <section class="questions-section" aria-labelledby="questions-title">
      <div class="questions-heading">
        <p class="info-section-kicker">Punto de partida</p>
        <h2 id="questions-title">Una conversación basada en evidencia</h2>
      </div>
      <div class="questions-grid">
        <blockquote>
          ¿Cómo están midiendo las ciudades y los países iberoamericanos la vida cultural, las
          prácticas artísticas, culturales, creativas y patrimoniales, la recreación, el deporte y
          los comportamientos ciudadanos?
        </blockquote>
        <blockquote>
          ¿Qué podemos aprender de esas experiencias y qué podemos compartir, comparar y construir
          conjuntamente?
        </blockquote>
      </div>
    </section>

    <section class="outcomes-section" aria-labelledby="outcomes-title">
      <p class="info-section-kicker">Resultados esperados</p>
      <h2 id="outcomes-title">Del mapeo a la colaboración</h2>
      <div class="outcomes-grid">
        <div>
          <i class="bi bi-building" aria-hidden="true"></i>
          <h3>Directorio</h3>
          <p>Una caracterización inicial de las organizaciones y sus capacidades.</p>
        </div>
        <div>
          <i class="bi bi-map" aria-hidden="true"></i>
          <h3>Mapa del ecosistema</h3>
          <p>Una lectura temática y metodológica de las iniciativas participantes.</p>
        </div>
        <div>
          <i class="bi bi-link-45deg" aria-hidden="true"></i>
          <h3>Conexiones</h3>
          <p>Oportunidades de intercambio, aprendizaje e investigación conjunta.</p>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.red-observatorios-info {
  padding-top: clamp(1rem, 2.5vw, 2rem);
}

.info-header {
  max-width: 780px;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}

.info-eyebrow,
.info-section-kicker {
  margin: 0 0 0.55rem;
  color: var(--red-purple);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.info-header h1 {
  margin: 0 0 0.85rem;
  color: var(--red-purple-dark);
  font-size: clamp(2rem, 4vw, 3.35rem);
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.info-lead {
  max-width: 680px;
  margin: 0;
  color: var(--red-muted);
  font-size: clamp(1rem, 1.6vw, 1.16rem);
  line-height: 1.6;
}

.demo-notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid #cbb9df;
  border-radius: 16px;
  background: #f3eef8;
  padding: clamp(1rem, 2.5vw, 1.5rem);
}

.demo-notice > i {
  color: var(--red-purple);
  font-size: 1.5rem;
}

.demo-notice h2 {
  margin: 0 0 0.4rem;
  color: var(--red-purple-dark);
  font-size: 1.1rem;
}

.demo-notice p,
.info-section p,
.outcomes-grid p {
  margin: 0;
  color: var(--red-muted);
  line-height: 1.65;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-section,
.questions-section,
.outcomes-section {
  border: 1px solid var(--red-border);
  border-radius: 16px;
  background: #fff;
  padding: clamp(1.1rem, 2.5vw, 1.6rem);
}

.info-section h2,
.questions-section h2,
.outcomes-section h2 {
  margin: 0 0 0.85rem;
  color: var(--red-ink);
  font-size: clamp(1.25rem, 2.4vw, 1.65rem);
}

.info-section p + p {
  margin-top: 0.85rem;
}

.purpose-list {
  display: grid;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.purpose-list li {
  display: grid;
  grid-template-columns: 1.6rem minmax(0, 1fr);
  gap: 0.55rem;
  align-items: start;
  color: var(--red-muted);
  line-height: 1.45;
}

.purpose-list i {
  color: var(--red-purple);
  text-align: center;
}

.questions-section {
  margin-bottom: 1rem;
}

.questions-heading {
  max-width: 620px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.questions-grid blockquote {
  margin: 0;
  border-left: 3px solid var(--red-purple);
  border-radius: 0 10px 10px 0;
  background: #faf8fc;
  padding: 1rem;
  color: var(--red-purple-dark);
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.55;
}

.outcomes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.outcomes-grid > div {
  border-top: 1px solid #edf0f2;
  padding-top: 1rem;
}

.outcomes-grid i {
  color: var(--red-purple);
  font-size: 1.25rem;
}

.outcomes-grid h3 {
  margin: 0.45rem 0 0.35rem;
  color: var(--red-ink);
  font-size: 1rem;
}

.outcomes-grid p {
  font-size: 0.88rem;
}

@media (max-width: 760px) {
  .info-grid,
  .questions-grid,
  .outcomes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .demo-notice {
    grid-template-columns: 1fr;
  }
}
</style>
