<template>
  <label class="ds-field">
    <span v-if="label" class="label">{{ label }}</span>
    <textarea
      class="control"
      :class="{ invalid: Boolean(error) }"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :value="model"
      @input="onInput"
    />
    <span v-if="error" class="error">{{ error }}</span>
    <span v-else-if="hint" class="hint">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    rows?: number
  }>(),
  {
    label: '',
    placeholder: '',
    error: '',
    hint: '',
    disabled: false,
    rows: 4,
  },
)

function onInput(event: Event) {
  model.value = (event.target as HTMLTextAreaElement).value
}
</script>

<style scoped>
.ds-field {
  display: grid;
  gap: 0.4rem;
}

.label {
  font-size: var(--ds-fs-sm);
  font-weight: 700;
}

.control {
  width: 100%;
  padding: 0.75rem 0.8rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: rgba(5, 8, 22, 0.45);
  color: var(--ds-text);
  font: inherit;
  resize: vertical;
}

.control:focus {
  outline: none;
  box-shadow: var(--ds-ring);
  border-color: var(--ds-primary);
}

.invalid {
  border-color: var(--ds-danger);
}

.error {
  color: var(--ds-danger);
  font-size: var(--ds-fs-xs);
}

.hint {
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-xs);
}
</style>
