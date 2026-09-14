<template>
  <form class="form" @submit.prevent="submit">
    <div class="grid">
      <DsInput v-model="form.name" label="Nome" placeholder="Nome completo" :error="errors.name" />
      <DsInput v-model="form.email" label="E-mail" type="email" placeholder="nome@email.com" :error="errors.email" />
      <DsInput v-model="form.phone" label="Telefone" placeholder="(00) 00000-0000" :error="errors.phone" />
      <DsSelect v-model="form.role" label="Cargo" :options="ROLE_OPTIONS" :error="errors.role" />
      <DsSelect
        v-model="form.stack"
        label="Stack"
        :options="STACK_OPTIONS"
        multiple
        :error="errors.stack"
      />
      <DsSelect v-model="form.status" label="Status" :options="STATUS_OPTIONS" />
    </div>
    <DsTextarea v-model="form.bio" label="Bio" placeholder="Resumo profissional" hint="Até 180 caracteres." />
    <DsToggle v-model="form.notify" label="Receber atualizações do cadastro" />
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import DsInput from '../ui/DsInput.vue'
import DsSelect from '../ui/DsSelect.vue'
import DsTextarea from '../ui/DsTextarea.vue'
import DsToggle from '../ui/DsToggle.vue'
import {
  ROLE_OPTIONS,
  STACK_OPTIONS,
  STATUS_OPTIONS,
  type Registration,
  type RegistrationStatus,
} from '../../stores/registrations'

export type RegistrationDraft = {
  id?: string
  name: string
  email: string
  phone: string
  role: string
  stack: string[]
  status: RegistrationStatus
  bio: string
  notify: boolean
}

const props = defineProps<{
  initial?: Registration | null
}>()

const emit = defineEmits<{
  submit: [value: RegistrationDraft]
}>()

const empty: RegistrationDraft = {
  name: '',
  email: '',
  phone: '',
  role: '',
  stack: [],
  status: 'pendente',
  bio: '',
  notify: true,
}

const form = reactive<RegistrationDraft>({ ...empty })
const errors = reactive<Record<string, string>>({})

function applyInitial(value?: Registration | null) {
  Object.assign(form, empty)
  if (value) {
    Object.assign(form, {
      id: value.id,
      name: value.name,
      email: value.email,
      phone: value.phone,
      role: value.role,
      stack: [...value.stack],
      status: value.status,
      bio: value.bio,
      notify: value.notify,
    })
  }
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

watch(
  () => props.initial,
  (value) => applyInitial(value),
  { immediate: true },
)

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validate() {
  errors.name = form.name.trim() ? '' : 'Informe o nome.'
  errors.email = isEmail(form.email) ? '' : 'Informe um e-mail válido.'
  errors.phone = form.phone.trim() ? '' : 'Informe o telefone.'
  errors.role = form.role ? '' : 'Escolha o cargo.'
  errors.stack = form.stack.length ? '' : 'Escolha ao menos uma tecnologia.'
  return !Object.values(errors).some(Boolean)
}

function submit() {
  if (!validate()) return
  emit('submit', { ...form, stack: [...form.stack] })
}

defineExpose({ submit, applyInitial })
</script>

<style scoped>
.form {
  display: grid;
  gap: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
