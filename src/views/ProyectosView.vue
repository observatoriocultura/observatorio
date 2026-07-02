<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchGoogleSheetCsv } from '../utils/googleSheets'

const contenidos = ref([])
const loading = ref(false)
const errorMessage = ref('')
const baseUrl = import.meta.env.BASE_URL
const defaultThumbnailUrl = `${baseUrl}resources/images/app/portada_16_9.jpg`
const sheetFileId =
  import.meta.env.VITE_PROYECTOS_SHEET_ID ?? '159HVaL2GEIQZhUuqdwKfi_bmZW3dqp5WjKlJYyJ0Bvk'
const sheetGid = import.meta.env.VITE_PROYECTOS_SHEET_GID ?? '518894995'

const pickFirst = (row, keys) => keys.map((key) => row[key]).find((value) => value?.trim?.())

const getThumbnailUrl = (contenido) =>
  contenido.year && contenido.id
    ? `${baseUrl}content/${contenido.year}/thumbnails/${contenido.id}.jpg`
    : null

const useDefaultThumbnail = (event) => {
  if (event.currentTarget.src.endsWith(defaultThumbnailUrl)) return
  event.currentTarget.src = defaultThumbnailUrl
}

const normalizeContenido = (row) => ({
  id: pickFirst(row, ['id', 'codigo', 'código']) ?? '',
  title: pickFirst(row, ['title', 'titulo', 'título', 'nombre']) ?? '',
  excerpt: pickFirst(row, ['excerpt', 'resumen', 'descripcion', 'descripción']) ?? '',
  link: pickFirst(row, ['link', 'url', 'ruta', 'enlace']) ?? '',
  tag: pickFirst(row, ['tag', 'categoria', 'categoría', 'etiqueta']) ?? 'Contenido',
  year: pickFirst(row, ['year', 'anio', 'año']) ?? null,
  date: pickFirst(row, ['date', 'fecha', 'vigencia']) ?? null,
})

const loadContenidos = async () => {
  if (!sheetFileId) return

  loading.value = true
  errorMessage.value = ''

  try {
    const rows = await fetchGoogleSheetCsv({
      fileId: sheetFileId,
      gid: sheetGid,
    })
    const sheetContenidos = rows
      .map(normalizeContenido)
      .filter((contenido) => contenido.title && contenido.link)

    if (sheetContenidos.length === 0) {
      throw new Error('Google Sheets no devolvió contenidos con título y enlace.')
    }

    contenidos.value = sheetContenidos
  } catch (error) {
    console.error('No fue posible cargar los contenidos desde Google Sheets.', error)
    errorMessage.value = 'No fue posible actualizar los contenidos desde Google Sheets.'
    contenidos.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadContenidos)
</script>

<template>
  <div class="contenidos-view">
    <div class="contenidos-shell">
      <header class="contenidos-header">
        <span class="eyebrow">Explora nuestro conocimiento</span>
        <h1>Publicaciones y contenidos</h1>
        <p class="lead">
          Recopilación de investigaciones, análisis de datos y documentos técnicos generados por el
          Observatorio para el fortalecimiento del ecosistema cultural de Bogotá.
        </p>
      </header>

      <p v-if="loading" class="status-message">Cargando contenidos...</p>
      <p v-else-if="errorMessage" class="status-message status-error">{{ errorMessage }}</p>
      <p v-else-if="contenidos.length === 0" class="status-message">
        No hay contenidos disponibles.
      </p>

      <div class="content-grid">
        <article v-for="(contenido, index) in contenidos" :key="index" class="content-card">
          <div class="card-meta">
            <span class="tag">{{ contenido.tag }}</span>
            <span v-if="contenido.date" class="date">{{ contenido.date }}</span>
          </div>
          <img
            v-if="getThumbnailUrl(contenido)"
            class="content-thumbnail"
            :src="getThumbnailUrl(contenido)"
            :alt="contenido.title"
            loading="lazy"
            @error="useDefaultThumbnail"
          />
          <RouterLink v-if="contenido.link.startsWith('/')" :to="contenido.link" class="card-title">
            {{ contenido.title }}
          </RouterLink>
          <a
            v-else
            :href="contenido.link"
            class="card-title"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ contenido.title }}
          </a>
          <p v-if="contenido.year" class="card-year">
            {{ contenido.year }}
          </p>
          <p class="card-excerpt">
            {{ contenido.excerpt }}
          </p>
          <RouterLink v-if="contenido.link.startsWith('/')" :to="contenido.link" class="card-link">
            {{ contenido.tag === 'Herramientas' ? 'Ir al repositorio' : 'Leer completo' }}
            <span aria-hidden="true">→</span>
          </RouterLink>
          <a
            v-else
            :href="contenido.link"
            class="card-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ contenido.tag === 'Herramientas' ? 'Ir al repositorio' : 'Leer completo' }}
            <span aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenidos-view {
  min-height: 100vh;
  padding: 4rem 1.5rem;
  background-color: #ffffff;
}

.contenidos-shell {
  max-width: 1100px;
  margin: 0 auto;
}

.contenidos-header {
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

.status-message {
  margin: -2rem 0 2.5rem;
  color: #5c6972;
  font-weight: 700;
}

.status-error {
  color: #a33a3a;
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

.content-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  margin-bottom: 1.25rem;
  background: #f0f2f4;
  border-radius: 4px;
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
  margin-bottom: 0.35rem;
  transition: color 0.2s ease;
}

.card-title:hover {
  color: #000;
}

.card-year {
  margin-bottom: 1rem;
  color: #8c96a0;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
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
  .contenidos-header {
    margin-bottom: 3rem;
  }
}
</style>
