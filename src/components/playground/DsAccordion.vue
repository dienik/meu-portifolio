<template>
  <div class="accordion">
    <div class="header" @click="open = !open">
      <slot name="title" /> <span>{{ open ? '▲' : '▼' }}</span>
    </div>
    <div class="body" v-if="open"><slot name="content" /></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
.header { padding: 0.5rem; background: #e5e7eb; border-radius: 6px; display: flex; justify-content: space-between; cursor: pointer; font-weight: 600; }
.body { padding: 0.5rem; border-left: 2px solid #3b82f6; margin-top: 0.25rem; }
</style>
