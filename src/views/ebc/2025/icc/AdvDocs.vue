<script setup>
// Documentacion tecnica de la herramienta AutoDataViz (ADV)
</script>

<template>
  <div class="adv-docs-container container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <header class="docs-header mb-5 text-center">
          <div class="eyebrow mb-2">Arquitectura Frontend</div>
          <h1 class="docs-title">Documentacion Tecnica: Visualizador ADV</h1>
          <p class="docs-subtitle text-muted mt-3">
            Estructura logica, flujo de datos relacional y procesamiento reactivo del dashboard de
            la medicion.
          </p>
        </header>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-1 me-3">
                  <i class="bi bi-diagram-3"></i>
                </div>
                <h3 class="section-title mb-0">1. Arquitectura Base (AdvLayout.vue)</h3>
              </div>
              <p>
                <code>AdvLayout.vue</code> actua como contenedor principal de la aplicacion. Su
                responsabilidad es enrutar las vistas internas, distribuir contexto global y
                conservar estados de navegacion entre las secciones del visualizador.
              </p>
              <ul>
                <li>
                  <strong>Provision de contexto:</strong> usa <code>provide/inject</code> para
                  distribuir <code>codigoMedicion</code>, <code>surveyInfo</code> y constantes de
                  encuesta sin prop-drilling.
                </li>
                <li>
                  <strong>Navegacion por estado:</strong> alterna vistas mediante parametros de URL
                  y estado reactivo. Esto permite preservar datos ya cargados y reducir trabajo
                  innecesario al cambiar entre portada, resultados, indice y ficha tecnica.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-2 me-3">
                  <i class="bi bi-database-down"></i>
                </div>
                <h3 class="section-title mb-0">2. Jerarquia y Carga de Datos (JSON)</h3>
              </div>
              <p>
                El motor de resultados (<code>AdvResultados.vue</code>) evita APIs dinamicas y
                consume archivos JSON preprocesados alojados en el servidor. La carga se divide
                entre archivos base, necesarios para iniciar la vista, y archivos derivados que se
                descargan solo cuando el usuario solicita un cruce especifico.
              </p>

              <h5 class="mt-4 mb-3 fw-bold code-color">Arbol de datos base</h5>
              <div class="data-hierarchy mb-4 p-4 rounded bg-light">
                <div class="tree-node">
                  <i class="bi bi-folder-fill text-warning me-2"></i
                  ><strong>Medicion</strong>
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-primary me-2"></i
                  ><code>secciones.json</code> (agrupadores tematicos)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-primary me-2"></i
                  ><code>preguntas.json</code> (definiciones, textos y configuracion dataviz)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-primary me-2"></i
                  ><code>variables.json</code> (sub-elementos metricos de cada pregunta)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-danger me-2"></i
                  ><code>respuestas.json</code> (matriz consolidada de resultados)
                </div>
              </div>

              <h5 class="mt-4 mb-3 fw-bold code-color">Dimensiones derivadas</h5>
              <div class="data-hierarchy mb-4 p-4 rounded bg-light">
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-success me-2"></i
                  ><code>respuestas_localidad.json</code> (desglose territorial)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-success me-2"></i
                  ><code>respuestas_edad.json</code> (desglose por grupos de edad)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-success me-2"></i
                  ><code>respuestas_sexo.json</code> (desglose por sexo)
                </div>
                <div class="tree-node ms-3 border-start ps-3 py-2">
                  <i class="bi bi-filetype-json text-success me-2"></i
                  ><code>respuestas_clase.json</code> (desglose por clase de vivienda)
                </div>
              </div>

              <h5 class="mt-4 mb-3 fw-bold text-dark">Carga diferida y cache en memoria</h5>
              <p>
                Las dimensiones derivadas se cargan bajo demanda. Si el usuario filtra por
                localidad, edad, sexo o clase de vivienda, el sistema ejecuta un
                <code>fetch</code> al archivo correspondiente y guarda el resultado en memoria para
                reutilizarlo durante la sesion.
              </p>
              <p>
                Los filtros son mutuamente excluyentes: al activar una dimension, las otras se
                limpian. Esto evita combinaciones ambiguas y mantiene un unico denominador
                estadistico para calcular porcentajes.
              </p>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-3 me-3">
                  <i class="bi bi-calculator"></i>
                </div>
                <h3 class="section-title mb-0">3. Motor Reactivo de Calculos</h3>
              </div>
              <p>
                Cada cambio de pregunta, variable, respuesta o filtro activa una cadena de calculo
                reactiva. El flujo usa la fuente activa, filtra por pregunta y recalcula los
                porcentajes a partir de los factores de expansion.
              </p>

              <ul class="process-list mt-4">
                <li>
                  <div class="process-number">1</div>
                  <div class="process-content">
                    <strong>Seleccion de fuente:</strong>
                    <code>respuestas.json</code> se usa sin filtro. Si hay una dimension activa, se
                    usan los datos de localidad, edad, sexo o clase ya cargados.
                  </div>
                </li>
                <li>
                  <div class="process-number">2</div>
                  <div class="process-content">
                    <strong>Filtrado por pregunta:</strong> las filas se reducen al
                    <code>indice_pregunta</code> seleccionado.
                  </div>
                </li>
                <li>
                  <div class="process-number">3</div>
                  <div class="process-content">
                    <strong>Denominador por variable:</strong> se suma <code>suma_factor</code> por
                    <code>indice_variable</code> para preservar el peso poblacional de cada
                    pregunta.
                  </div>
                </li>
                <li>
                  <div class="process-number">4</div>
                  <div class="process-content">
                    <strong>Porcentaje:</strong> cada respuesta se calcula como
                    <code>(suma_factor / total_variable_factor) * 100</code>.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-4 me-3">
                  <i class="bi bi-pie-chart"></i>
                </div>
                <h3 class="section-title mb-0">4. Visualizacion Grafica y Debugging</h3>
              </div>
              <p>
                La capa grafica delega el renderizado a Highcharts y a componentes especializados.
                Los componentes reciben datos ya limpios mediante props y se concentran en
                representar barras, columnas, donuts, tablas o mapas sin recalcular la fuente
                estadistica principal.
              </p>
              <p>
                El panel de inspeccion mantiene una vista tipo glassbox para auditar respuestas,
                factores de expansion, llaves foraneas y calculos intermedios sin alterar la
                experiencia de usuario del dashboard.
              </p>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-5 me-3">
                  <i class="bi bi-geo-alt"></i>
                </div>
                <h3 class="section-title mb-0">5. Analisis Territorial (Localidades)</h3>
              </div>
              <p>
                <code>LocalidadesView.vue</code> centraliza el desglose geografico. Consume
                <code>respuestas_localidad.json</code> y permite comparar las localidades mediante
                ranking, tabla y mapa coropletico.
              </p>
              <p>
                La vista mantiene selectores de variable y respuesta para recalcular, por
                localidad, la participacion de una opcion especifica sobre el total de la variable.
              </p>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-3 me-3">
                  <i class="bi bi-people"></i>
                </div>
                <h3 class="section-title mb-0">6. Analisis Demografico (Grupos de Edad)</h3>
              </div>
              <p>
                <code>GruposEdadView.vue</code> permite comparar resultados por rangos etarios.
                Consume <code>respuestas_edad.json</code> y agrupa la muestra en tres bloques:
                jovenes, adultos y personas mayores.
              </p>
              <p>
                Al tener pocas categorias, usa un grafico de columnas y una tabla para mostrar la
                distribucion de la respuesta seleccionada por grupo de edad.
              </p>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-6 me-3">
                  <i class="bi bi-gender-ambiguous"></i>
                </div>
                <h3 class="section-title mb-0">7. Analisis por Sexo</h3>
              </div>
              <p>
                La carpeta <code>sexos/</code> incorpora el desglose de resultados por sexo. El
                orquestador <code>SexoView.vue</code> recibe la pregunta activa, sus variables, las
                posibles respuestas y el arreglo <code>respuestasSexo</code>, cargado desde
                <code>respuestas_sexo.json</code>.
              </p>
              <ul>
                <li>
                  <strong>Filtro global:</strong> <code>sexoSeleccionado</code> en
                  <code>AdvResultados.vue</code> permite recalcular los resultados generales para
                  Hombre o Mujer.
                </li>
                <li>
                  <strong>Vista de desglose:</strong> <code>SexoView.vue</code> compara ambos sexos
                  para una variable y respuesta especificas.
                </li>
                <li>
                  <strong>Salida visual:</strong> <code>SexoChart.vue</code> muestra la comparacion
                  grafica y <code>SexoTable.vue</code> expone los datos tabulares, incluyendo
                  <code>suma_factor</code>, total y porcentaje.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-7 me-3">
                  <i class="bi bi-house-door"></i>
                </div>
                <h3 class="section-title mb-0">8. Analisis por Clase de Vivienda</h3>
              </div>
              <p>
                La carpeta <code>clases/</code> agrega el desglose por clase de vivienda. El
                sistema usa las constantes <code>CLASES</code> para nombrar las categorias
                <strong>Urbano</strong> y <strong>Rural</strong>, y consume
                <code>respuestas_clase.json</code> bajo demanda.
              </p>
              <ul>
                <li>
                  <strong>Filtro global:</strong> <code>claseSeleccionada</code> recalcula la vista
                  principal sobre una sola clase de vivienda.
                </li>
                <li>
                  <strong>Vista de desglose:</strong> <code>ClaseView.vue</code> compara urbano y
                  rural para la variable y respuesta seleccionadas.
                </li>
                <li>
                  <strong>Salida visual:</strong> <code>ClaseChart.vue</code> presenta la
                  comparacion grafica y <code>ClaseTable.vue</code> muestra la matriz de resultados
                  con factores expandidos y porcentajes.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adv-docs-container {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #3b4252;
  line-height: 1.6;
}

.eyebrow {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #f0ebf7;
  color: #5f4481;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 50px;
}

.docs-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: #32204a;
  letter-spacing: -0.02em;
}

.docs-subtitle {
  font-size: 1.15rem;
  max-width: 600px;
  margin: 0 auto;
}

.docs-card {
  border-radius: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fcfbfd 100%);
}

.docs-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(50, 32, 74, 0.08) !important;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #32204a;
  letter-spacing: -0.01em;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  color: white;
  flex: 0 0 48px;
}

.feature-icon-1 {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
}

.feature-icon-2 {
  background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
}

.feature-icon-3 {
  background: linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%);
}

.feature-icon-4 {
  background: linear-gradient(135deg, #feca57 0%, #ff9f43 100%);
}

.feature-icon-5 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.feature-icon-6 {
  background: linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%);
}

.feature-icon-7 {
  background: linear-gradient(135deg, #78909c 0%, #455a64 100%);
}

.code-color {
  color: #5f4481;
}

.data-hierarchy {
  font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  border: 1px solid #eef0f2;
}

.tree-node {
  position: relative;
}

.process-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.process-list li {
  display: flex;
  margin-bottom: 1.5rem;
  background: #f9f9fb;
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 4px solid #32204a;
}

.process-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #32204a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  margin-right: 1.25rem;
  margin-top: 0.1rem;
}

.process-content strong {
  display: block;
  color: #32204a;
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
}

code {
  background: #f1f3f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #d6336c;
  font-size: 0.85em;
  font-family:
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    'Liberation Mono',
    'Courier New',
    monospace;
}
</style>
