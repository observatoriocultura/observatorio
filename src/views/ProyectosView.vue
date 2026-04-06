<script setup>
import { RouterLink } from 'vue-router'

const projects = [
  {
    title: 'Lectura, Escritura y Oralidad (LEO) 2025',
    excerpt:
      'Estudio de percepciones y expectativas ciudadanas sobre lectura, escritura y oralidad en Bogotá.',
    link: '/ebc/lectura-escritura-y-oralidad-2025',
    tag: 'Análisis 2026',
    date: 'Abril 2026',
  },
  {
    title: 'Análisis de reel sobre cultura ciudadana en el metro',
    excerpt:
      'Estudio de percepciones y expectativas ciudadanas sobre convivencia y normas en el futuro sistema de transporte masivo de la ciudad.',
    link: '/2026/analisis-reel-cultura-ciudadana-metro',
    tag: 'Análisis 2026',
    date: 'Marzo 2026',
  },
  {
    title: 'Problemática de residuos en el espacio público',
    excerpt:
      'Análisis de comentarios en X sobre la gestión de basuras y limpieza urbana, identificando puntos críticos y propuestas ciudadanas.',
    link: '/2026/analisis-post-x-residuos',
    tag: 'Análisis 2026',
    date: 'Febrero 2026',
  },
  {
    title: 'Plan de Cultura 2038 - Análisis de Participaciones',
    excerpt:
      'Informe interactivo del resultado del procesamiento de miles de participaciones ciudadanas para la construcción de la hoja de ruta cultural.',
    link: '/analisis-participaciones-plan-cultura-2038',
    tag: 'Plan de Cultura',
    date: '2025',
  },
  {
    title: 'Repositorio de Contenidos',
    excerpt:
      'Acceso a la biblioteca completa de recursos, metodologías y documentos de referencia del Observatorio.',
    link: '/contenidos',
    tag: 'Herramientas',
    date: null,
  },
]
</script>

<template>
  <div class="proyectos-view">
    <div class="proyectos-shell">
      <header class="proyectos-header">
        <span class="eyebrow">Explora nuestro conocimiento</span>
        <h1>Publicaciones y contenidos</h1>
        <p class="lead">
          Recopilación de investigaciones, análisis de datos y documentos técnicos generados por el
          Observatorio para el fortalecimiento del ecosistema cultural de Bogotá.
        </p>
      </header>

      <div class="content-grid">
        <article v-for="(project, index) in projects" :key="index" class="content-card">
          <div class="card-meta">
            <span class="tag">{{ project.tag }}</span>
            <span v-if="project.date" class="date">{{ project.date }}</span>
          </div>
          <RouterLink :to="project.link" class="card-title">
            {{ project.title }}
          </RouterLink>
          <p class="card-excerpt">
            {{ project.excerpt }}
          </p>
          <RouterLink :to="project.link" class="card-link">
            {{ project.tag === 'Herramientas' ? 'Ir al repositorio' : 'Leer completo' }} →
          </RouterLink>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proyectos-view {
  min-height: 100vh;
  padding: 4rem 1.5rem;
  background-color: #ffffff;
}

.proyectos-shell {
  max-width: 1100px;
  margin: 0 auto;
}

.proyectos-header {
  margin-bottom: 4rem;
  max-width: 700px;
}

.eyebrow {
  display: block;
  margin-bottom: 1rem;
  color: #8c96a0;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.lead {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #5c6972;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2.5rem;
}

.content-card {
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f2f4;
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-4px);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.tag {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  background: #f0f2f4;
  color: #5c6972;
  border-radius: 4px;
}

.date {
  font-size: 0.85rem;
  color: #8c96a0;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.3;
  color: #1a1a1a;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.card-title:hover {
  color: #000;
}

.card-excerpt {
  font-size: 1rem;
  line-height: 1.5;
  color: #5c6972;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.card-link {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1a1a1a;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .proyectos-header {
    margin-bottom: 3rem;
  }
}
</style>
