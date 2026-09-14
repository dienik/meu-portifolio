<template>
  <section class="page">
    <header class="hero">
      <div>
        <p class="kicker">Design System · Caso de uso</p>
        <h1>Dashboard de cadastro</h1>
        <p class="lead">
          CRUD de profissionais usando os mesmos tokens e componentes do portfólio:
          formulário, tabela, modal, badges, toggle e feedback.
        </p>
      </div>
      <DsButton size="lg" @click="openCreate">Novo cadastro</DsButton>
    </header>

    <div class="stats">
      <DsCard v-for="stat in stats" :key="stat.label" :title="stat.value" :subtitle="stat.label" />
    </div>

    <DsCard>
      <div class="filters">
        <DsInput v-model="query" placeholder="Buscar por nome, e-mail ou cargo" />
        <DsSelect v-model="statusFilter" :options="statusFilterOptions" placeholder="Status" />
        <DsSelect v-model="roleFilter" :options="roleFilterOptions" placeholder="Cargo" />
      </div>

      <DsTable :columns="columns" :rows="filtered">
        <template #cell-status="{ row }">
          <DsBadge :variant="statusVariant(asRegistration(row).status)">
            {{ asRegistration(row).status }}
          </DsBadge>
        </template>
        <template #cell-stack="{ row }">
          <div class="stack">
            <DsBadge v-for="tech in asRegistration(row).stack" :key="tech" variant="primary">
              {{ tech }}
            </DsBadge>
          </div>
        </template>
        <template #cell-notify="{ row }">
          {{ asRegistration(row).notify ? 'Sim' : 'Não' }}
        </template>
        <template #actions="{ row }">
          <div class="row-actions">
            <DsTooltip content="Editar cadastro">
              <DsButton size="sm" variant="secondary" @click="openEdit(asRegistration(row))">Editar</DsButton>
            </DsTooltip>
            <DsButton size="sm" variant="danger" @click="askDelete(asRegistration(row))">Excluir</DsButton>
          </div>
        </template>
        <template #empty>Nenhum cadastro corresponde aos filtros.</template>
      </DsTable>
    </DsCard>

    <DsModal v-if="formOpen" :title="editing ? 'Editar cadastro' : 'Novo cadastro'" @close="formOpen = false">
      <RegistrationForm ref="formRef" :initial="editing" @submit="save" />
      <template #footer>
        <DsButton variant="ghost" @click="formOpen = false">Cancelar</DsButton>
        <DsButton :loading="saving" @click="formRef?.submit()">Salvar</DsButton>
      </template>
    </DsModal>

    <DsModal v-if="pendingDelete" title="Excluir cadastro" @close="pendingDelete = null">
      <p>
        Deseja excluir <strong>{{ pendingDelete.name }}</strong>? Essa ação remove o registro
        salvo neste navegador.
      </p>
      <template #footer>
        <DsButton variant="ghost" @click="pendingDelete = null">Cancelar</DsButton>
        <DsButton variant="danger" @click="confirmDelete">Excluir</DsButton>
      </template>
    </DsModal>

    <DsToast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DsButton from '../ui/DsButton.vue'
import DsCard from '../ui/DsCard.vue'
import DsInput from '../ui/DsInput.vue'
import DsSelect from '../ui/DsSelect.vue'
import DsTable from '../ui/DsTable.vue'
import DsBadge from '../ui/DsBadge.vue'
import DsModal from '../ui/DsModal.vue'
import DsTooltip from '../ui/DsTooltip.vue'
import DsToast from '../ui/DsToast.vue'
import RegistrationForm from './RegistrationForm.vue'
import type { RegistrationDraft } from './RegistrationForm.vue'
import {
  registrations,
  removeRegistration,
  upsertRegistration,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  type Registration,
  type RegistrationStatus,
} from '../../stores/registrations'

const query = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const formOpen = ref(false)
const saving = ref(false)
const editing = ref<Registration | null>(null)
const pendingDelete = ref<Registration | null>(null)
const toast = ref('')
const formRef = ref<{ submit: () => void } | null>(null)

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'role', label: 'Cargo' },
  { key: 'stack', label: 'Stack' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'notify', label: 'Alertas', width: '90px' },
]

const statusFilterOptions = [{ label: 'Todos os status', value: '' }, ...STATUS_OPTIONS]
const roleFilterOptions = [{ label: 'Todos os cargos', value: '' }, ...ROLE_OPTIONS]

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return registrations.value.filter((item) => {
    const matchesTerm =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.role.toLowerCase().includes(term)
    const matchesStatus = !statusFilter.value || item.status === statusFilter.value
    const matchesRole = !roleFilter.value || item.role === roleFilter.value
    return matchesTerm && matchesStatus && matchesRole
  })
})

const stats = computed(() => {
  const all = registrations.value
  return [
    { label: 'Total', value: String(all.length) },
    { label: 'Ativos', value: String(all.filter((item) => item.status === 'ativo').length) },
    { label: 'Pendentes', value: String(all.filter((item) => item.status === 'pendente').length) },
    { label: 'Inativos', value: String(all.filter((item) => item.status === 'inativo').length) },
  ]
})

function asRegistration(row: unknown): Registration {
  return row as Registration
}

function statusVariant(status: RegistrationStatus) {
  if (status === 'ativo') return 'success' as const
  if (status === 'pendente') return 'warning' as const
  return 'danger' as const
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(row: Registration) {
  editing.value = row
  formOpen.value = true
}

function askDelete(row: Registration) {
  pendingDelete.value = row
}

function flash(message: string) {
  toast.value = message
  window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

async function save(draft: RegistrationDraft) {
  saving.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 280))
  upsertRegistration(draft)
  saving.value = false
  formOpen.value = false
  flash(draft.id ? 'Cadastro atualizado.' : 'Cadastro criado.')
}

function confirmDelete() {
  if (!pendingDelete.value) return
  removeRegistration(pendingDelete.value.id)
  pendingDelete.value = null
  flash('Cadastro excluído.')
}
</script>

<style scoped>
.page {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 4rem;
  display: grid;
  gap: 1.5rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-end;
}

.kicker {
  margin: 0 0 0.4rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: var(--ds-fs-3xl);
}

.lead {
  max-width: 58ch;
  margin: 0.7rem 0 0;
  color: var(--ds-text-muted);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.filters {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr 0.9fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.stack,
.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

@media (max-width: 900px) {
  .hero,
  .stats,
  .filters {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
