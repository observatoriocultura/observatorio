<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DatosGaleria from './DatosGaleria.vue'

const imageUrl = (file) =>
  `${import.meta.env.BASE_URL}content/divulgacion/datos-a-la-calle/demo/${file}`
const sourceUrl = 'https://docs.google.com/presentation/d/1MK9RQM8E-3MEzHcr3tfYfKx4EehDF8xK/edit'
const sections = [
  { id: 'estrategia', label: 'La estrategia' },
  { id: 'bases', label: 'Las bases' },
  { id: 'metodologia', label: 'Cómo lo hacemos' },
  { id: 'galeria', label: 'En la calle' },
]

function goTo(id) {
  const section = document.getElementById(`dalc-${id}`)
  if (!section) return
  section.focus({ preventScroll: true })
  section.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}

const actions = [
  {
    icon: 'bi-chat-square-text',
    title: 'Acercamos los datos',
    text: 'Traducimos información sobre Bogotá a un lenguaje cercano, conectado con la vida cotidiana.',
    tone: 'violet',
  },
  {
    icon: 'bi-question-circle',
    title: 'Abrimos conversaciones',
    text: 'Hacemos preguntas que invitan a reconocerse, pensar y escuchar otras maneras de vivir la ciudad.',
    tone: 'pink',
  },
  {
    icon: 'bi-people',
    title: 'Conectamos historias',
    text: 'Creamos encuentros en espacios públicos y privados donde los datos dialogan con las experiencias de las personas.',
    tone: 'blue',
  },
  {
    icon: 'bi-lightbulb',
    title: 'Exploramos nuevas preguntas',
    text: 'Formulamos hipótesis y exploramos comportamientos mediante dispositivos de investigación cualitativa.',
    tone: 'yellow',
  },
]

const principles = [
  {
    title: 'Participar con sentido',
    text: 'Tener claro el para qué de cada encuentro. La participación ciudadana merece una intención que vaya más allá de cumplir un trámite.',
  },
  {
    title: 'Traducir para conectar',
    text: 'Acercar los datos a las personas. Una pregunta puede funcionar como un espejo social: mostrar lo que vivimos y abrir lo que podemos conversar.',
  },
  {
    title: 'Conversar con criterio',
    text: 'Frente a la saturación de información, elegir datos y preguntas que aporten contexto y den lugar a una conversación significativa.',
  },
  {
    title: 'Encontrarnos en horizontal',
    text: 'Escuchar y reconocer los saberes de todas las personas. La experiencia se construye con la ciudadanía y sus historias.',
  },
  {
    title: 'Comprender cómo actuamos',
    text: 'Integrar las ciencias del comportamiento desde el diseño. Explorar la relación entre lo que decimos y lo que hacemos.',
  },
  {
    title: 'Comunicar para transformar',
    text: 'Hacer comprensible la información. Comunicar es conectar: si un dato no se entiende, pierde su oportunidad de generar reflexión.',
  },
]

const method = [
  {
    title: 'Identificar',
    subtitle: 'Un tema que nos conecta',
    text: 'Seleccionamos ejes de trabajo, datos y preguntas de las encuestas que puedan dialogar con las experiencias ciudadanas.',
  },
  {
    title: 'Diseñar',
    subtitle: 'Una invitación a participar',
    text: 'Exploramos preguntas creativas y formatos de encuentro. Cada dispositivo combina un dato, una pregunta y una manera de participar.',
  },
  {
    title: 'Encontrarnos',
    subtitle: 'Los datos salen a la calle',
    text: 'Ponemos los dispositivos en acción, escuchamos las conversaciones y sistematizamos los aprendizajes de la experiencia.',
  },
  {
    title: 'Volver a preguntar',
    subtitle: 'El encuentro abre caminos',
    text: 'Recogemos nuevas inquietudes que pueden orientar futuras investigaciones y nuevas formas de conversar con la ciudad.',
  },
]

const exampleSteps = [
  {
    label: 'La intención',
    title: 'Reconocernos en lo que leemos, escribimos y contamos.',
    text: 'Acercar los datos de la Encuesta Bienal de Lectura, Escritura y Oralidad a las personas y conectarlos con sus experiencias cotidianas.',
    note: 'Todo empieza por tener claro para qué queremos conversar.',
  },
  {
    label: 'El dato',
    title: 'La información encuentra una experiencia.',
    text: 'Los datos sobre usos de la escritura y acceso a espacios de lectura permiten poner en conversación nuestras prácticas. Leer, escribir y hablar son parte de la vida diaria, también en el entorno digital.',
    note: 'El dato aporta contexto y ayuda a reconocernos en la ciudad.',
  },
  {
    label: 'La pregunta',
    title: 'En tu vida cotidiana, ¿escribes más por gusto o por obligación?',
    text: 'Una pregunta del dispositivo que invita a detenerse y pensar: un mensaje, una lista, una carta, una tarea… ¿Qué lugar ocupa la escritura en tu día?',
    note: 'No hay una respuesta correcta. Hay experiencias por escuchar.',
  },
  {
    label: 'La conversación',
    title: 'Tu historia puede abrir otra manera de mirar.',
    text: 'La pregunta invita a compartir lo que vivimos y a escuchar a otras personas. El encuentro abre reflexiones y nuevas preguntas para comprender nuestras prácticas culturales.',
    note: 'Preguntamos para abrir una conversación y aprender juntos.',
  },
]
const activeExample = ref(0)
const example = computed(() => exampleSteps[activeExample.value])
</script>

<template>
  <article class="dalc">
    <header class="dalc-nav">
      <div class="dalc-shell nav-inner">
        <button
          class="wordmark"
          type="button"
          aria-label="Datos a la Calle: volver al inicio"
          @click="goTo('inicio')"
        >
          <span class="brand-symbol" aria-hidden="true"><i class="bi bi-chat-dots"></i></span>
          <span>Datos a<br />la Calle<span class="brand-period">.</span></span>
        </button>
        <nav aria-label="Secciones de Datos a la Calle">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            @click="goTo(section.id)"
          >
            {{ section.label }}
          </button>
        </nav>
        <RouterLink class="observatorio-link" to="/" aria-label="Ir al inicio del Observatorio">
          Observatorio <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </header>

    <section id="dalc-inicio" class="hero dalc-shell" aria-labelledby="dalc-title" tabindex="-1">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="status-dot" aria-hidden="true"></span> Bogotá · Cultura ciudadana
        </p>
        <h1 id="dalc-title">
          Datos a<br />la <span class="highlight">Calle<span class="title-period">.</span></span>
        </h1>
        <p class="hero-statement">
          La ciudad tiene datos.<br /><strong>Tú tienes historias.</strong>
        </p>
        <p class="hero-description">
          Una estrategia que conecta los datos de Bogotá con la vida cotidiana para conversar,
          reflexionar y construir propósitos compartidos.
        </p>
        <button class="dalc-button primary-button" type="button" @click="goTo('estrategia')">
          Conoce la estrategia <i class="bi bi-arrow-down-right" aria-hidden="true"></i>
        </button>
        <div class="hero-footnote">
          <span class="little-line" aria-hidden="true"></span> Los datos son el punto de partida.<br />La
          conversación es lo que sigue.
        </div>
      </div>
      <div class="hero-visual">
        <div class="photo-index">
          <span>ENCUENTROS QUE CONECTAN</span><i class="bi bi-plus-lg" aria-hidden="true"></i>
        </div>
        <figure class="hero-photo">
          <img
            :src="imageUrl('20261013-b.jpeg')"
            width="1280"
            height="960"
            alt="Ciudadanía y facilitadores conversan junto a un tablero que invita a escribirle a la Bogotá del futuro"
            fetchpriority="high"
          />
          <figcaption>
            <span class="caption-dot" aria-hidden="true"></span> La conversación empieza aquí.
          </figcaption>
        </figure>
        <figure class="hero-inset">
          <img
            :src="imageUrl('20261013-c.png')"
            width="592"
            height="742"
            alt="Dos personas conversan junto a un dispositivo sobre la escritura por gusto o por obligación"
          />
          <figcaption>Un dato. Una pregunta.<br /><strong>Muchas historias.</strong></figcaption>
        </figure>
        <span class="hero-spark" aria-hidden="true">✳</span>
      </div>
    </section>

    <div class="conversation-ribbon" aria-label="De los datos a nuevas miradas sobre la ciudad">
      <div class="dalc-shell ribbon-inner">
        <span>Datos</span><i class="bi bi-arrow-right" aria-hidden="true"></i><span>Preguntas</span
        ><i class="bi bi-arrow-right" aria-hidden="true"></i><span>Historias</span
        ><i class="bi bi-arrow-right" aria-hidden="true"></i><span>Encuentros</span
        ><i class="bi bi-arrow-right" aria-hidden="true"></i
        ><span class="ribbon-last">Nuevas miradas <span aria-hidden="true">✳</span></span>
      </div>
    </div>

    <section
      id="dalc-estrategia"
      class="dalc-shell section-space strategy"
      aria-labelledby="strategy-title"
      tabindex="-1"
    >
      <div class="strategy-intro">
        <p class="eyebrow"><span class="section-number">01 /</span> La estrategia</p>
        <h2 id="strategy-title">
          Los datos cobran vida<br />cuando <span class="violet-text">nos encontramos.</span>
        </h2>
        <p class="section-lead">
          Datos a la Calle lleva información sobre la ciudad a espacios públicos y privados, y la
          pone en diálogo con lo que sentimos, pensamos y hacemos.
        </p>
        <p>
          Con dinámicas atractivas y dispositivos participativos, busca generar conexiones alrededor
          de propósitos comunes. Cada encuentro es una oportunidad para escuchar, reflexionar y
          construir en colectivo.
        </p>
        <div class="device-definition">
          <i class="bi bi-boxes" aria-hidden="true"></i>
          <p>
            <strong>¿Y qué es un dispositivo?</strong> Un formato de encuentro que combina un dato,
            una pregunta y una manera de participar: un tablero, un dispensador o un soporte que
            invite a conversar.
          </p>
        </div>
      </div>
      <div class="actions-grid">
        <div v-for="action in actions" :key="action.title" class="action-item">
          <span class="action-icon" :class="`tone-${action.tone}`"
            ><i class="bi" :class="action.icon" aria-hidden="true"></i
          ></span>
          <h3>{{ action.title }}</h3>
          <p>{{ action.text }}</p>
        </div>
      </div>
    </section>

    <section
      id="dalc-bases"
      class="principles section-space"
      aria-labelledby="principles-title"
      tabindex="-1"
    >
      <div class="dalc-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow"><span class="section-number">02 /</span> Las bases</p>
            <h2 id="principles-title">
              Datos con contexto.<br />Participación <span class="violet-text">con sentido.</span>
            </h2>
          </div>
          <p>
            Seis principios orientan la forma en que diseñamos los encuentros y nos acercamos a la
            ciudadanía.
          </p>
        </div>
        <div class="principles-grid">
          <div v-for="(principle, index) in principles" :key="principle.title" class="principle">
            <span class="principle-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3>{{ principle.title }}</h3>
              <p>{{ principle.text }}</p>
            </div>
          </div>
        </div>
        <div class="principles-footer">
          <i class="bi bi-chat-heart" aria-hidden="true"></i>
          <p>La pregunta es una invitación.<br /><strong>La escucha le da sentido.</strong></p>
        </div>
      </div>
    </section>

    <section
      id="dalc-metodologia"
      class="method section-space"
      aria-labelledby="method-title"
      tabindex="-1"
    >
      <div class="dalc-shell">
        <div class="section-heading">
          <div>
            <p class="eyebrow"><span class="section-number">03 /</span> Nuestra metodología</p>
            <h2 id="method-title">
              Del dato al encuentro.<br /><span>Y a nuevas preguntas.</span>
            </h2>
          </div>
          <p>
            Un proceso que transforma información en una experiencia de participación y devuelve
            aprendizajes a la investigación.
          </p>
        </div>
        <ol class="method-grid">
          <li v-for="(step, index) in method" :key="step.title" class="method-step">
            <div class="step-track">
              <span>{{ String(index + 1).padStart(2, '0') }}</span
              ><i
                class="bi"
                :class="index === 3 ? 'bi-arrow-return-left' : 'bi-arrow-right'"
                aria-hidden="true"
              ></i>
            </div>
            <h3>{{ step.title }}</h3>
            <p class="step-subtitle">{{ step.subtitle }}</p>
            <p>{{ step.text }}</p>
          </li>
        </ol>
        <p class="method-note">
          <i class="bi bi-arrow-repeat" aria-hidden="true"></i> Cada conversación puede ser el
          comienzo de una nueva investigación.
        </p>
      </div>
    </section>

    <section
      id="dalc-ejemplo"
      class="dalc-shell section-space example-section"
      aria-labelledby="example-title"
      tabindex="-1"
    >
      <div class="example-image">
        <img
          :src="imageUrl('20261013-c.png')"
          width="592"
          height="742"
          alt="Dispositivo de Datos a la Calle con la pregunta: En tu vida cotidiana, escribes más por gusto o por obligación"
          loading="lazy"
        />
        <span class="photo-label">Una pregunta puede cambiar la conversación.</span>
      </div>
      <div class="example-content">
        <p class="eyebrow">En la práctica · Lectura, escritura y oralidad</p>
        <h2 id="example-title">
          Así empieza<br /><span class="violet-text">una conversación.</span>
        </h2>
        <p class="example-intro">
          Leer, escribir y contar historias también sucede fuera de los libros. Mira cómo una
          práctica cotidiana se convierte en un encuentro.
        </p>
        <div class="example-selectors" role="group" aria-label="Explorar el ejemplo paso a paso">
          <button
            v-for="(step, index) in exampleSteps"
            :key="step.label"
            type="button"
            :aria-pressed="activeExample === index"
            aria-controls="dalc-example-detail"
            @click="activeExample = index"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span
            >{{ step.label }}
          </button>
        </div>
        <div id="dalc-example-detail" class="example-detail" aria-live="polite" aria-atomic="true">
          <h3>{{ example.title }}</h3>
          <p>{{ example.text }}</p>
          <p class="example-note">
            <i class="bi bi-chat-quote" aria-hidden="true"></i>{{ example.note }}
          </p>
        </div>
      </div>
    </section>

    <section
      id="dalc-logros"
      class="achievements section-space"
      aria-labelledby="achievements-title"
      tabindex="-1"
    >
      <div class="dalc-shell achievements-grid">
        <div class="achievement-stat">
          <p class="eyebrow"><span class="section-number">04 /</span> Lo que hemos abierto</p>
          <h2 id="achievements-title">
            Más de <span>5.000<span class="stat-plus" aria-hidden="true">+</span></span>
          </h2>
          <p class="stat-label">conversaciones con la ciudadanía</p>
          <p class="stat-source">
            Cifra reportada en la
            <a :href="sourceUrl" target="_blank" rel="noopener noreferrer"
              >presentación de la estrategia
              <span class="visually-hidden">(abre en una pestaña nueva)</span
              ><i class="bi bi-arrow-up-right" aria-hidden="true"></i></a
            >, sin fecha de corte especificada.
          </p>
        </div>
        <div class="achievement-copy">
          <h3>El valor está<br />en el encuentro.</h3>
          <p>
            Las experiencias documentadas muestran distintas maneras de acercar los datos a la
            ciudadanía y abrir espacios de reflexión.
          </p>
          <ul>
            <li>
              <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
              <div>
                <strong>Datos en espacios cotidianos</strong
                ><span>Dispositivos en la calle, espacios de lectura y lugares de encuentro.</span>
              </div>
            </li>
            <li>
              <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
              <div>
                <strong>Historias que entran en la conversación</strong
                ><span
                  >Experiencias sobre escritura, oralidad, música y formas de vivir Bogotá.</span
                >
              </div>
            </li>
            <li>
              <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
              <div>
                <strong>Formatos para acercarnos</strong
                ><span
                  >Tableros, dispensadores y preguntas que invitan a participar de distintas
                  maneras.</span
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      id="dalc-galeria"
      class="dalc-shell section-space gallery-section"
      aria-labelledby="gallery-title"
      tabindex="-1"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow"><span class="section-number">05 /</span> En la calle</p>
          <h2 id="gallery-title">
            La ciudad es<br /><span class="violet-text">nuestro punto de encuentro.</span>
          </h2>
        </div>
        <p>
          Dispositivos, historias y personas. Una mirada a las experiencias de Datos a la Calle.
        </p>
      </div>
      <DatosGaleria />
    </section>

    <section class="closing-section" aria-labelledby="closing-title">
      <div class="dalc-shell closing-inner">
        <div>
          <p class="eyebrow">La conversación sigue</p>
          <h2 id="closing-title">Otra manera de<br /><span>leer nuestra ciudad.</span></h2>
          <p>
            Conoce los datos de lectura, escritura y oralidad que pueden abrir nuevas conversaciones
            sobre Bogotá.
          </p>
        </div>
        <RouterLink class="dalc-button closing-button" to="/ebc/lectura-escritura-y-oralidad-2025"
          >Explora los resultados
          <i class="bi bi-arrow-up-right" aria-hidden="true"></i></RouterLink
        ><span class="closing-spark" aria-hidden="true">✳</span>
      </div>
    </section>

    <footer class="dalc-footer dalc-shell">
      <div>
        <strong>Datos a la Calle.</strong
        ><span>Observatorio y Gestión del Conocimiento Cultural · Bogotá</span>
      </div>
      <a :href="sourceUrl" target="_blank" rel="noopener noreferrer"
        >Conoce la presentación <span class="visually-hidden">(abre en una pestaña nueva)</span
        ><i class="bi bi-arrow-up-right" aria-hidden="true"></i></a
      ><span class="demo-tag">Vista demo</span>
    </footer>
  </article>
</template>

<style scoped>
.dalc {
  --dalc-ink: #252036;
  --dalc-muted: #646071;
  --dalc-purple: #623ce6;
  --dalc-dark: #292044;
  --dalc-yellow: #f4da47;
  --dalc-paper: #faf9f5;
  background: var(--dalc-paper);
  color: var(--dalc-ink);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  overflow: clip;
  container-type: inline-size;
  container-name: datos-calle;
}
.dalc-shell {
  width: min(100% - 96px, 1200px);
  margin-inline: auto;
}
.dalc h1,
.dalc h2,
.dalc h3 {
  font-family: 'Inter', sans-serif;
  font-weight: 650;
}
.dalc h2 {
  font-size: clamp(1.9rem, 3.5vw, 2.9rem);
  line-height: 1.12;
  letter-spacing: -0.055em;
  margin: 0 0 24px;
}
.dalc h3 {
  letter-spacing: -0.025em;
}
.dalc p {
  line-height: 1.75;
}
.dalc button,
.dalc a {
  -webkit-tap-highlight-color: transparent;
}
.dalc button {
  font-family: inherit;
}
.dalc :is(button, a):focus-visible {
  outline: 3px solid var(--dalc-purple);
  outline-offset: 5px;
}
.dalc section[tabindex] {
  scroll-margin-top: 110px;
  outline: none;
}
.section-space {
  padding-block: 96px;
}
.eyebrow {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 650;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  margin: 0 0 25px;
}
.section-number {
  color: var(--dalc-purple);
}
.violet-text {
  color: var(--dalc-purple);
}
.dalc-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(250, 249, 245, 0.96);
  border-bottom: 1px solid #e7e3e9;
  backdrop-filter: blur(14px);
}
.nav-inner {
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: space-between;
}
.wordmark {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: none;
  border: 0;
  text-align: left;
  color: var(--dalc-ink);
  font-size: 0.96rem;
  font-weight: 750;
  line-height: 1.05;
  letter-spacing: -0.05em;
}
.brand-symbol {
  display: grid;
  place-items: center;
  background: var(--dalc-purple);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 10px 10px 10px 2px;
  font-size: 21px;
}
.brand-period {
  color: var(--dalc-purple);
}
.nav-inner nav {
  display: flex;
  align-items: center;
  gap: 26px;
}
.nav-inner nav button {
  border: 0;
  background: none;
  color: var(--dalc-muted);
  padding: 10px 0;
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  transition: color 160ms;
}
.nav-inner nav button:hover {
  color: var(--dalc-purple);
}
.observatorio-link {
  display: inline-flex;
  gap: 14px;
  align-items: center;
  border: 1px solid #d9d3e1;
  border-radius: 30px;
  padding: 9px 15px;
  color: var(--dalc-ink);
  font-size: 0.7rem;
  text-decoration: none;
}
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 42px;
  padding-block: 68px 72px;
  align-items: center;
}
.hero .eyebrow {
  margin-bottom: 26px;
}
.status-dot {
  width: 7px;
  height: 7px;
  background: var(--dalc-purple);
  border-radius: 50%;
  box-shadow: 0 0 0 4px #ece6fb;
}
.hero h1 {
  font-size: clamp(4.2rem, 7.5vw, 7.2rem);
  font-weight: 750;
  letter-spacing: -0.078em;
  line-height: 0.96;
  margin: 0 0 32px;
}
.highlight {
  position: relative;
  z-index: 0;
  white-space: nowrap;
}
.highlight::after {
  content: '';
  position: absolute;
  inset: auto -7px 4px 0;
  height: 18%;
  background: var(--dalc-yellow);
  z-index: -1;
  transform: rotate(-2deg);
}
.title-period {
  color: var(--dalc-purple);
}
.hero-statement {
  font-size: clamp(1.15rem, 2vw, 1.65rem);
  letter-spacing: -0.04em;
  line-height: 1.35 !important;
  margin-bottom: 19px;
}
.hero-statement strong {
  font-weight: 650;
}
.hero-description {
  max-width: 390px;
  color: var(--dalc-muted);
  font-size: 0.89rem;
  margin-bottom: 28px;
}
.dalc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 16px 22px;
  font-size: 0.77rem;
  font-weight: 600;
  border: 0;
  border-radius: 4px;
  text-decoration: none;
  transition:
    transform 180ms,
    background 180ms;
}
.dalc-button i {
  font-size: 1.05rem;
}
.dalc-button:hover {
  transform: translateY(-3px);
}
.primary-button {
  background: var(--dalc-purple);
  color: white;
}
.primary-button:hover {
  background: #5031c2;
}
.hero-footnote {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.63rem;
  line-height: 1.6;
  color: var(--dalc-muted);
  margin-top: 28px;
}
.little-line {
  width: 28px;
  height: 1px;
  background: #bcb3cb;
}
.hero-visual {
  position: relative;
  padding: 0 18px 80px 0;
}
.photo-index {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.57rem;
  letter-spacing: 0.13em;
  font-weight: 550;
  margin-bottom: 12px;
}
.hero-photo {
  position: relative;
  margin: 0;
}
.hero-photo > img {
  width: 100%;
  height: 440px;
  object-fit: cover;
  object-position: 46% center;
  border-radius: 5px 68px 5px 5px;
}
.hero-photo figcaption {
  position: absolute;
  left: -16px;
  bottom: 30px;
  padding: 16px 20px;
  background: var(--dalc-yellow);
  color: var(--dalc-ink);
  font-size: 0.72rem;
  font-weight: 600;
  transform: rotate(-3deg);
  box-shadow: 0 5px 20px #25203615;
  display: flex;
  gap: 12px;
  align-items: center;
}
.caption-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dalc-ink);
}
.hero-inset {
  position: absolute;
  right: -8px;
  bottom: 0;
  width: 156px;
  background: white;
  padding: 8px 8px 12px;
  margin: 0;
  transform: rotate(6deg);
  box-shadow: 0 8px 35px #25203624;
}
.hero-inset img {
  width: 100%;
  height: 170px;
  object-fit: cover;
}
.hero-inset figcaption {
  padding: 10px 4px 0;
  font-size: 0.59rem;
  line-height: 1.45;
}
.hero-inset strong {
  font-weight: 650;
}
.hero-spark {
  position: absolute;
  top: -14px;
  right: -13px;
  color: var(--dalc-purple);
  font-size: 5.2rem;
  line-height: 1;
  transform: rotate(10deg);
}
.conversation-ribbon {
  background: var(--dalc-yellow);
}
.ribbon-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-block: 22px;
}
.ribbon-inner > span {
  font-size: 1.15rem;
  font-weight: 650;
  letter-spacing: -0.045em;
}
.ribbon-inner > i {
  font-size: 1.1rem;
}
.ribbon-last {
  display: flex;
  align-items: center;
  gap: 20px;
}
.ribbon-last > span {
  font-size: 1.8rem;
  line-height: 1;
  color: var(--dalc-purple);
}
.strategy {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
}
.strategy-intro > p:not(.eyebrow) {
  color: var(--dalc-muted);
  font-size: 0.88rem;
}
.strategy-intro .section-lead {
  color: var(--dalc-ink) !important;
  font-size: 1rem !important;
}
.device-definition {
  margin-top: 28px;
  border-left: 3px solid var(--dalc-purple);
  padding: 0 0 0 18px;
  display: flex;
  gap: 14px;
}
.device-definition > i {
  color: var(--dalc-purple);
  font-size: 1.3rem;
}
.device-definition p {
  font-size: 0.78rem;
  color: var(--dalc-muted);
  margin: 0;
}
.device-definition strong {
  display: block;
  color: var(--dalc-ink);
  font-weight: 650;
  margin-bottom: 5px;
}
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px 26px;
  padding-top: 10px;
}
.action-item {
  border-top: 1px solid #ded9e4;
  padding-top: 22px;
}
.action-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  font-size: 1.2rem;
  margin-bottom: 18px;
}
.tone-violet {
  background: #e9e1fb;
  color: #623ce6;
}
.tone-pink {
  background: #f8dfea;
  color: #a93566;
}
.tone-blue {
  background: #dceaf9;
  color: #365d9e;
}
.tone-yellow {
  background: #f5ecc1;
  color: #746119;
}
.action-item h3 {
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.35;
  margin-bottom: 12px;
}
.action-item p {
  font-size: 0.78rem;
  color: var(--dalc-muted);
  margin: 0;
}
.principles {
  background: #f0edf6;
}
.section-heading {
  display: flex;
  gap: 80px;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 48px;
}
.section-heading h2 {
  margin-bottom: 0;
}
.section-heading > p {
  max-width: 290px;
  color: var(--dalc-muted);
  font-size: 0.82rem;
  margin: 0 0 3px;
}
.principles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 34px 32px;
}
.principle {
  display: flex;
  gap: 15px;
  border-top: 1px solid #d7d0e4;
  padding-top: 24px;
}
.principle-number {
  color: var(--dalc-purple);
  font-size: 0.72rem;
  font-weight: 600;
  padding-top: 2px;
}
.principle h3 {
  font-size: 0.94rem;
  line-height: 1.4;
  margin-bottom: 13px;
}
.principle p {
  font-size: 0.78rem;
  color: var(--dalc-muted);
  margin: 0;
}
.principles-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 42px;
  padding-top: 30px;
  border-top: 1px solid #d7d0e4;
}
.principles-footer > i {
  font-size: 2rem;
  color: var(--dalc-purple);
}
.principles-footer p {
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0;
}
.principles-footer strong {
  font-weight: 600;
}
.method {
  background: var(--dalc-dark);
  color: white;
}
.method .eyebrow,
.method .section-number {
  color: #c3b3f3;
}
.method h2 > span {
  color: #cec0fb;
}
.method .section-heading > p {
  color: #d0c9df;
}
.method-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}
.step-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ffffff36;
}
.step-track > span {
  font-size: 2.8rem;
  font-weight: 550;
  letter-spacing: -0.07em;
  color: var(--dalc-yellow);
  line-height: 1;
}
.method-step:nth-child(2) .step-track > span {
  color: #b5d5fd;
}
.method-step:nth-child(3) .step-track > span {
  color: #c8b7ff;
}
.method-step:nth-child(4) .step-track > span {
  color: #f1b8d2;
}
.step-track i {
  font-size: 1.4rem;
  color: #b6a9d0;
}
.method-step h3 {
  font-size: 1.18rem;
  margin: 0 0 10px;
}
.method-step .step-subtitle {
  font-size: 0.71rem;
  font-weight: 600;
  color: #e6dff4;
  margin-bottom: 16px;
}
.method-step > p:last-child {
  color: #c8c0d8;
  font-size: 0.78rem;
  margin: 0;
}
.method-note {
  border-top: 1px solid #ffffff25;
  margin: 40px 0 0;
  padding-top: 22px;
  color: #ccc2e1;
  font-size: 0.71rem;
  display: flex;
  gap: 10px;
  align-items: center;
}
.method :is(button, a):focus-visible {
  outline-color: var(--dalc-yellow);
}
.example-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 72px;
  align-items: center;
}
.example-image {
  position: relative;
  max-width: 410px;
}
.example-image > img {
  width: 100%;
  height: 560px;
  object-fit: cover;
  border-radius: 5px 5px 75px 5px;
}
.photo-label {
  position: absolute;
  bottom: 32px;
  left: -16px;
  right: 24px;
  background: #edc4d9;
  padding: 18px;
  font-size: 0.72rem;
  font-weight: 600;
  transform: rotate(-3deg);
}
.example-content .eyebrow {
  font-size: 0.58rem;
}
.example-intro {
  color: var(--dalc-muted);
  font-size: 0.84rem;
  margin-bottom: 25px;
}
.example-selectors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 22px;
}
.example-selectors button {
  padding: 12px 4px;
  color: var(--dalc-muted);
  font-size: 0.6rem;
  border: 0;
  border-bottom: 2px solid #ded9e6;
  background: none;
  text-align: left;
}
.example-selectors button > span {
  display: block;
  font-weight: 650;
  font-size: 0.75rem;
  margin-bottom: 7px;
}
.example-selectors button[aria-pressed='true'] {
  color: var(--dalc-purple);
  border-color: var(--dalc-purple);
}
.example-detail {
  min-height: 238px;
}
.example-detail h3 {
  font-size: 1.45rem;
  line-height: 1.35;
  margin-bottom: 14px;
}
.example-detail > p {
  color: var(--dalc-muted);
  font-size: 0.82rem;
}
.example-detail .example-note {
  display: flex;
  gap: 10px;
  border-radius: 4px;
  background: #eee8fa;
  padding: 13px 15px;
  color: #56378e;
  font-size: 0.71rem;
  margin: 22px 0 0;
}
.example-note > i {
  font-size: 1rem;
}
.achievements {
  background: #f4eac1;
}
.achievements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  align-items: center;
}
.achievement-stat h2 {
  font-size: 1.6rem;
  letter-spacing: -0.03em;
  margin: 34px 0 0;
}
.achievement-stat h2 > span {
  display: block;
  font-size: clamp(5rem, 9vw, 8.3rem);
  font-weight: 650;
  letter-spacing: -0.09em;
  margin: 6px 0;
  line-height: 1.1;
}
.stat-plus {
  color: var(--dalc-purple);
  font-size: 0.55em;
  vertical-align: top;
  display: inline-block;
  margin-top: 12px;
}
.stat-label {
  font-size: 1.02rem;
  font-weight: 500;
  margin: 0 0 24px;
}
.stat-source {
  color: #6b634d;
  max-width: 350px;
  font-size: 0.65rem;
  margin: 0;
}
.stat-source a {
  color: inherit;
  text-decoration-color: #a49a7a;
  text-underline-offset: 3px;
}
.achievement-copy {
  padding-left: 45px;
  border-left: 1px solid #d8cca0;
}
.achievement-copy > h3 {
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 1.1;
  margin-bottom: 20px;
}
.achievement-copy > p {
  font-size: 0.83rem;
  color: #655f4e;
}
.achievement-copy ul {
  list-style: none;
  padding: 0;
  margin: 25px 0 0;
  display: grid;
  gap: 22px;
}
.achievement-copy li {
  display: flex;
  gap: 16px;
}
.achievement-copy li > i {
  color: #7555c0;
}
.achievement-copy li strong {
  font-weight: 600;
  display: block;
  font-size: 0.8rem;
  margin-bottom: 5px;
}
.achievement-copy li span {
  display: block;
  color: #655f4e;
  font-size: 0.74rem;
  line-height: 1.7;
}
.gallery-section .section-heading {
  margin-bottom: 32px;
}
.closing-section {
  background: var(--dalc-purple);
  color: white;
  position: relative;
}
.closing-inner {
  display: flex;
  gap: 70px;
  align-items: center;
  justify-content: space-between;
  padding-block: 65px;
  position: relative;
}
.closing-inner > div {
  position: relative;
  z-index: 1;
}
.closing-inner .eyebrow {
  color: #d8ccff;
}
.closing-inner h2 {
  font-size: clamp(2rem, 3.8vw, 3.3rem);
}
.closing-inner h2 > span {
  color: var(--dalc-yellow);
}
.closing-inner p:not(.eyebrow) {
  font-size: 0.82rem;
  color: #e3dafa;
  max-width: 450px;
  margin: 0;
}
.closing-button {
  background: var(--dalc-yellow);
  color: var(--dalc-ink);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.closing-spark {
  position: absolute;
  right: 110px;
  top: -45px;
  color: #ffffff10;
  font-size: 20rem;
  line-height: 1;
  pointer-events: none;
}
.closing-section a:focus-visible {
  outline-color: white;
}
.dalc-footer {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  padding-block: 35px;
}
.dalc-footer > div > strong {
  display: block;
  font-size: 0.82rem;
  font-weight: 650;
  margin-bottom: 4px;
}
.dalc-footer > div > span {
  color: var(--dalc-muted);
  font-size: 0.61rem;
}
.dalc-footer > a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--dalc-muted);
  font-size: 0.65rem;
  text-decoration: none;
}
.demo-tag {
  border: 1px solid #ded9e5;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 0.56rem;
  white-space: nowrap;
  color: var(--dalc-muted);
}
@media (min-width: 1600px) {
  .hero h1 {
    font-size: 7.5rem;
  }
}
@media (max-width: 1100px) {
  .dalc-shell {
    width: calc(100% - 64px);
  }
  .hero {
    gap: 30px;
  }
  .hero-photo > img {
    height: 410px;
  }
  .strategy,
  .example-section {
    gap: 42px;
  }
  .achievements-grid {
    gap: 50px;
  }
  .nav-inner nav {
    gap: 18px;
  }
  .observatorio-link {
    display: none;
  }
  .ribbon-inner {
    gap: 16px;
  }
  .ribbon-inner > span {
    font-size: 1rem;
  }
  .ribbon-last {
    gap: 10px;
  }
}
@media (max-width: 850px) {
  .dalc-shell {
    width: calc(100% - 48px);
  }
  .section-space {
    padding-block: 64px;
  }
  .hero h1 {
    font-size: 4.7rem;
  }
  .hero-visual {
    padding-bottom: 100px;
  }
  .hero-photo > img {
    height: 380px;
  }
  .hero-photo figcaption {
    bottom: 70px;
    left: -10px;
    font-size: 0.61rem;
    padding: 12px;
  }
  .hero-inset {
    width: 130px;
  }
  .hero-inset img {
    height: 150px;
  }
  .hero-spark {
    font-size: 4rem;
  }
  .strategy {
    grid-template-columns: 1fr;
  }
  .actions-grid {
    gap: 30px;
  }
  .section-heading {
    gap: 35px;
  }
  .section-heading > p {
    max-width: 230px;
  }
  .principles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .method-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 38px 32px;
  }
  .example-section {
    gap: 30px;
  }
  .example-image > img {
    height: 530px;
  }
  .example-selectors {
    gap: 5px;
  }
  .example-selectors button {
    font-size: 0.53rem;
  }
  .achievement-copy {
    padding-left: 28px;
  }
  .closing-inner {
    gap: 25px;
  }
}
@container datos-calle (max-width: 700px) {
  .nav-inner {
    flex-wrap: wrap;
    gap: 8px;
    padding-block: 16px 8px;
  }
  .nav-inner nav {
    width: 100%;
    gap: 20px;
    overflow-x: auto;
  }
  .nav-inner nav button {
    min-height: 40px;
  }
  .hero,
  .strategy,
  .example-section,
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  .hero h1 {
    font-size: clamp(4.3rem, 14cqw, 6rem);
  }
  .hero-visual {
    max-width: 500px;
    width: 100%;
    margin-inline: auto;
  }
  .section-heading {
    flex-direction: column;
    align-items: start;
    gap: 24px;
  }
  .section-heading > p {
    max-width: 100%;
  }
  .principles-grid,
  .method-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .example-image {
    max-width: 100%;
  }
  .example-image > img {
    height: 470px;
    object-position: center 40%;
  }
  .achievement-copy {
    border-left: 0;
    border-top: 1px solid #d8cca0;
    padding: 30px 0 0;
  }
  .closing-inner {
    flex-direction: column;
    align-items: start;
    gap: 30px;
  }
  .dalc-footer {
    flex-wrap: wrap;
  }
  .dalc-footer > div {
    width: 100%;
  }
}
@media (max-width: 767px) {
  .nav-inner {
    min-height: 105px;
    flex-wrap: wrap;
    gap: 0;
    padding-top: 16px;
  }
  .wordmark {
    margin-left: 46px;
  }
  .nav-inner nav {
    width: 100%;
    gap: 18px;
    padding-block: 6px;
    overflow-x: auto;
  }
  .nav-inner nav button {
    min-height: 40px;
    font-size: 0.65rem;
  }
  .dalc section[tabindex] {
    scroll-margin-top: 120px;
  }
}
@media (max-width: 700px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 34px;
  }
  .hero-visual {
    max-width: 500px;
    width: 100%;
    margin-inline: auto;
  }
  .example-section {
    grid-template-columns: 1fr;
  }
  .example-image {
    max-width: 100%;
  }
  .example-image > img {
    height: 470px;
    object-position: center 40%;
  }
}
@media (max-width: 600px) {
  .dalc-shell {
    width: calc(100% - 40px);
  }
  .nav-inner {
    min-height: 99px;
    flex-wrap: wrap;
    gap: 0;
    padding-top: 16px;
  }
  .wordmark {
    font-size: 0.8rem;
  }
  .brand-symbol {
    width: 29px;
    height: 29px;
    font-size: 17px;
  }
  .nav-inner nav {
    width: 100%;
    gap: 17px;
    padding-block: 6px;
    overflow-x: auto;
  }
  .nav-inner nav button {
    font-size: 0.6rem;
  }
  .dalc section[tabindex] {
    scroll-margin-top: 116px;
  }
  .hero {
    grid-template-columns: 1fr;
    gap: 30px;
    padding-block: 36px 38px;
  }
  .hero h1 {
    font-size: clamp(4.3rem, 19vw, 6.5rem);
    margin-bottom: 24px;
  }
  .hero-statement {
    font-size: 1.4rem;
  }
  .hero-description {
    font-size: 0.87rem;
    max-width: 100%;
  }
  .hero-footnote {
    margin-top: 22px;
  }
  .hero-visual {
    padding: 0 12px 62px 0;
  }
  .hero-photo > img {
    height: 330px;
    border-top-right-radius: 50px;
  }
  .hero-photo figcaption {
    bottom: 25px;
    font-size: 0.63rem;
  }
  .hero-inset {
    right: 0;
    width: 120px;
    padding: 6px 6px 10px;
  }
  .hero-inset img {
    height: 125px;
  }
  .hero-inset figcaption {
    font-size: 0.52rem;
  }
  .hero-spark {
    top: -8px;
    right: -4px;
    font-size: 3.5rem;
  }
  .ribbon-inner {
    flex-wrap: wrap;
    justify-content: center;
    gap: 9px 12px;
    padding-block: 19px;
  }
  .ribbon-inner > span {
    font-size: 0.85rem;
  }
  .ribbon-inner > i {
    font-size: 0.7rem;
  }
  .ribbon-last {
    flex-basis: 100%;
    justify-content: center;
  }
  .ribbon-last > span {
    font-size: 1.3rem;
  }
  .section-space {
    padding-block: 54px;
  }
  .eyebrow {
    font-size: 0.59rem;
    margin-bottom: 20px;
  }
  .dalc h2 {
    font-size: 2rem;
  }
  .strategy {
    gap: 28px;
  }
  .actions-grid {
    gap: 30px 22px;
  }
  .action-item h3 {
    font-size: 0.88rem;
  }
  .action-item p {
    font-size: 0.73rem;
  }
  .section-heading {
    flex-direction: column;
    gap: 20px;
    align-items: start;
    margin-bottom: 32px;
  }
  .section-heading > p {
    max-width: 100%;
  }
  .principles-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .principle {
    padding-top: 20px;
  }
  .principle p {
    font-size: 0.81rem;
  }
  .method-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .step-track {
    margin-bottom: 20px;
  }
  .step-track > span {
    font-size: 2.5rem;
  }
  .method-step > p:last-child {
    font-size: 0.82rem;
  }
  .example-section {
    grid-template-columns: 1fr;
    gap: 38px;
  }
  .example-image {
    max-width: 100%;
  }
  .example-image > img {
    height: 390px;
    object-position: center 40%;
  }
  .photo-label {
    left: -8px;
    right: 14px;
    font-size: 0.65rem;
    padding: 14px;
  }
  .example-content .eyebrow {
    font-size: 0.55rem;
  }
  .example-selectors button {
    font-size: 0.59rem;
  }
  .example-detail {
    min-height: 260px;
  }
  .example-detail h3 {
    font-size: 1.35rem;
  }
  .achievements-grid {
    grid-template-columns: 1fr;
    gap: 35px;
  }
  .achievement-stat h2 {
    margin-top: 24px;
  }
  .achievement-stat h2 > span {
    font-size: 6.2rem;
  }
  .achievement-copy {
    border-left: 0;
    border-top: 1px solid #d8cca0;
    padding: 30px 0 0;
  }
  .achievement-copy > h3 {
    font-size: 2rem;
  }
  .closing-inner {
    flex-direction: column;
    align-items: start;
    padding-block: 48px;
  }
  .closing-inner h2 {
    font-size: 2rem;
  }
  .closing-spark {
    right: -35px;
    top: 25px;
    font-size: 16rem;
  }
  .dalc-footer {
    flex-wrap: wrap;
    gap: 22px;
    padding-block: 28px;
  }
  .dalc-footer > div {
    width: 100%;
  }
  .dalc-footer > div > span {
    font-size: 0.62rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dalc *,
  .dalc *::before,
  .dalc *::after {
    transition: none !important;
    animation: none !important;
  }
}
</style>
