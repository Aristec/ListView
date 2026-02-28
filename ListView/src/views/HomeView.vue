<template>
  <main class="container">
    <h1>Geological Localities</h1>

    <label>
      Search by name:
      <input v-model="search" placeholder="Type a name…" />
    </label>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error">{{ error }}</p>
    <LocalityList v-else :items="items" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import LocalityList from '../components/LocalityList.vue'
import { getLocalities } from '../api/localities'
import type { Locality } from '../api/types'
import { debounce } from '../utils/debounce'

const items = ref<Locality[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')

let requestId = 0

async function load(query: string) {
  const myId = ++requestId
  loading.value = true
  error.value = null

  try {
    const data = await getLocalities({
      limit: 25,
      offset: 0,
      search: query,
      expandCountry: true,
    })

    if (myId !== requestId) return

    const q = query.toLowerCase()

    items.value = data.results.filter(loc => {
      if (!q) return true

      const name = loc.name?.toLowerCase() ?? ''
      const nameEn = loc.name_en?.toLowerCase() ?? ''

      return name.includes(q) || nameEn.includes(q)
    })

  } catch (e) {
    if (myId !== requestId) return
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    if (myId === requestId) loading.value = false
  }
}

const loadDebounced = debounce((q: string) => {
  load(q)
}, 350)

onMounted(() => {
  load('')
})

watch(search, (newValue) => {
  const q = newValue.trim()
  if (q.length > 0 && q.length < 2) return
  loadDebounced(q)
})
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>