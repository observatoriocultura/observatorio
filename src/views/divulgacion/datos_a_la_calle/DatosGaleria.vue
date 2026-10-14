<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

const categories = ['Todas', 'Dispositivos', 'Encuentros', 'Espacio público']
const photos = [
  {
    file: '20260828-a.jpeg',
    category: 'Espacio público',
    title: 'Un encuentro en la ciudad',
    alt: 'Personas conversan junto a los dispositivos morados y amarillos de Datos a la Calle, frente a una iglesia en una plaza',
  },
  {
    file: '2026-filbo-a.png',
    category: 'Encuentros',
    title: 'Historias que merecen escribirse',
    alt: 'Participantes escriben en un dispositivo que pregunta qué le escribirían a la persona que les enseñó a escribir',
  },
  {
    file: '2026-dalc-a.png',
    category: 'Dispositivos',
    title: 'Una historia para mantener viva',
    alt: 'Tablero con tubos de participación, un dato de oralidad y una pregunta sobre las historias personales que queremos mantener vivas',
  },
  {
    file: '20261013-b.jpeg',
    category: 'Encuentros',
    title: 'Una carta a la Bogotá del futuro',
    alt: 'Ciudadanía y facilitadores se encuentran junto a un tablero que invita a escribirle una carta a Bogotá',
  },
  {
    file: '2026-dalc-b.png',
    category: 'Dispositivos',
    title: 'Escuchar también nos conecta',
    alt: 'Dos personas usan un dispositivo móvil que pregunta qué prefieren escuchar mientras se mueven por la ciudad',
  },
  {
    file: '20261013-c.png',
    category: 'Espacio público',
    title: '¿Por gusto o por obligación?',
    alt: 'Dos personas conversan en la calle junto a un dispositivo que pregunta por los motivos para escribir',
  },
  {
    file: '2026-dalc-c.png',
    category: 'Encuentros',
    title: 'Un espacio para compartir historias',
    alt: 'Dos fotografías de grupos de personas conversando y escuchándose dentro de un espacio con libros',
  },
  {
    file: '2026-dalc-d.png',
    category: 'Encuentros',
    title: 'La música y lo que sentimos',
    alt: 'Facilitador y participante junto a un tablero que pregunta por la última vez que escucharon una canción para cambiar su estado de ánimo',
  },
  {
    file: '20261013-a.jpeg',
    category: 'Espacio público',
    title: 'La ciudad que imaginamos',
    alt: 'Participantes escriben sobre una pizarra de Datos a la Calle en un espacio al aire libre',
  },
  {
    file: '2026-01a.jpg',
    category: 'Dispositivos',
    title: 'Datos para nuestra Bogotá',
    alt: 'Conjunto de tableros participativos morados y amarillos y una pieza de Datos a la Calle para los 487 años de Bogotá',
  },
  {
    file: '202610-cefe-1.png',
    category: 'Dispositivos',
    title: 'Datos, preguntas y conversaciones',
    alt: 'Imagen anotada de personas frente a tres dispositivos que identifica sus preguntas, datos y conversaciones',
  },
  {
    file: '20260525-a.jpg',
    category: 'Espacio público',
    title: 'Preguntas al paso',
    alt: 'Dos pizarras participativas de madera en una plaza, con mensajes escritos por la ciudadanía',
  },
]
const imageUrl = (file) =>
  `${import.meta.env.BASE_URL}content/divulgacion/datos-a-la-calle/demo/${file}`
const category = ref('Todas')
const expanded = ref(false)
const filteredPhotos = computed(() =>
  photos.filter((photo) => category.value === 'Todas' || photo.category === category.value),
)
const visiblePhotos = computed(() =>
  expanded.value ? filteredPhotos.value : filteredPhotos.value.slice(0, 6),
)
const dialog = ref(null)
const selectedIndex = ref(0)
const selectedPhoto = computed(() => filteredPhotos.value[selectedIndex.value])

function selectCategory(value) {
  category.value = value
  expanded.value = false
  selectedIndex.value = 0
}

async function openPhoto(index) {
  selectedIndex.value = index
  await nextTick()
  dialog.value.showModal()
}

function movePhoto(direction) {
  selectedIndex.value =
    (selectedIndex.value + direction + filteredPhotos.value.length) % filteredPhotos.value.length
}

function closeOnBackdrop(event) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.value.close()
}

onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <div class="dalc-gallery">
    <div class="gallery-toolbar">
      <div class="gallery-filters" role="group" aria-label="Filtrar fotografías">
        <button
          v-for="filter in categories"
          :key="filter"
          type="button"
          :aria-pressed="category === filter"
          aria-controls="dalc-photo-grid"
          @click="selectCategory(filter)"
        >
          {{ filter }}
        </button>
      </div>
      <p class="gallery-count" aria-live="polite">{{ filteredPhotos.length }} fotografías</p>
    </div>
    <div id="dalc-photo-grid" class="photo-grid">
      <figure v-for="(photo, index) in visiblePhotos" :key="photo.file" class="gallery-photo">
        <button
          type="button"
          :aria-label="`Ampliar fotografía: ${photo.title}`"
          aria-haspopup="dialog"
          @click="openPhoto(index)"
        >
          <img :src="imageUrl(photo.file)" :alt="photo.alt" loading="lazy" decoding="async" />
          <span class="photo-expand" aria-hidden="true"
            ><i class="bi bi-arrows-angle-expand"></i
          ></span>
        </button>
        <figcaption>
          <span>{{ photo.category }}</span>
          <h3>{{ photo.title }}</h3>
        </figcaption>
      </figure>
    </div>
    <div v-if="filteredPhotos.length > 6" class="gallery-more">
      <button
        type="button"
        :aria-expanded="expanded"
        aria-controls="dalc-photo-grid"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ver menos fotografías' : `Explora las ${filteredPhotos.length} fotografías`
        }}<i class="bi" :class="expanded ? 'bi-arrow-up' : 'bi-arrow-down'" aria-hidden="true"></i>
      </button>
    </div>
    <dialog
      ref="dialog"
      class="photo-dialog"
      aria-labelledby="dalc-photo-title"
      @click="closeOnBackdrop"
      @keydown.left.prevent="movePhoto(-1)"
      @keydown.right.prevent="movePhoto(1)"
    >
      <div class="dialog-top">
        <span>Datos a la Calle · {{ selectedPhoto.category }}</span
        ><button type="button" aria-label="Cerrar fotografía" autofocus @click="dialog.close()">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>
      <img class="dialog-image" :src="imageUrl(selectedPhoto.file)" :alt="selectedPhoto.alt" />
      <div class="dialog-bottom">
        <div aria-live="polite" aria-atomic="true">
          <h3 id="dalc-photo-title">{{ selectedPhoto.title }}</h3>
          <p>{{ selectedIndex + 1 }} / {{ filteredPhotos.length }}</p>
        </div>
        <div class="dialog-controls">
          <button type="button" aria-label="Fotografía anterior" @click="movePhoto(-1)">
            <i class="bi bi-arrow-left" aria-hidden="true"></i></button
          ><button type="button" aria-label="Fotografía siguiente" @click="movePhoto(1)">
            <i class="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.gallery-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}
.gallery-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.gallery-filters button {
  background: none;
  border: 1px solid #dcd6e6;
  border-radius: 30px;
  padding: 9px 16px;
  font-size: 0.67rem;
  color: var(--dalc-muted);
  transition:
    background 160ms,
    color 160ms;
}
.gallery-filters button[aria-pressed='true'] {
  background: var(--dalc-ink);
  border-color: var(--dalc-ink);
  color: white;
}
.gallery-filters button:hover {
  border-color: var(--dalc-purple);
}
.gallery-count {
  font-size: 0.63rem;
  color: var(--dalc-muted);
  margin: 0;
  white-space: nowrap;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 22px;
}
.gallery-photo {
  margin: 0;
}
.gallery-photo > button {
  display: block;
  width: 100%;
  position: relative;
  border: 0;
  padding: 0;
  border-radius: 5px;
  background: #e7e2ee;
  overflow: hidden;
  text-align: left;
}
.gallery-photo img {
  width: 100%;
  height: 340px;
  object-fit: cover;
  transition: transform 350ms;
}
.gallery-photo > button:hover img {
  transform: scale(1.04);
}
.photo-expand {
  display: grid;
  place-items: center;
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 32px;
  height: 32px;
  background: #ffffffef;
  color: var(--dalc-ink);
  border-radius: 50%;
  font-size: 0.8rem;
}
.gallery-photo figcaption {
  padding-top: 14px;
}
.gallery-photo figcaption > span {
  color: var(--dalc-purple);
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.gallery-photo h3 {
  margin: 6px 0 0;
  color: var(--dalc-ink);
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.45;
}
.gallery-more {
  display: flex;
  justify-content: center;
  margin-top: 38px;
}
.gallery-more > button {
  display: flex;
  align-items: center;
  gap: 28px;
  border: 1px solid #d5cce3;
  background: none;
  color: var(--dalc-ink);
  padding: 14px 22px;
  border-radius: 4px;
  font-size: 0.72rem;
}
.gallery-more > button:hover {
  background: #eee8fa;
}
.photo-dialog {
  position: fixed;
  inset: 0;
  width: min(920px, calc(100% - 48px));
  max-width: none;
  max-height: calc(100dvh - 40px);
  background: #faf9f5;
  padding: 18px 22px;
  margin: auto;
  border: 0;
  border-radius: 10px;
  box-shadow: 0 24px 100px #00000035;
  color: var(--dalc-ink);
}
.photo-dialog::backdrop {
  background: #21182ce8;
  backdrop-filter: blur(6px);
}
.dialog-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 12px;
}
.dialog-top > span {
  font-size: 0.65rem;
  color: var(--dalc-muted);
}
.dialog-top > button,
.dialog-controls > button {
  display: grid;
  place-items: center;
  background: #ece6f5;
  border: 0;
  color: var(--dalc-ink);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dialog-image {
  display: block;
  width: 100%;
  height: min(65dvh, 650px);
  object-fit: contain;
  background: #eae6ee;
}
.dialog-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-top: 16px;
}
.dialog-bottom h3 {
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 650;
}
.dialog-bottom p {
  margin: 0;
  font-size: 0.65rem;
  color: var(--dalc-muted);
}
.dialog-controls {
  display: flex;
  gap: 10px;
}
button:focus-visible {
  outline: 3px solid var(--dalc-purple);
  outline-offset: 4px;
}
@media (max-width: 1000px) {
  .gallery-photo img {
    height: 290px;
  }
}
@media (max-width: 850px) {
  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .gallery-photo img {
    height: 330px;
  }
}
@container datos-calle (max-width: 700px) {
  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .gallery-toolbar {
    align-items: start;
    flex-direction: column;
    gap: 14px;
  }
}
@media (max-width: 600px) {
  .gallery-toolbar {
    align-items: start;
    flex-direction: column;
    gap: 14px;
  }
  .gallery-filters {
    gap: 6px;
  }
  .gallery-filters button {
    padding: 9px 12px;
    font-size: 0.62rem;
  }
  .photo-grid {
    gap: 22px 12px;
  }
  .gallery-photo img {
    height: 215px;
  }
  .gallery-photo h3 {
    font-size: 0.74rem;
  }
  .gallery-photo figcaption > span {
    font-size: 0.5rem;
  }
  .photo-expand {
    width: 27px;
    height: 27px;
    right: 8px;
    bottom: 8px;
    font-size: 0.65rem;
  }
  .photo-dialog {
    width: calc(100% - 24px);
    padding: 12px;
  }
  .dialog-image {
    height: 60dvh;
  }
  .dialog-bottom h3 {
    font-size: 0.8rem;
  }
}
@media (max-width: 360px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }
  .gallery-photo img {
    height: 340px;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
