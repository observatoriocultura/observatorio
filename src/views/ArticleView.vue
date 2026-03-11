<script setup>
import { useRoute } from 'vue-router'
import { ref, watchEffect } from 'vue'

const route = useRoute()
const article = ref(null)
const error = ref(null)
const loading = ref(false)

const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    // Offset for header (adjust if you have a fixed header)
    const headerOffset = 24
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

watchEffect(async () => {
  const { year, slug } = route.params

  if (!year || !slug) return

  loading.value = true
  error.value = null
  article.value = null

  try {
    // Construct path using BASE_URL to respect vite.config.js base setting
    const baseUrl = import.meta.env.BASE_URL

    const [jsonResponse, htmlResponse] = await Promise.all([
      fetch(`${baseUrl}content/${year}/articles/${slug}/info.json`),
      fetch(`${baseUrl}content/${year}/articles/${slug}/content-1.html`),
    ])

    if (!jsonResponse.ok) {
      throw new Error(`HTTP error! status: ${jsonResponse.status}`)
    }

    const data = await jsonResponse.json()

    if (htmlResponse.ok) {
      data.content = await htmlResponse.text()
    }

    article.value = data
  } catch (e) {
    console.error(e)
    error.value = 'Artículo no encontrado'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="article-view">
    <div v-if="loading" class="loading">Cargando...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Layout Container -->
    <div v-else-if="article" class="article-layout">
      <!-- Sidebar / Table of Contents -->
      <aside class="article-sidebar">
        <nav aria-label="Tabla de contenido" class="toc-container">
          <div class="nav-head">
            <strong>Contenido</strong>
            <span class="badge">v1.0</span>
          </div>
          <div class="nav-body">
            <a
              v-for="item in article.table_of_contents"
              :key="item.slug"
              :href="`#${item.slug}`"
              :class="{ 'indent-level': item.level > 1 }"
              @click.prevent="scrollTo(item.slug)"
            >
              {{ item.title }}
            </a>
          </div>
        </nav>
      </aside>

      <!-- Main Article Content -->
      <main class="article-content-wrapper">
        <header class="article-header">
          <h1>{{ article.title }}</h1>
          <div class="meta">
            <p><strong>Por:</strong> {{ article.author }}</p>
            <p><strong>Fecha:</strong> {{ article.date }}</p>
          </div>
        </header>

        <div class="body">
          <p class="abstract">{{ article.abstract }}</p>
          <!-- Article HTML Content -->
          <div v-if="article.content" v-html="article.content"></div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.article-view {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
}

.loading,
.error {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.error {
  color: #ef4444;
}

/* Layout Grid */
.article-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (min-width: 980px) {
  .article-layout {
    grid-template-columns: 280px 1fr; /* Sidebar fixed width, Content flex */
    gap: 4rem;
    padding-top: 3rem;
  }
}

/* Sidebar Styles */
.article-sidebar {
  /* Only sticky on large screens */
  display: none; /* Hidden on small screens by default for this specific design request? Or stack it? usually stack. Let's stack it on mobile, but user asked for floating/permanent. */
  display: block;
}

@media (min-width: 980px) {
  .article-sidebar {
    position: sticky;
    top: 2rem; /* Floating offset from top */
    align-self: start;
    height: calc(100vh - 4rem);
    overflow-y: auto;
  }
}

/* Table of Contents Styles */
.toc-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
}

.nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #111;
  font-size: 0.95rem;
}

.nav-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-body a {
  display: block;
  text-decoration: none;
  color: #4b5563;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.nav-body a.indent-level {
  padding-left: 1.5rem;
  font-size: 0.85rem;
  color: #6b7280;
  border-left: 2px solid transparent;
}

.nav-body a:hover {
  background-color: #fff;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.badge {
  font-size: 0.7rem;
  padding: 0.2em 0.6em;
  background-color: #e5e7eb;
  border-radius: 999px;
  color: #4b5563;
  font-weight: 600;
}

/* Article Content Wrapper */
.article-content-wrapper {
  min-width: 0; /* Prevents flex/grid overflow issues */
}

/* Header Styles */
.article-header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem); /* Responsive typography */
  margin-bottom: 1rem;
  line-height: 1.1;
  color: #111;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.meta {
  color: #666;
  font-size: 0.95rem;
  display: flex;
  gap: 1.5rem;
}

/* Body Styles */
.body {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #374151;
}

.abstract {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 2rem;
  font-style: italic;
  border-left: 4px solid #2563eb;
  padding-left: 1.5rem;
}
</style>
