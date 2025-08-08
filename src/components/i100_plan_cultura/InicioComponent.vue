<template>
  <div class="p-8 max-w-4xl mx-auto center-box-750">
    <h2 class="text-4xl font-bold mb-4">
      Análisis de Participaciones - Plan de Cultura Bogotá 2038
    </h2>

    <p class="text-lg mb-6">
      Este informe interactivo presenta los hallazgos derivados del análisis de las más de 6.500
      participaciones ciudadanas recogidas en los espacios de construcción colaborativa realizados
      entre abril y junio de 2025. Se trata de un ejercicio cualitativo apoyado por inteligencia
      artificial, que busca sistematizar las voces de la ciudadanía para nutrir la formulación del
      Plan Distrital de Cultura hacia 2038.
    </p>

    <h3 class="text-2xl font-semibold mb-2">¿Qué encontrarás aquí?</h3>
    <ul class="list-disc pl-6 mb-6">
      <li>Una síntesis interpretativa de los imaginarios culturales hacia el futuro (Momento 1)</li>
      <li>
        Principales barreras y oportunidades frente a seis dimensiones estratégicas (Momento 2)
      </li>
      <li>
        Relatos colectivos sobre el papel de la cultura en la transformación de temas urbanos
        (Momento 3)
      </li>
      <li>Visualizaciones interactivas: nubes de palabras, gráficas temáticas, matrices y más</li>
    </ul>

    <h3 class="text-2xl font-semibold mb-2">¿Cómo se hizo el análisis?</h3>
    <p class="mb-6">
      La metodología implementada combina técnicas de procesamiento de lenguaje natural,
      codificación semiautomatizada, clasificación temática y análisis de sentimiento, estructurada
      en múltiples fases y basada en un modelo ya validado en 2024. Los resultados aquí expuestos
      conservan el vínculo con las voces originales a través de citas, metáforas y fragmentos
      destacados.
    </p>

    <h3 class="text-2xl font-semibold mb-2">Un ejercicio colectivo con gran alcance</h3>
    <p class="mb-2">
      <strong>22 encuentros</strong> realizados en distintos territorios y sectores.<br />
      <strong>5.800 personas</strong> participaron de manera activa.<br />
      <strong>140.000 palabras</strong> analizadas, equivalentes a un libro de 450 páginas.
    </p>

    <div class="mt-10">
      <router-link
        to="/resultados"
        class="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        Explorar Resultados
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No se requiere lógica JS para esta pantalla de introducción
</script>

<style scoped>
/* Estilos adicionales si deseas personalizar */
</style>
