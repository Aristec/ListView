<template>
  <div>
    <h2>API Test Page</h2>

    <p v-if="loading">Loading...</p>
    <p v-else-if="error" style="color: red">{{ error }}</p>

    <pre v-else>{{ formatted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { getLocalities } from '../api/localities'

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<unknown>(null)

const formatted = computed(() =>
  JSON.stringify(data.value, null, 2)
)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getLocalities({
      limit: 5,
      offset: 0,
      expandCountry: true
    })
    data.value = response
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})
</script>