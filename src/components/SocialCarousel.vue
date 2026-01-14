<script setup lang="ts">
type Social = {
  name: string
  icon: string
  url: string
}

const socials: Social[] = [
  {
    name: 'LinkedIn',
    icon: '💼',
    url: 'https://www.linkedin.com/in/dieni-kielermann-da-silva-abb06120a/'
  },
  {
    name: 'GitHub',
    icon: '💻',
    url: 'https://github.com/dienik/dienik'
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
  justify-content: center;
  gap: 2rem;
  overflow-x: auto;
  padding: 2rem 0;
}

.card {
  min-width: 180px;
  height: 200px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  color: #e0e7ff;
  text-decoration: none;
  transition: 0.4s;
  box-shadow: 0 0 20px rgba(59,130,246,0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.card:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 0 50px rgba(139,92,246,0.8);
}

.icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(167,139,250,0.9));
}
</style>
