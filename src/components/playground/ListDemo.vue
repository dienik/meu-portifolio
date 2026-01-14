<template>
  <div class="list-wrapper">
    <!-- Adicionar novo item -->
    <div class="add-item">
      <input
        v-model="newItem"
        type="text"
        placeholder="Adicionar novo item..."
        @keyup.enter="addItem"
      />
      <button @click="addItem" class="add-btn">Adicionar</button>
    </div>

    <ul class="list">
      <li v-for="(item, index) in items" :key="index">
        <div v-if="editIndex === index" class="edit-row">
          <input v-model="editItemValue" class="edit-input" />
          <button @click="saveItem(index)" class="save-btn">Salvar</button>
          <button @click="cancelEdit" class="cancel-btn">Cancelar</button>
        </div>

        <div v-else class="item-row">
          <span>{{ item }}</span>
          <div class="actions">
            <button @click="startEdit(index)" class="edit-btn">Editar</button>
            <button @click="confirmDelete(index)" class="delete-btn">Excluir</button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Modal de exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>Deseja realmente excluir <strong>{{ deleteItemData?.item }}</strong>?</p>
        <div class="modal-actions">
          <button @click="deleteConfirmed" class="delete-btn">Sim, excluir</button>
          <button @click="showDeleteModal = false" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DeleteData {
  index: number
  item: string
}

const items = ref(['Dashboard', 'Usuários', 'Relatórios'])
const newItem = ref('')
const editIndex = ref<number | null>(null)
const editItemValue = ref('')

// Modal de exclusão
const showDeleteModal = ref(false)
const deleteItemData = ref<DeleteData | null>(null)

// Funções
function addItem() {
  if (newItem.value.trim() === '') return
  items.value.push(newItem.value.trim())
  newItem.value = ''
}

function startEdit(index: number) {
  editIndex.value = index
  editItemValue.value = items.value[index] ?? ''
}

function saveItem(index: number) {
  if (editItemValue.value.trim() === '') return
  items.value[index] = editItemValue.value.trim()
  editIndex.value = null
}

function cancelEdit() {
  editIndex.value = null
}

// Ações de exclusão
function confirmDelete(index: number) {
  deleteItemData.value = { index, item: items.value[index] ?? '' }
  showDeleteModal.value = true
}

function deleteConfirmed() {
  if (deleteItemData.value !== null) {
    items.value.splice(deleteItemData.value.index, 1)
  }
  showDeleteModal.value = false
  deleteItemData.value = null
}
</script>

<style scoped>
.list-wrapper {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.add-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-item input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

li:last-child {
  border-bottom: none;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions button {
  margin-left: 0.5rem;
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

.delete-btn {
  background: #ef4444;
  color: #fff;
}

.edit-row {
  display: flex;
  gap: 0.5rem;
}

.edit-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.save-btn {
  background: #10b981;
  color: #fff;
}

.cancel-btn {
  background: #6b7280;
  color: #fff;
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
  padding: 2rem;
  border-radius: 16px;
  width: 350px;
  text-align: center;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.modal-actions .delete-btn {
  background: #ef4444;
  color: #fff;
}

.modal-actions .cancel-btn {
  background: #6b7280;
  color: #fff;
}

.modal-actions button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
</style>
