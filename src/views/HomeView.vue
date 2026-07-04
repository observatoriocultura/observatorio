<template>
  <section class="home-view">
    <div class="home-shell">
      <header class="home-intro">
        <p class="eyebrow">Secretaría de Cultura, Recreación y Deporte de Bogotá</p>
        <h1 class="home-logo-title">
          <img
            class="home-logo"
            :src="logoUrl"
            alt="Observatorio y Gestión del Conocimiento Cultural"
          />
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

const baseUrl = import.meta.env.BASE_URL
const logoUrl = `${baseUrl}resources/images/app/logotipo-navbar.png`

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
  padding: clamp(1rem, 2.2vw, 1.85rem);
  background: #ffffff;
  color: var(--home-text);
}

.home-shell {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2.6vw, 1.75rem);
  max-width: 1120px;
  margin: 0 auto;
}

.home-intro {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 760px;
  padding-top: clamp(0.35rem, 1.2vw, 0.8rem);
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #6c7780;
  font-size: 0.72rem;
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

.home-logo-title {
  max-width: 470px;
  margin-bottom: 1rem;
}

.home-logo {
  display: block;
  width: min(430px, 100%);
  height: auto;
}

.lead {
  max-width: 740px;
  margin-bottom: 0;
  color: #24313a;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
}

.access-section {
  padding-top: 0.4rem;
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
  gap: clamp(1rem, 2.4vw, 1.5rem);
}

.access-card {
  display: flex;
  min-height: clamp(205px, 23vw, 245px);
  flex-direction: column;
  justify-content: center;
  padding: clamp(1rem, 1.8vw, 1.25rem);
  border: 1px solid #e5e8ec;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.access-card:hover {
  transform: translateY(-2px);
  border-color: #d7dde3;
  box-shadow: 0 14px 34px rgba(24, 35, 43, 0.06);
}

.access-icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
  border-radius: 8px;
  font-size: 1.05rem;
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
  flex: 0;
}

h3 {
  margin-bottom: 0.4rem;
  color: var(--home-text);
  font-size: 1rem;
  font-weight: 850;
  line-height: 1.2;
}

.access-copy p {
  margin-bottom: 1rem;
  color: var(--home-muted);
  font-size: 0.84rem;
  line-height: 1.5;
}

.access-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.45rem;
  color: var(--home-text);
  font-size: 0.84rem;
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
    padding-top: 1.5rem;
  }

  .access-grid {
    grid-template-columns: 1fr;
  }

  .access-card {
    min-height: 220px;
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
