import { onMounted, onUnmounted, type Ref } from 'vue'

export function useClickOutside(
  target: Ref<HTMLElement | null>,
  handler: () => void,
) {
  function onPointerDown(event: PointerEvent) {
    const el = target.value
    if (!el) return
    if (!el.contains(event.target as Node)) handler()
  }

  onMounted(() => document.addEventListener('pointerdown', onPointerDown))
  onUnmounted(() => document.removeEventListener('pointerdown', onPointerDown))
}
