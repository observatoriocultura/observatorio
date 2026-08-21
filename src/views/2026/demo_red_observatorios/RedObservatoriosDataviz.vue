<template>
  <section class="red-observatorios-dataviz" aria-labelledby="connections-title">
    <i class="bi bi-diagram-3" aria-hidden="true"></i>
    <p>Conexiones</p>
    <h1 id="connections-title">En construcción</h1>
  </section>
</template>

<style scoped>
.red-observatorios-dataviz {
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px dashed #cbb9df;
  border-radius: 16px;
  background: #fff;
  text-align: center;
}

.red-observatorios-dataviz i {
  margin-bottom: 0.8rem;
  color: var(--red-purple, #654096);
  font-size: 2rem;
}

.red-observatorios-dataviz p {
  margin: 0 0 0.35rem;
  color: var(--red-purple, #654096);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.red-observatorios-dataviz h1 {
  margin: 0;
  color: var(--red-purple-dark, #32204a);
  font-size: clamp(1.8rem, 4vw, 2.75rem);
}
</style>
