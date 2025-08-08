<template>
  <div>
    <h2>Glosario</h2>
    <p>{{ glosario.length }} términos encontrados</p>
    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>Término</th>
          <th>Sigla</th>
          <th>Definición</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in glosario" :key="item.término">
          <td>{{ item.término }}</td>
          <td>{{ item.sigla || '-' }}</td>
          <td>{{ item.definición }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const glosario = ref([])

onMounted(async () => {
  const res = await fetch(
    `${import.meta.env.BASE_URL}content/2025/projects/i100_plan_cultura/glosario.json`,
  )
  glosario.value = await res.json()
})
</script>
