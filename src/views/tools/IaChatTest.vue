<template>
  <main class="ia-chat-test">
    <section class="ia-chat-test__card" aria-labelledby="ia-chat-test-title">
      <p class="ia-chat-test__eyebrow">Herramienta de prueba</p>
      <h1 id="ia-chat-test-title">Consultar al asistente</h1>
      <p class="ia-chat-test__description">
        Escribe una pregunta y envíala al webhook de n8n para revisar su respuesta.
      </p>

      <form class="ia-chat-test__form" @submit.prevent="sendQuestion">
        <label for="ia-chat-question">Pregunta</label>
        <input
          id="ia-chat-question"
          v-model="question"
          type="text"
          name="question"
          placeholder="Escribe aquí tu pregunta"
          :disabled="isLoading"
          required
        />

        <button type="submit" :disabled="isLoading || !question.trim()">
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

      <section v-if="answer !== null" class="ia-chat-test__response" aria-live="polite">
        <h2>Respuesta</h2>
        <pre>{{ answer }}</pre>
      </section>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const webhookUrl =
  'https://n8n.srv1263481.hstgr.cloud/webhook-test/b02cb987-896a-4b87-acd9-212db0e192e7'
const question = ref('')
const answer = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)

async function sendQuestion() {
  const trimmedQuestion = question.value.trim()

  if (!trimmedQuestion || isLoading.value) return

  answer.value = null
  errorMessage.value = ''

  if (!webhookUrl) {
    errorMessage.value =
      'Configura VITE_N8N_WEBHOOK_URL para conectar esta herramienta con el webhook de n8n.'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: trimmedQuestion }),
    })

    const contentType = response.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const details = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
      throw new Error(details || `El webhook respondió con estado ${response.status}.`)
    }

    answer.value =
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2)
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
  --ia-chat-accent: #654096;
  --ia-chat-accent-dark: #513277;

  min-height: 100vh;
  padding: clamp(1.25rem, 4vw, 3rem);
  background: #ffffff;
  color: #18232b;
}

.ia-chat-test__card {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border: 1px solid #e5e8ec;
  border-radius: 0.4em;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(24, 35, 43, 0.06);
}

.ia-chat-test__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--ia-chat-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0.6rem;
  font-size: clamp(1.65rem, 4vw, 2.25rem);
}

.ia-chat-test__description {
  margin-bottom: 1.75rem;
  color: #5b6670;
  line-height: 1.5;
}

.ia-chat-test__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

label {
  font-weight: 800;
}

input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #cbd3d9;
  border-radius: 0.4em;
  color: #18232b;
  font: inherit;
  line-height: 1.5;
}

input:focus {
  border-color: var(--ia-chat-accent);
  outline: 3px solid rgba(101, 64, 150, 0.14);
}

button {
  align-self: flex-start;
  margin-top: 0.35rem;
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 0.4em;
  background: var(--ia-chat-accent);
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

button:hover:not(:disabled),
button:focus-visible:not(:disabled) {
  background: var(--ia-chat-accent-dark);
}

button:focus-visible {
  outline: 3px solid rgba(101, 64, 150, 0.22);
  outline-offset: 2px;
}

button:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.ia-chat-test__message {
  margin: 1.25rem 0 0;
  padding: 0.75rem 0.9rem;
  border-radius: 0.4em;
  line-height: 1.45;
}

.ia-chat-test__message--error {
  background: #fff1f0;
  color: #a12820;
}

.ia-chat-test__response {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e8ec;
}

.ia-chat-test__response h2 {
  margin-bottom: 0.75rem;
  color: var(--ia-chat-accent);
  font-size: 1.1rem;
}

pre {
  max-height: 420px;
  margin: 0;
  padding: 1rem;
  overflow: auto;
  border-radius: 0.4em;
  background: #f4f6f8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
  line-height: 1.5;
}
</style>
