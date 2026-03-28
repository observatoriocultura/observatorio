<template>
  <nav class="navbar navbar-expand-lg">
    <div class="nav-container">
      <RouterLink to="/" title="Ir al inicio">
        <img
          src="/resources/images/app/logo-navbar.png"
          alt="Observatorio"
          class="me-2"
          style="height: 22px"
        />
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%; /* Asegura que la línea y el fondo ocupen todo el ancho */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #fcdea0;
  padding: 0; /* Reducido para hacerla más angosta (delgada) */
  transition: background 0.3s ease;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1rem; /* Margen interno para que no toque los bordes */
}

/* Opcional: Ajuste suave para los enlaces */
.nav-link {
  font-weight: 500;
  color: #18232b;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #000;
}
</style>
