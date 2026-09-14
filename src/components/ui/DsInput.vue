<template>
  <label class="ds-field">
    <span v-if="label" class="label">{{ label }}</span>
    <input
      class="control"
      :class="{ invalid: Boolean(error) }"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
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
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
  }>(),
  {
    label: '',
    type: 'text',
    placeholder: '',
    error: '',
    hint: '',
    disabled: false,
  },
)

function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value
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
  color: var(--ds-text);
}

.control {
  width: 100%;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: rgba(5, 8, 22, 0.45);
  color: var(--ds-text);
  font: inherit;
}

.control::placeholder {
  color: #7d8aab;
}

.control:focus {
  outline: none;
  box-shadow: var(--ds-ring);
  border-color: var(--ds-primary);
}

.invalid {
  border-color: var(--ds-danger);
}

.error,
.hint {
  font-size: var(--ds-fs-xs);
}

.error {
  color: var(--ds-danger);
}

.hint {
  color: var(--ds-text-muted);
}
</style>
