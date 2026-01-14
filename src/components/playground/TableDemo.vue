<template>
  <div class="table-wrapper">
    <!-- Search -->
    <div class="table-actions">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por nome ou email..."
        class="search-input"
      />
    </div>

    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in filteredItems" :key="item.email">
          <!-- Edição inline -->
          <td>
            <input
              v-if="editIndex === item.email"
              v-model="editItemData.name"
              class="edit-input"
            />
            <span v-else>{{ item.name }}</span>
          </td>
          <td>
            <input
              v-if="editIndex === item.email"
              v-model="editItemData.email"
              class="edit-input"
            />
            <span v-else>{{ item.email }}</span>
          </td>
          <td>
            <select
              v-if="editIndex === item.email"
              v-model="editItemData.status"
              class="edit-select"
            >
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="inativo">Inativo</option>
            </select>
            <span v-else :class="['status', item.status]">{{ item.status }}</span>
          </td>

          <!-- Botões de ação -->
          <td class="actions">
            <button
              v-if="editIndex === item.email"
              @click="saveItem(item)"
              class="save-btn"
            >
              Salvar
            </button>
            <button
              v-else
              @click="startEdit(item)"
              class="edit-btn"
            >
              Editar
            </button>
            <button @click="confirmDelete(item)" class="delete-btn">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>Deseja realmente excluir <strong>{{ deleteItemData?.name }}</strong>?</p>
        <div class="modal-actions">
          <button @click="deleteConfirmed" class="delete-btn">Sim, excluir</button>
          <button @click="showDeleteModal = false" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Item {
  name: string
  email: string
  status: 'ativo' | 'pendente' | 'inativo'
}

const items = ref<Item[]>([
  { name: 'Ana Lucia', email: 'ana@gmail.com', status: 'ativo' },
  { name: 'Maria Luiza', email: 'maria@gmail.com', status: 'pendente' },
  { name: 'Mario Braz', email: 'mario@gmail.com', status: 'inativo' }
])

const searchQuery = ref('')

// Filtragem por search
const filteredItems = computed(() =>
  items.value.filter(
    i =>
      i.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// Edição inline
const editIndex = ref<string | null>(null)
const editItemData = ref<Item>({ name: '', email: '', status: 'ativo' })

function startEdit(item: Item) {
  editIndex.value = item.email
  editItemData.value = { ...item } // copia os dados
}

function saveItem(item: Item) {
  // Atualiza os dados no array
  const idx = items.value.findIndex(i => i.email === item.email)
  if (idx !== -1) {
    items.value[idx] = { ...editItemData.value }
  }
  editIndex.value = null
}

// Modal de exclusão
const showDeleteModal = ref(false)
const deleteItemData = ref<Item | null>(null)

function confirmDelete(item: Item) {
  deleteItemData.value = item
  showDeleteModal.value = true
}

function deleteConfirmed() {
  if (deleteItemData.value) {
    items.value = items.value.filter(i => i.email !== deleteItemData.value!.email)
  }
  showDeleteModal.value = false
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.table-actions {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.edit-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.edit-select {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  color: #1f2937;
}

th {
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

tr:hover {
  background: #f9fafb;
}

.status {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.ativo {
  background: #dcfce7;
  color: #166534;
}

.status.pendente {
  background: #fef9c3;
  color: #854d0e;
}

.status.inativo {
  background: #fee2e2;
  color: #991b1b;
}

.actions button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

.edit-btn {
  background: #3b82f6;
  color: #fff;
}

.save-btn {
  background: #10b981;
  color: #fff;
}

.delete-btn {
  background: #ef4444;
  color: #fff;
     border: none;
}

.cancel-btn {
  background: #6b7280;
  color: #fff;
border:none;
rounded:6px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(31, 41, 55, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  width: 300px;
  text-align: center;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}

.modal-actions button {
  padding: 0.75rem 1.5rem; /* maior tamanho */
  border-radius: 08px;      /* bordas bem arredondadas */
  font-size: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}
</style>
