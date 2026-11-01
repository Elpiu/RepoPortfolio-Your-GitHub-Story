<script setup lang="ts">
const props = defineProps<{
  section: string
}>()

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

const homePath = computed(() => localePath('/'))
const href = computed(
  () => router.resolve({ path: homePath.value, hash: `#${props.section}` }).href,
)

// Sulla home scorre alla sezione sul posto (anche se è già nell'URL);
// altrove naviga alla home con l'hash e lo scroll lo fa il router.
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  emit('navigate')

  if (route.path.replace(/\/$/, '') === homePath.value.replace(/\/$/, '')) {
    scrollToSectionInPlace(router, route, props.section)
  } else {
    void router.push({ path: homePath.value, hash: `#${props.section}` })
  }
}
</script>

<template>
  <a :href="href" @click="onClick"><slot /></a>
</template>
