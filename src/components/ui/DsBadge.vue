<template>
  <span class="ds-badge" :class="resolved"><slot>{{ label }}</slot></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
    label?: string
    type?: string
  }>(),
  {
    variant: 'info',
    label: '',
    type: '',
  },
)

const resolved = computed(() => {
  const fromType = props.type
  if (
    fromType === 'success' ||
    fromType === 'warning' ||
    fromType === 'danger' ||
    fromType === 'info' ||
    fromType === 'primary'
  ) {
    return fromType
  }
  return props.variant
})
</script>

<style scoped>
.ds-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.65rem;
  border-radius: var(--ds-radius-full);
  font-size: var(--ds-fs-xs);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: capitalize;
}

.success {
  background: var(--ds-success-soft);
  color: var(--ds-success);
}

.warning {
  background: var(--ds-warning-soft);
  color: #fcd34d;
}

.danger {
  background: var(--ds-danger-soft);
  color: var(--ds-danger);
}

.info {
  background: var(--ds-info-soft);
  color: var(--ds-info);
}

.primary {
  background: var(--ds-primary-soft);
  color: var(--ds-primary);
}
</style>
