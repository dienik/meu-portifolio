<template>
  <div class="playground-ui">

    <div class="badges">
      <DsBadge variant="success">Sucesso</DsBadge>
      <DsBadge variant="warning">Alerta</DsBadge>
      <DsBadge variant="danger">Perigo</DsBadge>
          <DsBadge variant="info">Informação</DsBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import DsBadge from './DsBadge.vue'
</script>

<style scoped>
.playground-ui {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
}

.badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
