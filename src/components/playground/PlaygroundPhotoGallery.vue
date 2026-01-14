<template>
  <div class="photo-gallery">

    <!-- Seletor de autores -->
    <SelectorDemo
      :options="authors"
      v-model:selected="selectedAuthor"
      placeholder="Filtrar por autor"
    />

    <!-- Botões de visualização -->
    <div class="modes">
      <button @click="changeMode('list')" :class="{ active: displayMode==='list' }">Lista</button>
      <button @click="changeMode('table')" :class="{ active: displayMode==='table' }">Tabela</button>
      <button @click="changeMode('resize')" :class="{ active: displayMode==='resize' }">Preview</button>
    </div>

    <!-- Visualização -->
    <div v-if="displayMode === 'list'">
      <ListDemo
        :items="filteredPhotos"
        item-key="id"
        @click-item="openModal"
      />
    </div>

    <div v-if="displayMode === 'table'">
      <TableDemo
        :rows="filteredPhotos"
        :columns="tableColumns"
        @click-row="openModal"
      />
    </div>

    <div v-if="displayMode === 'resize'" class="gallery">
      <div
        v-for="photo in filteredPhotos"
        :key="photo.id"
        class="photo-thumb"
        @click="openModal(photo)"
      >
        <img :src="photo.download_url" :alt="photo.author" />
        <span class="author">{{ photo.author }}</span>
      </div>
    </div>

    <!-- Modal de preview -->
    <DsModal v-if="showModal" @close="showModal=false">
      <ResizeBoxDemo :photo="modalPhoto" />
    </DsModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DsModal from '../../components/ui/DsModal.vue'
import ResizeBoxDemo from './ResizeBoxDemo.vue'
import SelectorDemo from './SelectorDemo.vue'
import TableDemo from './TableDemo.vue'
import ListDemo from './ListDemo.vue'

// --- Interfaces ---
interface Photo {
  id: string
  author: string
  width: number
  height: number
  url: string
  download_url: string
}

// --- Estados ---
const photoList = ref<Photo[]>([])
const selectedAuthor = ref<string | null>(null)
const authors = ref<string[]>([])

const displayMode = ref<'list' | 'table' | 'resize'>('list')

// Modal
const showModal = ref(false)
const modalPhoto = ref<Photo | null>(null)

// --- Tabela ---
const tableColumns = [
  { label: 'ID', key: 'id' },
  { label: 'Autor', key: 'author' },
  { label: 'Largura', key: 'width' },
  { label: 'Altura', key: 'height' },
]

// --- Funções ---
async function fetchPhotos() {
  try {
    const res = await fetch('https://picsum.photos/v2/list?page=1&limit=20')
    const data: Photo[] = await res.json()
    photoList.value = data
    authors.value = Array.from(new Set(data.map(p => p.author)))
  } catch (err) {
    console.error('Erro ao buscar fotos:', err)
  }
}

const filteredPhotos = computed(() =>
  selectedAuthor.value
    ? photoList.value.filter(p => p.author === selectedAuthor.value)
    : photoList.value
)

function changeMode(mode: 'list' | 'table' | 'resize') {
  displayMode.value = mode
}

function openModal(photo: Photo) {
  modalPhoto.value = photo
  showModal.value = true
}

// --- Lifecycle ---
onMounted(fetchPhotos)
</script>

<style scoped>
.photo-gallery {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modes {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.modes button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.modes button.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

/* Galeria */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.photo-thumb {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.photo-thumb img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.photo-thumb:hover img {
  transform: scale(1.05);
}

.author {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  font-size: 0.75rem;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
}
</style>
