<template>
  <section class="home-hero">
    <div class="home-shell">
      <div class="hero-copy">
        <p class="eyebrow">Secretaría de Cultura, Recreación y Deporte de Bogotá</p>
        <h1 class="hero-title">
          <span class="title-top">Dirección</span>
          <span class="title-main">Observatorio</span>
          <span class="title-bottom">y Gestión del Conocimiento Cultural</span>
        </h1>
        <p class="lead">
          Un punto de entrada para comprender la vida cultural de Bogotá a través de datos,
          análisis, proyectos, investigaciones y herramientas de consulta.
        </p>

        <div class="hero-actions">
          <RouterLink class="action action-primary" to="/proyectos">Explorar contenidos</RouterLink>
        </div>
      </div>

      <aside class="hero-panel">
        <div class="panel-intro">
          <span class="panel-kicker">Qué encuentras aquí</span>
          <p>
            Contenidos pensados para consulta ágil: artículos, proyectos, informes, glosarios y
            lecturas aplicadas sobre el ecosistema cultural de la ciudad.
          </p>
        </div>

        <div class="panel-grid">
          <article class="info-card">
            <span class="card-label">Análisis</span>
            <h2>Lectura de tendencias y hallazgos</h2>
            <p>Resultados sintéticos para entender fenómenos, conversaciones y transformaciones.</p>
          </article>

          <a
            href="https://observatoriocultura.github.io/contenidos/investigaciones.html"
            target="_blank"
            rel="noopener noreferrer"
            class="info-card"
          >
            <span class="card-label">Investigación</span>
            <h2>Estudios e Investigaciones</h2>
            <p>Listado de investigaciones y contenidos técnicos generados por el Observatorio.</p>
          </a>

          <article class="info-card">
            <span class="card-label">Proyectos</span>
            <h2>Procesos que dejan trazabilidad</h2>
            <p>Ejercicios desarrollados por el observatorio con enfoque público y territorial.</p>
          </article>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home-hero {
  --hero-surface: #ffffff;
  --hero-border: #e6e8eb;
  --hero-text: #18232b;
  --hero-muted: #5c6972;
  min-height: calc(100vh - 72px);
  padding: clamp(1.25rem, 2.5vw, 2rem);
  background: #ffffff;
  color: var(--hero-text);
}

.home-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: clamp(1.25rem, 2vw, 2rem);
  align-items: stretch;
  max-width: 1240px;
  min-height: calc(100vh - 112px);
  margin: 0 auto;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1.75rem, 4vw, 3.5rem);
  background: #ffffff;
}

.eyebrow {
  margin-bottom: 1rem;
  color: #44515a;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-title {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.75rem;
  color: #32204a;
  line-height: 1.1;
}

.title-top {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #7a6a93; /* Un tono más suave para el prefijo */
}

.title-main {
  font-size: clamp(3.5rem, 7vw, 6rem);
  font-weight: 900;
  line-height: 0.9;
  margin: 0.25rem 0 0.5rem;
  letter-spacing: -0.02em;
}

.title-bottom {
  font-size: clamp(1.1rem, 2.2vw, 1.75rem);
  font-weight: 600;
  max-width: 20ch;
  line-height: 1.2;
  color: #4a3b63;
}

.lead {
  max-width: 56ch;
  margin-bottom: 1.75rem;
  color: var(--hero-muted);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: 1.75rem;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.8rem 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
}

.action-primary {
  background: var(--hero-text);
  color: #ffffff;
}

.action-secondary {
  border: 1px solid rgba(31, 42, 47, 0.14);
  background: #ffffff;
  color: var(--hero-text);
}

.hero-highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.hero-highlights li {
  min-height: 100%;
  padding: 0.15rem 0.6rem 0.15rem 0;
  color: #334148;
  font-size: 0.95rem;
  line-height: 1.4;
}

.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: clamp(1.1rem, 1.8vw, 1.5rem) 0 clamp(1.1rem, 1.8vw, 1.5rem) clamp(1.5rem, 3vw, 2.5rem);
  border-left: 1px solid #eef0f2;
  background: transparent;
}

.panel-intro {
  padding: 0.5rem 0.25rem 0;
}

.panel-kicker {
  display: inline-block;
  margin-bottom: 0.4rem;
  padding: 0;
  color: #8c96a0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-intro p {
  margin: 0;
  color: var(--hero-muted);
  font-size: 0.98rem;
}

.panel-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f2f4;
  transition: transform 0.2s ease;
  text-decoration: none; /* Asegura que si es un link no tenga subrayado */
}

.info-card:last-child {
  border-bottom: none;
}

.info-card:hover {
  transform: translateX(4px);
}

.card-label {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 0.35rem;
  color: #8c96a0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.info-card h2 {
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
  line-height: 1.2;
  font-weight: 800;
  color: #1a1a1a;
}

.info-card p {
  margin: 0;
  color: var(--hero-muted);
  font-size: 0.93rem;
  line-height: 1.45;
}

@media (max-width: 991px) {
  .home-hero {
    min-height: auto;
  }

  .home-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-copy {
    justify-content: flex-start;
  }

  .hero-highlights {
    grid-template-columns: 1fr;
  }

  .panel-grid {
    grid-template-rows: none;
    grid-template-columns: 1fr;
  }

  .hero-panel {
    padding: 1.25rem 0 0;
    border-left: 0;
    border-top: 1px solid #eef0f2;
  }
}

@media (max-width: 576px) {
  .home-hero {
    padding: 1rem 0.9rem 1.4rem;
  }
  h1 {
    max-width: none;
    font-size: 2.45rem;
  }

  .lead {
    font-size: 0.98rem;
  }

  .action {
    width: 100%;
  }
}
</style>
