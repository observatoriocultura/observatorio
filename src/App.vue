<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Observatorio</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Inicio</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/proyectos">Proyectos</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/contacto">Contacto</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido dinámico -->
    <div class="flex-grow-1">
      <router-view></router-view>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white text-center py-3">
      <div class="container">
        <p class="mb-0">&copy; 2025 Observatorio Cultural - Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>
