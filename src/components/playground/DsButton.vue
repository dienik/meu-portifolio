<template>
  <button
    :class="['ds-button', variant, { loading }]"
    :disabled="loading || disabled"
    @click="$emit('click')"
  >
    <slot />
    <span v-if="loading" class="loader"></span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<style scoped>
.ds-button {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: 0.2s;
}
.ds-button.primary { background: #3b82f6; color: #fff; }
.ds-button.secondary { background: #e5e7eb; color: #1f2937; }
.ds-button.danger { background: #ef4444; color: #fff; }
.ds-button:disabled { cursor: not-allowed; opacity: 0.6; }
.loader {
  border: 2px solid #fff;
  border-top: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  position: absolute;
  right: 0.5rem;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
