<template>
  <div class="card" @click="$emit('open')">
    <div class="preview">
      <slot />
    </div>

    <h3>{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits(['open'])
</script>

<style scoped>
.card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
}

.preview {
  height: 160px;
  overflow: hidden;
  margin-bottom: 1rem;
}

h3 {
  text-align: center;
  color: #0f172a;
}
</style>
