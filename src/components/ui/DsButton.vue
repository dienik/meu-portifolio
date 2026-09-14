<template>
  <button
    class="ds-btn"
    :class="[variant, size, { loading }]"
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span class="label"><slot /></span>
    <span v-if="loading" class="spinner" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  },
)

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.ds-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--ds-radius-md);
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.ds-btn:focus-visible {
  outline: none;
  box-shadow: var(--ds-ring);
}

.ds-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ds-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.sm {
  min-height: 32px;
  padding: 0.35rem 0.7rem;
  font-size: var(--ds-fs-xs);
}

.md {
  min-height: 42px;
  padding: 0.6rem 1rem;
  font-size: var(--ds-fs-sm);
}

.lg {
  min-height: 48px;
  padding: 0.8rem 1.2rem;
  font-size: var(--ds-fs-md);
}

.primary {
  background: linear-gradient(135deg, var(--ds-primary), var(--ds-primary-strong));
  color: #fff;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.28);
}

.secondary {
  background: var(--ds-surface-strong);
  color: var(--ds-text);
  border-color: var(--ds-border);
}

.ghost {
  background: transparent;
  color: var(--ds-text);
  border-color: var(--ds-border);
}

.danger {
  background: var(--ds-danger);
  color: #1f0b0b;
}

.loading .label {
  opacity: 0.65;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
