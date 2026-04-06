<script setup>
// Componente de Documentación Técnica de la Herramienta EBC
</script>

<template>
  <div class="adv-docs-container container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        
        <!-- HEADER -->
        <header class="docs-header mb-5 text-center">
          <div class="eyebrow mb-2">Arquitectura Frontend</div>
          <h1 class="docs-title">Documentación Técnica: Visualizador ADV</h1>
          <p class="docs-subtitle text-muted mt-3">
            Estructura lógica, flujo de datos relacional y procesamiento reactivo del dashboard de la Medición.
          </p>
        </header>

        <!-- CARD 1: ARQUITECTURA GENERAL -->
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
                El componente <code>AdvLayout.vue</code> actúa como la piedra angular de la aplicación. Su función principal es comportarse como el contenedor (Layout) que enruta y mantiene vivos los estados de las vistas internas.
              </p>
              <ul>
                <li><strong>Provisión de Contexto:</strong> Utiliza el sistema de <code>provide/inject</code> de Vue 3 para distribuir variables globales (como el <code>codigoMedicion</code> "m194" y <code>surveyInfo</code>) a cualquier componente anidado de la jerarquía sin hacer <em>prop-drilling</em>.</li>
                <li><strong>Navegación por Estado (Query Params):</strong> Maneja el enrutamiento a través de la URL (<code>?tab=resultados</code>). En lugar de desmontar y crear vistas, emplea <code>v-show</code> para alternar la visibilidad entre <code>AdvPortada</code>, <code>AdvResultados</code> y <code>AdvFicha</code>. Esto preserva memóricamente los resultados cacheados, garantizando transiciones ultrarrápidas entre pestañas.</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CARD 2: FLUJO DE DATOS -->
        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-2 me-3">
                  <i class="bi bi-database-down"></i>
                </div>
                <h3 class="section-title mb-0">2. Jerarquía y Carga de Datos (JSON)</h3>
              </div>
              <p>
                El motor de resultados (<code>AdvResultados.vue</code>) prescinde de APIs dinámicas e implementa una ingesta rápida de archivos <strong>JSON pre-procesados y estáticos</strong> alojados en el servidor, maximizando concurrencia y velocidad.
              </p>
              
              <h5 class="mt-4 mb-3 fw-bold code-color">El Árbol de Datos</h5>
              <div class="data-hierarchy mb-4 p-4 rounded bg-light">
                <div class="tree-node"><i class="bi bi-folder-fill text-warning me-2"></i><strong>Medición (m194)</strong></div>
                <div class="tree-node ms-3 border-start ps-3 py-2"><i class="bi bi-filetype-json text-primary me-2"></i><code>secciones.json</code> (Agrupadores temáticos)</div>
                <div class="tree-node ms-3 border-start ps-3 py-2"><i class="bi bi-filetype-json text-primary me-2"></i><code>preguntas.json</code> (Definiciones e UI dataviz)</div>
                <div class="tree-node ms-3 border-start ps-3 py-2"><i class="bi bi-filetype-json text-primary me-2"></i><code>variables.json</code> (Sub-elementos métricos)</div>
                <div class="tree-node ms-3 border-start ps-3 py-2"><i class="bi bi-filetype-json text-danger me-2"></i><code>respuestas.json</code> (Matriz de datos estadísticos consolidados)</div>
              </div>

              <h5 class="mt-4 mb-3 fw-bold text-dark">Estrategia de Carga Diferida (Lazy Loading)</h5>
              <p>
                Para mantener el peso de la página virtualmente instantáneo, los cruces demográficos no se cargan al inicio. Si el usuario filtra por una dimensión (ej. <em>Localidad</em>), el sistema desencadena un <code>fetch</code> dinámico hacia <code>respuestas_localidad.json</code>.
                Una vez resuelto, el resultado se incrusta en una <strong>Caché en Memoria Viva</strong> (fuera del ciclo de vida del componente), garantizando que navegaciones futuras a la misma dimensión tengan latencia de 0 ms.
              </p>
            </div>
          </div>
        </section>

        <!-- CARD 3: LÓGICA Y CÁLCULOS -->
        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-3 me-3">
                  <i class="bi bi-calculator"></i>
                </div>
                <h3 class="section-title mb-0">3. Motor Reactivo de Cálculos</h3>
              </div>
              <p>
                Cada vez que el usuario selecciona una pregunta en la barra lateral interactiva o cambia un filtro cruzado, se activa la cadena computacional en el frontend:
              </p>
              
              <ul class="process-list mt-4">
                <li>
                  <div class="process-number">1</div>
                  <div class="process-content">
                    <strong>Filtrado Lineal:</strong> El arreglo gigante de <code>respuestas</code> desciende buscando solo aquellas filas cuyo <code>indice_pregunta</code> coincide con la selección activa de la interfaz.
                  </div>
                </li>
                <li>
                  <div class="process-number">2</div>
                  <div class="process-content">
                    <strong>Expansión Poblacional:</strong> Se toma cada fila, extrayendo el concepto <code>suma_factor</code>. Este metadato asume no la cantidad nominal de encuestados, sino el <em>peso poblacional expansivo</em> que esa misma muestra representa sobre los millones de habitantes objetivo.
                  </div>
                </li>
                <li>
                  <div class="process-number">3</div>
                  <div class="process-content">
                    <strong>Cálculo de Proporcionalidades (Porcentaje):</strong> La aplicación itera calculando la ecuación general matemática: <code>(suma_factor / total_variable_factor) * 100</code>. El resultado garantiza un margen de visualización escalado a 100 puntos.
                  </div>
                </li>
                <li>
                  <div class="process-number">4</div>
                  <div class="process-content">
                    <strong>Promedio Ponderado (KPI):</strong> En preguntas con calificación (ej: 0 a 10), el algoritmo <code>calcularPromedioPonderado()</code> sumeriza el producto iterativo de la respuesta original numéricamente ponderada sobre el total válido.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CARD 4: VISUALIZACIÓN Y DEPURACIÓN -->
        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-4 me-3">
                  <i class="bi bi-pie-chart"></i>
                </div>
                <h3 class="section-title mb-0">4. Visualización Gráfica y Debugging</h3>
              </div>

              <h5 class="mt-4 mb-3 fw-bold code-color">Aislamiento Lógico en Visualización (Highcharts)</h5>
              <p>
                La herramienta delega el control estético a librerías especializadas (Highcharts), enviando los datos limpios a través de Props (<code>pregunta</code> y <code>respuestas</code>).
                <br><br>
                <strong>Agrupamiento Tardío:</strong> Para impedir la desvirtuación del <em>Promedio Ponderado</em>, la herramienta mantiene divididas por defecto las respuestas nominales (ej. Edad 13, 14, 15 separados). 
                Es en el <em>último</em> eslabón de la gráfica (<code>barChart.vue</code> o <code>donutChart.vue</code>) donde se realiza una compresión analítica mediante <code>.reduce()</code>.
                Allí, el código fusiona y acumula múltiples respuestas bajo la etiqueta sombrilla (<code>respuesta_v2</code>, p. ej. <em>"Gen Z"</em>), garantizando gráficas limpias, estéticas y matemáticamente correctas.
              </p>

              <h5 class="mt-4 mb-3 fw-bold text-dark mt-5">Panel de Inspección (AdvDebug.vue)</h5>
              <p>
                Se ha diseñado una subvista vital de tipo caja de cristal (<em>Glassbox</em>) escondida tras la pestaña <strong>Inspección (Data)</strong>. Esto le permite al analista:
              </p>
              <ul>
                <li>Auditar cada métrica individual que inyecta información al sistema Highcharts.</li>
                <li>Hacer control de calidad al empalme de <em>factores de expansión</em> a nivel granular.</li>
                <li>Tener a la vista las llaves foráneas crudas (<code>indice_variable</code>, <code>codigo_variable</code>) sin manipulación cosmética para diagnóstico de base de datos.</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- CARD 5: ANÁLISIS TERRITORIAL AVANZADO -->
        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-5 me-3">
                  <i class="bi bi-geo-alt"></i>
                </div>
                <h3 class="section-title mb-0">5. Análisis Territorial (Localidades)</h3>
              </div>
              <p>
                El módulo <code>LocalidadesView.vue</code> centraliza el desglose geográfico profundo. A diferencia del dashboard general, este orquestador permite una comparación síncrona entre las 20 localidades de Bogotá mediante un Ranking (Gráfico) y una Cartografía Coroplética (Mapa).
              </p>
            </div>
          </div>
        </section>

        <!-- CARD 6: ANÁLISIS DEMOGRÁFICO POR EDAD -->
        <section class="docs-section mb-5">
          <div class="card shadow-sm border-0 docs-card">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex align-items-center mb-4">
                <div class="icon-wrapper feature-icon-3 me-3">
                  <i class="bi bi-people"></i>
                </div>
                <h3 class="section-title mb-0">6. Análisis Demográfico (Grupos de Edad)</h3>
              </div>
              <p>
                El módulo <code>GruposEdadView.vue</code> permite el desglose de resultados por rangos etarios. A diferencia del análisis geográfico, este se centra en la comparación de comportamientos y percepciones según el ciclo de vida del ciudadano.
              </p>
              
              <h5 class="mt-4 mb-3 fw-bold text-dark">Estructura de Datos</h5>
              <p>
                Consume el archivo <code>respuestas_edad.json</code>, el cual categoriza la muestra en tres grandes bloques:
              </p>
              <ul>
                <li><strong>Jóvenes (13-28 años):</strong> Código 2.</li>
                <li><strong>Adultos (29-59 años):</strong> Código 3.</li>
                <li><strong>Personas Mayores (60+ años):</strong> Código 4.</li>
              </ul>

              <h5 class="mt-4 mb-3 fw-bold code-color">Visualización Diferenciada</h5>
              <p>
                Al ser una dimensión con pocas categorías (3), el sistema utiliza un <strong>Gráfico de Columnas</strong> (<code>GrupoEdadChart.vue</code>) para una comparación directa y legible, manteniendo la coherencia estética del sistema de diseño premium.
              </p>
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
}

.feature-icon-1 { background: linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%); }
.feature-icon-2 { background: linear-gradient(135deg, #48DBFB 0%, #0ABDE3 100%); }
.feature-icon-3 { background: linear-gradient(135deg, #1DD1A1 0%, #10AC84 100%); }
.feature-icon-4 { background: linear-gradient(135deg, #FECA57 0%, #FF9F43 100%); }
.feature-icon-5 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

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
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
