<template>
  <div>
    <div class="investigaciones-search mb-4 mt-2">
      <ListSearchInput
        :model-value="searchTerm"
        id="investigaciones-search"
        placeholder="Buscar investigaciones..."
        aria-label="Buscar investigaciones"
        clear-label="Limpiar busqueda de investigaciones"
        @update:model-value="emit('update:searchTerm', $event)"
      />
    </div>

    <div
      v-if="investigaciones.length === 0"
      class="alert alert-warning text-center mx-auto"
      style="max-width: 920px"
    >
      No se encontraron investigaciones para tu busqueda.
    </div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
      <div v-for="investigacion in investigaciones" :key="investigacion.id" class="col">
        <a
          href="#"
          rel="noopener"
          class="text-decoration-none text-dark d-block h-100 video-card-link"
          @click.prevent="emit('select', investigacion)"
        >
          <div class="card h-100 border-0 bg-transparent">
            <img
              :src="`${baseUrl}content/investigaciones/thumbnails/${investigacion.id}.jpg`"
              class="card-img-top rounded-4 mb-2 object-fit-cover"
              style="aspect-ratio: 16/9"
              :alt="investigacion.titulo"
              @error="
                (event) =>
                  (event.target.src = `${baseUrl}content/investigaciones/thumbnails/nd.jpg`)
              "
            />
            <div class="card-body p-0">
              <h6 class="card-title fw-bold mb-1 video-title" :title="investigacion.titulo">
                {{ investigacion.titulo }}
              </h6>
              <div class="text-muted small video-subtitle">
                <div class="text-truncate" :title="investigacion.tema">
                  {{ investigacion.tema }}
                </div>
                <div>{{ investigacion.anio }}</div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import ListSearchInput from '../../components/ListSearchInput.vue'

defineProps({
  investigaciones: {
    type: Array,
    default: () => [],
  },
  baseUrl: {
    type: String,
    default: '/',
  },
  searchTerm: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select', 'update:searchTerm'])
</script>

<style scoped>
.investigaciones-search {
  max-width: 920px;
  margin-right: auto;
  margin-left: auto;
}

.video-title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 1rem;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.video-card-link:hover .video-title {
  color: #0d6efd;
}

.video-subtitle {
  font-size: 0.875rem;
}
</style>
