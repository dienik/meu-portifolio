<template>
  <span :class="['badge', variant]"><slot /></span>
</template>

<script setup lang="ts">
const props = defineProps<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>()
</script>

<style scoped>
.badge { padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 999px; display: inline-block; }
.badge.success { background: #dcfce7; color: #166534; }
.badge.warning { background: #fef9c3; color: #854d0e; }
.badge.danger { background: #fee2e2; color: #991b1b; }
.badge.info { background: #bfdbfe; color: #1e3a8a; }
</style>
