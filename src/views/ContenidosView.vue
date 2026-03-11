<template>
  <div class="contenidos-container">
    <header class="view-header">
      <h1>Contenidos</h1>
    </header>
    <main class="view-content">
      <ContenidoComponent />
    </main>
  </div>
</template>

<script setup>
import ContenidoComponent from '../components/202601_social_listening_residos/ContenidoComponent.vue'
</script>

<style scoped>
.contenidos-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.view-header h1 {
  font-size: 2rem;
  color: #2c3e50;
}
</style>
```
