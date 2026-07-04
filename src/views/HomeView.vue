<template>
  <section class="home-view">
    <div class="home-shell">
      <header class="home-intro">
        <p class="eyebrow">Secretaría de Cultura, Recreación y Deporte de Bogotá</p>
        <h1>
          Observatorio y Gestión<br />
          del Conocimiento Cultural
        </h1>
        <p class="lead">
          Reunimos mediciones, investigaciones, publicaciones y herramientas para leer la vida
          cultural de Bogotá con datos, análisis y evidencia útil para la toma de decisiones,
          organizando resultados de estudios, documentos técnicos, lecturas aplicadas y recursos de
          consulta sobre el ecosistema cultural de la ciudad.
        </p>
      </header>

      <section class="access-section" aria-labelledby="access-title">
        <h2 id="access-title" class="visually-hidden">Accesos principales</h2>

        <div class="access-grid">
          <article v-for="block in accessBlocks" :key="block.title" class="access-card">
            <span class="access-icon" :class="block.tone" aria-hidden="true">
              <i class="bi" :class="block.icon"></i>
            </span>
            <div class="access-copy">
              <h3>{{ block.title }}</h3>
              <p>{{ block.description }}</p>
            </div>
            <RouterLink class="access-link" :to="block.to">
              {{ block.linkLabel }}
              <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </RouterLink>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const accessBlocks = [
  {
    title: 'Mediciones',
    description:
      'Consulta investigaciones, estudios y resultados organizados para entender dinámicas culturales de Bogotá.',
    linkLabel: 'Entrar a mediciones',
    to: '/investigaciones',
    icon: 'bi-clipboard-data',
    tone: 'tone-measurements',
  },
  {
    title: 'Publicaciones',
    description:
      'Lee artículos, informes, documentos técnicos y contenidos de análisis producidos por el Observatorio.',
    linkLabel: 'Ver publicaciones',
    to: '/proyectos',
    icon: 'bi-journal-text',
    tone: 'tone-publications',
  },
  {
    title: 'Herramientas',
    description:
      'Espacio para mapas, visualizadores y recursos interactivos. Por ahora deja abierto el lugar para nuevos desarrollos.',
    linkLabel: 'Explorar herramientas',
    to: '/herramientas/mapa_localidades',
    icon: 'bi-map',
    tone: 'tone-tools',
  },
]
</script>

<style scoped>
.home-view {
  --home-text: #18232b;
  --home-muted: #5b6670;
  --home-soft: #eef1f4;
  --home-panel: #f7f8fa;
  --home-purple: #32204a;
  --home-blue: #16647a;
  --home-green: #27705f;
  --home-amber: #9a6218;
  min-height: 100vh;
  padding: clamp(0.9rem, 2.2vw, 1.75rem);
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 58%, #f7f8fa 100%);
  color: var(--home-text);
}

.home-shell {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
  max-width: 1180px;
  margin: 0 auto;
}

.home-intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: auto;
  padding: clamp(0.75rem, 1.5vw, 1.1rem) 0 0;
}

.eyebrow {
  margin: 0 0 0.9rem;
  color: #6c7780;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 100%;
  margin-bottom: 0.85rem;
  color: var(--home-purple);
  font-size: 32px;
  font-weight: 900;
  line-height: 1.08;
}

.lead {
  max-width: 820px;
  margin-bottom: 0;
  color: #24313a;
  font-size: 20px;
  font-weight: 650;
  line-height: 1.45;
}

.access-section {
  padding-top: clamp(0.5rem, 1.5vw, 1rem);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.access-card {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  padding: clamp(1.1rem, 2vw, 1.35rem);
  border: 1px solid #e4e8ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(24, 35, 43, 0.06);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.access-card:hover {
  transform: translateY(-3px);
  border-color: #ccd4db;
  box-shadow: 0 20px 46px rgba(24, 35, 43, 0.1);
}

.access-icon {
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  border-radius: 8px;
  font-size: 1.35rem;
}

.tone-measurements {
  background: rgba(22, 100, 122, 0.1);
  color: var(--home-blue);
}

.tone-publications {
  background: rgba(154, 98, 24, 0.12);
  color: var(--home-amber);
}

.tone-tools {
  background: rgba(39, 112, 95, 0.1);
  color: var(--home-green);
}

.access-copy {
  flex: 1;
}

h3 {
  margin-bottom: 0.7rem;
  color: var(--home-text);
  font-size: 1.25rem;
  font-weight: 850;
  line-height: 1.2;
}

.access-copy p {
  margin-bottom: 1.25rem;
  color: var(--home-muted);
  font-size: 0.96rem;
  line-height: 1.55;
}

.access-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: var(--home-text);
  font-size: 0.92rem;
  font-weight: 850;
  text-decoration: none;
}

.access-link:hover,
.access-link:focus {
  color: var(--home-purple);
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

.access-link:focus-visible {
  outline: 3px solid rgba(50, 32, 74, 0.18);
  outline-offset: 4px;
}

@media (max-width: 991px) {
  .home-intro {
    min-height: auto;
    padding-top: 1.5rem;
  }

  .access-grid {
    grid-template-columns: 1fr;
  }

  .access-card {
    min-height: 0;
  }
}

@media (max-width: 576px) {
  .home-view {
    padding: 1rem 0.9rem 1.5rem;
  }

  .lead {
    font-size: 1.04rem;
  }
}
</style>
