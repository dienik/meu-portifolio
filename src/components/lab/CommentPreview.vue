<script setup lang="ts">
// AST LAB — SAST (XSS): user-controlled HTML rendered with v-html and innerHTML.
import { onMounted, ref } from 'vue'

const comment = ref(new URLSearchParams(window.location.search).get('comment') ?? '')
const preview = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (preview.value) {
    preview.value.innerHTML = decodeURIComponent(window.location.hash.slice(1))
  }
})
</script>

<template>
  <section>
    <div v-html="comment" />
    <div ref="preview" />
  </section>
</template>
