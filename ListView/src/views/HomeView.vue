<template>
  <main class="container">
    <header class="top">
      <h1>Geological Locations</h1>
      <p class="sub">A list of geological locations.</p>
    </header>

    <section class="panel">
      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <LocalityList v-else :items="items" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LocalityList from '../components/LocalityList.vue'
import { getLocalities } from '../api/localities'
import type { Locality } from '../api/types'

const items = ref<Locality[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await getLocalities({
      limit: 25,
      offset: 0,
      expandCountry: true,
    })
    items.value = data.results
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>