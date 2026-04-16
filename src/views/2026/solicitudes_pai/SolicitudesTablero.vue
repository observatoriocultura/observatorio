<template>
  <div class="container-fluid px-3">
    <div class="row">
      <div class="col-12 text-center">
        <!-- Contenedor centrado y ajustado al viewport -->
        <div
          class="mx-auto overflow-hidden"
          style="max-width: 1150px; margin-top: 0.5rem; margin-bottom: 0.5rem"
        >
          <div class="card-body p-0 d-flex justify-content-center">
            <!-- Iframe embebido de Looker Studio optimizado para 1366x768px -->
            <iframe
              src="https://lookerstudio.google.com/embed/reporting/53b7b567-34fa-4994-b74e-e07be86d8317"
              frameborder="0"
              style="border: 0; width: 100%; height: calc(100vh - 180px); min-height: 500px"
              allowfullscreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            >
            </iframe>
          </div>
        </div>
        <div class="mt-3 mb-4">
          <a
            href="https://lookerstudio.google.com/reporting/53b7b567-34fa-4994-b74e-e07be86d8317/page/p_y431hdpzrd/edit"
            target="_blank"
            class="btn btn-primary border-0 px-4 py-2"
            style="background-color: #0b2240; color: white"
          >
            Abrir tablero en otra pestaña
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
iframe {
  display: block;
}
</style>
