import { ref, watch } from 'vue'

export type RegistrationStatus = 'ativo' | 'pendente' | 'inativo'

export interface Registration {
  id: string
  name: string
  email: string
  phone: string
  role: string
  stack: string[]
  status: RegistrationStatus
  bio: string
  notify: boolean
  createdAt: string
}

export const ROLE_OPTIONS = [
  { label: 'Front-end', value: 'Front-end' },
  { label: 'Back-end', value: 'Back-end' },
  { label: 'Full-stack', value: 'Full-stack' },
  { label: 'UX/UI', value: 'UX/UI' },
  { label: 'QA', value: 'QA' },
]

export const STACK_OPTIONS = [
  { label: 'Vue.js', value: 'Vue.js' },
  { label: 'React', value: 'React' },
  { label: 'Angular', value: 'Angular' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'HTML/CSS', value: 'HTML/CSS' },
  { label: 'REST APIs', value: 'REST APIs' },
  { label: 'CI/CD', value: 'CI/CD' },
]

export const STATUS_OPTIONS = [
  { label: 'Ativo', value: 'ativo' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Inativo', value: 'inativo' },
]

const STORAGE_KEY = 'meu-portfolio:registrations'

const seed: Registration[] = [
  {
    id: 'reg-1',
    name: 'Ana Lucia Costa',
    email: 'ana.costa@email.com',
    phone: '(51) 99812-4410',
    role: 'Front-end',
    stack: ['Vue.js', 'TypeScript', 'HTML/CSS'],
    status: 'ativo',
    bio: 'Desenvolve interfaces acessíveis e componentes reutilizáveis.',
    notify: true,
    createdAt: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'reg-2',
    name: 'Mario Braz',
    email: 'mario.braz@email.com',
    phone: '(11) 98765-2211',
    role: 'Full-stack',
    stack: ['Node.js', 'Vue.js', 'REST APIs'],
    status: 'pendente',
    bio: 'Integra APIs e cuida da entrega contínua dos produtos.',
    notify: false,
    createdAt: '2026-04-02T14:30:00.000Z',
  },
  {
    id: 'reg-3',
    name: 'Maria Luiza Alves',
    email: 'maria.alves@email.com',
    phone: '(21) 99600-7788',
    role: 'UX/UI',
    stack: ['HTML/CSS', 'Vue.js'],
    status: 'ativo',
    bio: 'Une pesquisa com o usuário e design system na mesma entrega.',
    notify: true,
    createdAt: '2026-05-18T09:15:00.000Z',
  },
  {
    id: 'reg-4',
    name: 'Paulo Henrique Dias',
    email: 'paulo.dias@email.com',
    phone: '(41) 98444-1200',
    role: 'QA',
    stack: ['CI/CD', 'TypeScript'],
    status: 'inativo',
    bio: 'Automatiza regressão visual e fluxos críticos de cadastro.',
    notify: false,
    createdAt: '2026-01-09T16:40:00.000Z',
  },
]

function load(): Registration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Registration[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    // ignore invalid storage
  }
  return seed.map((item) => ({ ...item, stack: [...item.stack] }))
}

export const registrations = ref<Registration[]>(load())

watch(
  registrations,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

export function upsertRegistration(entry: Omit<Registration, 'id' | 'createdAt'> & { id?: string }) {
  if (entry.id) {
    const index = registrations.value.findIndex((item) => item.id === entry.id)
    if (index >= 0) {
      const current = registrations.value[index]
      registrations.value[index] = {
        ...current,
        ...entry,
        id: current.id,
        createdAt: current.createdAt,
      }
      return registrations.value[index]
    }
  }

  const created: Registration = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  registrations.value = [created, ...registrations.value]
  return created
}

export function removeRegistration(id: string) {
  registrations.value = registrations.value.filter((item) => item.id !== id)
}
