<template>
  <main class="ia-chat-test">
    <section class="ia-chat-test__card">
      <section class="ia-chat-test__panel ia-chat-test__panel--form">
        <form class="ia-chat-test__form" @submit.prevent="sendQuestion">
          <label for="ia-chat-email">Tu correo electrónico</label>
          <input
            id="ia-chat-email"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="tu.nombre@scrd.gov.co"
            :disabled="isLoading"
            required
          />

          <label for="ia-chat-question">Pregunta</label>
          <textarea
            id="ia-chat-question"
            v-model="question"
            name="consulta"
            rows="7"
            maxlength="1200"
            placeholder="Por ejemplo: ¿Qué preguntas están relacionadas con patrimonio?"
            :disabled="isLoading"
            required
          ></textarea>

          <p class="ia-chat-test__hint">La consulta se envía al catálogo de preguntas de la EBC.</p>

          <button type="submit" :disabled="isLoading || !email.trim() || !question.trim()">
            {{ isLoading ? 'Consultando…' : 'Enviar pregunta' }}
          </button>
        </form>

        <p
          v-if="errorMessage"
          class="ia-chat-test__message ia-chat-test__message--error"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </section>

      <section class="ia-chat-test__panel ia-chat-test__panel--response">
        <div class="ia-chat-test__response" aria-live="polite">
          <h2>RESPUESTA</h2>
          <div v-if="isLoading" class="ia-chat-test__loading" role="status">
            <div class="spinner-border" aria-hidden="true"></div>
            <span>Consultando...</span>
          </div>
          <div v-else-if="answer !== null" class="ia-chat-test__result">
            <div class="ia-chat-test__answer" v-html="renderedAnswer"></div>

            <dl v-if="responseMetadata" class="ia-chat-test__metadata">
              <template v-if="responseMetadata.collection">
                <dt>Colección</dt>
                <dd>{{ responseMetadata.collection }}</dd>
              </template>
              <template v-if="responseMetadata.generatedAt">
                <dt>Generada</dt>
                <dd>{{ responseMetadata.generatedAt }}</dd>
              </template>
            </dl>
          </div>
          <div v-else class="ia-chat-test__empty">
            La respuesta generada aparecerá aquí después de enviar una consulta.
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, ref } from 'vue'

const testWebhookUrl =
  'https://n8n.srv1263481.hstgr.cloud/webhook-test/b02cb987-896a-4b87-acd9-212db0e192e7'
const productionWebhookUrl =
  'https://n8n.srv1263481.hstgr.cloud/webhook/b02cb987-896a-4b87-acd9-212db0e192e7'
const queryString = window.location.hash.includes('?')
  ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
  : window.location.search.slice(1)
const test = new URLSearchParams(queryString).get('test') === 'true'
const webhookUrl = test ? testWebhookUrl : productionWebhookUrl
const question = ref(
  'Clasifica las preguntas existentes en el cuestionario que traten el tema de patrimonio en 3 temas grandes, di cuantas preguntas hay, y muéstralo en una tabla con titulo, descripcion y cantidad',
)
const email = ref('javier.ojeda@scrd.gov.co')
const answer = ref(null)
const responseMetadata = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)
const validEmails = ['javier.ojeda@scrd.gov.co', 'diego.maldonado@scrd.gov.co']
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim()
const recaptchaAction = 'ia_chat_test'
let recaptchaLoaderPromise
const renderedAnswer = computed(() => {
  if (!answer.value) return ''

  const html = marked.parse(answer.value, { async: false })
  return DOMPurify.sanitize(html)
})

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

function isValidEmail(value) {
  return validEmails.includes(normalizeEmail(value))
}

function loadRecaptcha() {
  if (!recaptchaSiteKey) {
    return Promise.reject(new Error('Configura VITE_RECAPTCHA_SITE_KEY para activar reCAPTCHA.'))
  }

  if (window.grecaptcha?.execute) {
    return Promise.resolve()
  }

  if (recaptchaLoaderPromise) return recaptchaLoaderPromise

  recaptchaLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`
    script.async = true
    script.defer = true
    script.dataset.recaptcha = 'v3'
    script.onload = () => {
      if (!window.grecaptcha?.ready) {
        reject(new Error('No fue posible inicializar reCAPTCHA.'))
        return
      }

      window.grecaptcha.ready(resolve)
    }
    script.onerror = () => reject(new Error('No fue posible cargar reCAPTCHA de Google.'))
    document.head.appendChild(script)
  })

  return recaptchaLoaderPromise
}

async function getRecaptchaToken() {
  await loadRecaptcha()

  const token = await window.grecaptcha.execute(recaptchaSiteKey, {
    action: recaptchaAction,
  })

  if (!token) throw new Error('reCAPTCHA no generó un token válido.')

  return token
}

function formatGeneratedAt(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getErrorDetails(responseBody, status) {
  if (typeof responseBody === 'string' && responseBody.trim()) return responseBody

  if (responseBody && typeof responseBody === 'object') {
    return (
      responseBody.error ||
      responseBody.message ||
      responseBody.respuesta ||
      `El webhook respondió con estado ${status}.`
    )
  }

  return `El webhook respondió con estado ${status}.`
}

async function sendQuestion() {
  const trimmedQuestion = question.value.trim()
  const normalizedEmail = normalizeEmail(email.value)

  if (!trimmedQuestion || !normalizedEmail || isLoading.value) return

  answer.value = null
  responseMetadata.value = null
  errorMessage.value = ''

  if (!isValidEmail(normalizedEmail)) {
    errorMessage.value = 'El email indicado no está autorizado para esta prueba.'
    return
  }

  isLoading.value = true

  try {
    const recaptchaToken = await getRecaptchaToken()
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consulta: trimmedQuestion,
        email: normalizedEmail,
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
      }),
    })

    const contentType = response.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text()
    const normalizedBody =
      Array.isArray(responseBody) && responseBody.length === 1 ? responseBody[0] : responseBody

    if (!response.ok) {
      throw new Error(getErrorDetails(normalizedBody, response.status))
    }

    if (!normalizedBody || typeof normalizedBody !== 'object' || Array.isArray(normalizedBody)) {
      throw new Error('El webhook no devolvió una respuesta JSON válida.')
    }

    if (normalizedBody.ok === false) {
      throw new Error(getErrorDetails(normalizedBody, response.status))
    }

    const validRecaptcha = normalizedBody.valid_recaptcha
    if (validRecaptcha === false) {
      throw new Error('No fue posible validar el reCAPTCHA. Intenta nuevamente.')
    }

    if (typeof normalizedBody.respuesta !== 'string' || !normalizedBody.respuesta.trim()) {
      throw new Error('La respuesta del webhook no contiene el campo "respuesta" esperado.')
    }

    answer.value = normalizedBody.respuesta.trim()

    const collection = normalizedBody.coleccion || ''
    const generatedAt = formatGeneratedAt(normalizedBody.generado_en)
    responseMetadata.value = collection || generatedAt ? { collection, generatedAt } : null
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No fue posible enviar la pregunta.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.ia-chat-test {
  --ia-chat-primary: var(--color-primary, #32204a);
  --ia-chat-primary-dark: #271739;
  --ia-chat-primary-light: var(--color-primary-light, #f0ebf7);
  --ia-chat-secondary: var(--color-secondary, #5c6972);
  --ia-chat-muted: var(--color-muted, #8c96a0);
  --ia-chat-radius: var(--radius-premium, 12px);
  --ia-chat-shadow: var(--shadow-premium, 0 4px 12px rgba(50, 32, 74, 0.05));

  width: 100%;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background: #ffffff;
  color: #26313a;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

.ia-chat-test__card {
  width: min(100%, 1180px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(17rem, 0.85fr) minmax(0, 1.75fr);
  gap: clamp(1rem, 2vw, 1.5rem);
  align-items: start;
}

.ia-chat-test__panel {
  min-width: 0;
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 0;
  border-radius: var(--ia-chat-radius);
  background: #ffffff;
  box-shadow: var(--ia-chat-shadow);
}

.ia-chat-test__panel--form {
  align-self: start;
}

.ia-chat-test__panel--response {
  min-height: 32rem;
}

h2,
p {
  margin-top: 0;
}

.ia-chat-test__form {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

label {
  color: var(--ia-chat-primary);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: -0.005em;
}

label:not(:first-child) {
  margin-top: 0.4rem;
}

input,
textarea {
  width: 100%;
  padding: 0.78rem 0.95rem;
  border: 1px solid #eef0f2;
  border-radius: var(--ia-chat-radius);
  background: #f8fafc;
  resize: vertical;
  color: var(--ia-chat-primary);
  font: inherit;
  line-height: 1.5;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

textarea {
  min-height: 10.5rem;
}

input:focus,
textarea:focus {
  border-color: var(--ia-chat-primary);
  outline: 0;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(50, 32, 74, 0.05);
}

input::placeholder,
textarea::placeholder {
  color: #9ba4ac;
}

.ia-chat-test__hint {
  margin: 0.1rem 0 0;
  color: var(--ia-chat-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

button {
  align-self: stretch;
  min-height: 2.75rem;
  margin-top: 0.65rem;
  padding: 0.7rem 1.1rem;
  border: 0;
  border-radius: 10px;
  background: var(--ia-chat-primary);
  color: #ffffff;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

button:hover:not(:disabled),
button:focus-visible:not(:disabled) {
  background: var(--ia-chat-primary-dark);
  box-shadow: 0 6px 14px rgba(50, 32, 74, 0.16);
  transform: translateY(-1px);
}

button:focus-visible {
  outline: 3px solid rgba(50, 32, 74, 0.16);
  outline-offset: 3px;
}

input:disabled,
button:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.ia-chat-test__message {
  margin: 1.25rem 0 0;
  padding: 0.8rem 0.95rem;
  border-radius: var(--ia-chat-radius);
  line-height: 1.45;
}

.ia-chat-test__message--error {
  border: 1px solid #fed7d7;
  background: #fff5f5;
  color: #c53030;
}

.ia-chat-test__response {
  height: 100%;
}

.ia-chat-test__response h2 {
  margin-bottom: 1.25rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid #f0f1f3;
  color: var(--ia-chat-primary);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.ia-chat-test__answer {
  margin: 0;
  padding: 0.15rem 0 0;
  background: transparent;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: #39444d;
  line-height: 1.5;
}

.ia-chat-test__loading {
  display: flex;
  min-height: 22rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--ia-chat-secondary);
  font-size: 0.88rem;
  font-weight: 600;
}

.ia-chat-test__loading .spinner-border {
  width: 2.25rem;
  height: 2.25rem;
  border-width: 0.2rem;
  color: var(--ia-chat-primary);
}

.ia-chat-test__result {
  animation: ia-chat-test-result-fade 3s ease-in-out both;
}

.ia-chat-test__empty {
  display: grid;
  min-height: 22rem;
  place-items: center;
  padding: 1.5rem;
  color: var(--ia-chat-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  text-align: center;
}

.ia-chat-test__answer :deep(:first-child) {
  margin-top: 0;
}

.ia-chat-test__answer :deep(:last-child) {
  margin-bottom: 0;
}

.ia-chat-test__answer :deep(p) {
  margin: 0.45rem 0;
}

.ia-chat-test__answer :deep(h1),
.ia-chat-test__answer :deep(h2),
.ia-chat-test__answer :deep(h3),
.ia-chat-test__answer :deep(h4) {
  margin: 0.9rem 0 0.35rem;
  color: var(--ia-chat-primary);
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.ia-chat-test__answer :deep(ul),
.ia-chat-test__answer :deep(ol) {
  margin: 0.45rem 0;
  padding-left: 1.5rem;
}

.ia-chat-test__answer :deep(code) {
  padding: 0.12rem 0.35rem;
  border-radius: 0.3rem;
  background: var(--ia-chat-primary-light);
  color: var(--ia-chat-primary);
  font-size: 0.9em;
}

.ia-chat-test__answer :deep(pre) {
  margin: 0.7rem 0;
  padding: 0.8rem;
  border-radius: var(--ia-chat-radius);
  background: var(--ia-chat-primary);
  color: #ffffff;
  overflow-x: auto;
}

.ia-chat-test__answer :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.ia-chat-test__answer :deep(a) {
  color: var(--ia-chat-primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.ia-chat-test__answer :deep(table) {
  width: 100%;
  margin: 0.7rem 0;
  border: 1px solid #eef0f2;
  border-spacing: 0;
  border-radius: var(--ia-chat-radius);
  border-collapse: separate;
  overflow: hidden;
  font-size: 0.92rem;
}

.ia-chat-test__answer :deep(th),
.ia-chat-test__answer :deep(td) {
  padding: 0.65rem 0.75rem;
  border: 0;
  border-right: 1px solid #eef0f2;
  border-bottom: 1px solid #eef0f2;
  text-align: left;
  vertical-align: top;
}

.ia-chat-test__answer :deep(th:last-child),
.ia-chat-test__answer :deep(td:last-child) {
  border-right: 0;
}

.ia-chat-test__answer :deep(tbody tr:last-child td) {
  border-bottom: 0;
}

.ia-chat-test__answer :deep(th) {
  background: var(--ia-chat-primary-light);
  color: var(--ia-chat-primary);
  font-weight: 800;
}

.ia-chat-test__answer :deep(tbody tr:nth-child(even)) {
  background: #fbfcfd;
}

.ia-chat-test__metadata {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 0.75rem;
  margin: 1.25rem 0 0;
  padding-top: 0.9rem;
  border-top: 1px solid #f0f1f3;
  color: var(--ia-chat-muted);
  font-size: 0.78rem;
}

.ia-chat-test__metadata dt {
  color: var(--ia-chat-secondary);
  font-weight: 800;
}

.ia-chat-test__metadata dd {
  margin: 0;
}

@keyframes ia-chat-test-result-fade {
  0% {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  15%,
  41%,
  67%,
  93%,
  100% {
    opacity: 1;
    transform: translateY(0);
  }

  28%,
  54%,
  80% {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ia-chat-test__result {
    animation: none;
  }
}

@media (max-width: 900px) {
  .ia-chat-test__card {
    grid-template-columns: 1fr;
  }

  .ia-chat-test__panel--response {
    min-height: 0;
  }

  .ia-chat-test__loading,
  .ia-chat-test__empty {
    min-height: 12rem;
  }
}

@media (max-width: 600px) {
  .ia-chat-test {
    padding: 0.5rem;
  }

  .ia-chat-test__panel {
    padding: 1.1rem;
  }

  .ia-chat-test__panel--response {
    min-height: 20rem;
  }
}
</style>
