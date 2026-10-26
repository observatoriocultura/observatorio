<script setup>
import { useRoute } from 'vue-router'
import { ref, watch, watchEffect } from 'vue'

const route = useRoute()
const article = ref(null)
const error = ref(null)
const loading = ref(false)
const articleHeader = ref(null)
const headerHeight = ref(0)
const activeSection = ref(null)

// Keep navigation offsets in sync when the title wraps or the viewport changes.
watch(
  articleHeader,
  (element, _previous, onCleanup) => {
    if (!element) {
      headerHeight.value = 0
      return
    }

    const updateHeight = () => {
      headerHeight.value = element.getBoundingClientRect().height
    }
    const observer = new ResizeObserver(updateHeight)
    updateHeight()
    observer.observe(element)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  // Split to avoid timezone shift issues with "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    activeSection.value = id
    const headerOffset = (articleHeader.value?.getBoundingClientRect().height ?? 0) + 16
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
  activeSection.value = null

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
    document.title = `${data.title} | Observatorio`
  } catch (e) {
    console.error(e)
    error.value = 'Artículo no encontrado'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="article-view" :style="{ '--article-header-height': `${headerHeight}px` }">
    <div v-if="loading" class="loading">Cargando...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Layout Container -->
    <div v-else-if="article" class="article-layout">
      <header ref="articleHeader" class="article-header">
        <h1>{{ article.title }}</h1>
        <div class="meta">
          <p title="Autor/a"><i class="bi bi-person-circle me-1"></i> {{ article.author }}</p>
          <p title="Fecha de publicación">
            <i class="bi bi-calendar3 me-1"></i>
            {{ formatDate(article.date) }}
          </p>
        </div>
      </header>

      <div class="article-columns">
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
                :class="{ 'indent-level': item.level > 1, active: activeSection === item.slug }"
                :aria-current="activeSection === item.slug ? 'location' : undefined"
                @click.prevent="scrollTo(item.slug)"
              >
                <span v-if="item.number" class="toc-number">{{ item.number }}</span>
                <span class="toc-title">{{ item.title }}</span>
              </a>
            </div>
          </nav>
        </aside>

        <!-- Main Article Content -->
        <main class="article-content-wrapper">
          <div class="body">
            <p class="abstract">{{ article.abstract }}</p>
            <!-- Article HTML Content -->
            <div v-if="article.content" v-html="article.content"></div>
          </div>
        </main>
      </div>
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 0.9rem 2rem;
}

.article-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 980px) {
  .article-columns {
    grid-template-columns: 310px minmax(0, 1fr);
  }
}

/* Sidebar Styles */
.article-sidebar {
  min-width: 0;
}

@media (min-width: 980px) {
  .article-sidebar {
    position: sticky;
    top: calc(var(--article-header-height, 0px) + 1rem);
    align-self: start;
    max-height: calc(100vh - var(--article-header-height, 0px) - 2rem);
    max-height: calc(100dvh - var(--article-header-height, 0px) - 2rem);
    overflow-y: auto;
  }
}

/* Table of Contents Styles */
.toc-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem;
  width: 100%;
}

.nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #111;
  font-size: 0.88rem;
}

.nav-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.nav-body a {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  text-decoration: none;
  color: #4b5563;
  padding: 0.4rem 0.45rem;
  border-radius: 6px;
  font-size: 0.84rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  line-height: 1.4;
}

.nav-body a.indent-level {
  padding-left: 0.9rem;
  font-size: 0.8rem;
  color: #6b7280;
  border-left: 2px solid transparent;
}

.toc-number {
  flex: 0 0 auto;
  min-width: 1.75rem;
  padding: 0.12rem 0.3rem;
  border: 1px solid #ddd4e8;
  border-radius: 5px;
  background-color: #eee8f5;
  color: #61497d;
  font-size: 0.7rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
  text-align: center;
}

.toc-title {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.nav-body a.indent-level .toc-number {
  background-color: #f5f1f8;
  color: #756388;
  font-size: 0.7rem;
}

.nav-body a:hover,
.nav-body a:focus-visible {
  background-color: #fff;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-body a.active {
  background-color: #eee8f5;
  color: #51346f;
  font-weight: 600;
  box-shadow: inset 3px 0 0 #765493;
}

.nav-body a.active .toc-number {
  background-color: #765493;
  border-color: #765493;
  color: #fff;
}

.nav-body a:focus-visible {
  outline: 2px solid #61497d;
  outline-offset: 2px;
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
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 1.25rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  box-shadow: 0 4px 10px -8px rgba(0, 0, 0, 0.2);
}

h1 {
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  margin-bottom: 0.5rem;
  line-height: 1.25;
  color: #111;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.meta {
  color: #666;
  font-size: 0.82rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
}

.meta p {
  margin: 0;
}

@media (max-width: 767.98px) {
  .article-header {
    padding-left: 3.25rem;
  }
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
  border-left: 4px solid #d5c7e7;
  padding-left: 1.5rem;
}
</style>
