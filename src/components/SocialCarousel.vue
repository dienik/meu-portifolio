<script setup lang="ts">
type Social = {
  name: string
  icon: string
  url: string
}

const socials: Social[] = [
  {
    name: 'LinkedIn',
    icon: 'in',
    url: 'https://www.linkedin.com/in/dieni-kielermann-da-silva-abb06120a/',
  },
  {
    name: 'GitHub',
    icon: 'gh',
    url: 'https://github.com/dienik/dienik',
  },
]
</script>

<template>
  <div class="carousel">
    <a
      v-for="item in socials"
      :key="item.name"
      :href="item.url"
      target="_blank"
      rel="noreferrer"
      class="card"
    >
      <span class="icon">{{ item.icon }}</span>
      <span>{{ item.name }}</span>
    </a>
  </div>
</template>

<style scoped>
.carousel {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 1.6rem 0 0;
}

.card {
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
  color: var(--ds-text);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ds-shadow-glow);
}

.icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ds-primary-soft);
  color: var(--ds-primary);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
</style>
