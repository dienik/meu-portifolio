<template>
  <div>
    <input type="range" min="100" max="250" v-model="size" />
    <div class="box" :style="{ width: size+'px', height: size+'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const size = ref(120)
</script>

<style scoped>
input {
  width: 100%;
}

.box {
  margin-top: 1rem;
  background: #6366f1;
  transition: 0.3s;
}
</style>
