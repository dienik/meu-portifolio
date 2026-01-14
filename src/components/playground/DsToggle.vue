<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="localValue"
      @change="onChange"
    />
    <span class="slider"></span>
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Desestruturando props para poder usar no TS
const props = defineProps<{
  modelValue: boolean
}>()

// Emits tipado
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Estado local
const localValue = ref(props.modelValue)

// Sincroniza se prop mudar
watch(() => props.modelValue, (val) => {
  localValue.value = val
})

// Função change
function onChange(e: Event) {
  const input = e.target as HTMLInputElement
  localValue.value = input.checked
  emit('update:modelValue', input.checked)
}
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 28px;
  transition: 0.4s;
}

.slider::before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider::before {
  transform: translateX(22px);
}
</style>
