<template>
  <div class="playground-ui">

    <DsToggle v-model="toggleState" />

    <p>Estado atual: <strong>{{ toggleState ? 'Ativado' : 'Desativado' }}</strong></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DsToggle from '../ui/DsToggle.vue'

const toggleState = ref(false)
</script>

<style scoped>
.playground-ui {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  font-family: sans-serif;
  padding: 2rem;
}
</style>
