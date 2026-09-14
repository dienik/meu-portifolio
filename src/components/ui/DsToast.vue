<template>
  <div v-if="message" class="ds-toast" :class="tone" role="status">{{ message }}</div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    tone?: 'success' | 'danger' | 'info'
  }>(),
  {
    message: '',
    tone: 'success',
  },
)
</script>

<style scoped>
.ds-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 90;
  padding: 0.85rem 1rem;
  border-radius: var(--ds-radius-md);
  font-weight: 700;
  box-shadow: var(--ds-shadow);
}

.success {
  background: #064e3b;
  color: #a7f3d0;
}

.danger {
  background: #7f1d1d;
  color: #fecaca;
}

.info {
  background: #1e3a8a;
  color: #bfdbfe;
}
</style>
