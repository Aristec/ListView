<template>
  <main class="mx-auto max-w-5xl px-4 py-8 space-y-6">
    <h1 class="text-2xl font-semibold">Geological Localities</h1>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        
      <label class="block space-y-1">
        <span class="text-sm text-gray-600">Search by name</span>
        <input
          v-model="search"
          placeholder="Type a name…"
          class="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm text-gray-600">Per page</span>
        <select
          v-model.number="limit"
          class="w-36 rounded-md border border-gray-300 px-3 py-2 bg-white"
          @change="setPageSize"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </label>
    </div>

    <div v-if="!loading && !error && totalCount > 0" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-gray-600">
        Page {{ currentPage }} / {{ totalPages }} • Total: {{ totalCount }}
      </p>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          :disabled="!canPrev"
          @click="goPrev"
        >
          Previous
        </button>

        <button
          type="button"
          class="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          :disabled="!canNext"
          @click="goNext"
        >
          Next
        </button>

        <div class="flex items-center gap-2 ml-0 sm:ml-3">
          <span class="text-sm text-gray-600">Go to page</span>
          <input
            v-model="pageInput"
            inputmode="numeric"
            class="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
            @keydown.enter.prevent="goToPage"
            @blur="goToPage"
          />
        </div>
      </div>
    </div>

    <p v-if="loading" class="text-gray-600">Loading…</p>
    <p v-else-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</p>
    <LocalityList v-else :items="items" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import LocalityList from '../components/LocalityList.vue'
import { getLocalities } from '../api/localities'
import type { Locality } from '../api/types'
import { debounce } from '../utils/debounce'

const items = ref<Locality[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const limit = ref(25)
const offset = ref(0)
const totalCount = ref(0)
const pageInput = ref('1')

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)))

const canPrev = computed(() => offset.value > 0)
const canNext = computed(() => offset.value + limit.value < totalCount.value)

let requestId = 0

function syncPageInput() {
  pageInput.value = String(currentPage.value)
}

async function load(query: string) {
  const myId = ++requestId
  loading.value = true
  error.value = null

  try {
    const data = await getLocalities({
      limit: limit.value,
      offset: offset.value,
      search: query,
      expandCountry: true,
    })

    if (myId !== requestId) return

    totalCount.value = data.count
    syncPageInput()

    const q = query.trim().toLowerCase()
    items.value = data.results.filter((loc) => {
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

function goPrev() {
  if (!canPrev.value) return
  offset.value = Math.max(0, offset.value - limit.value)
  load(search.value.trim())
}

function goNext() {
  if (!canNext.value) return
  offset.value = offset.value + limit.value
  load(search.value.trim())
}

function setPageSize() {
  offset.value = 0
  load(search.value.trim())
}

function goToPage() {
  const raw = pageInput.value.trim()
  const num = Number(raw)

  if (!Number.isFinite(num)) {
    syncPageInput()
    return
  }

  const clamped = Math.min(Math.max(1, Math.floor(num)), totalPages.value)
  pageInput.value = String(clamped)

  offset.value = (clamped - 1) * limit.value
  load(search.value.trim())
}

onMounted(() => {
  load('')
})

watch(search, (newValue) => {
  const q = newValue.trim()
  if (q.length > 0 && q.length < 2) return
  offset.value = 0
  loadDebounced(q)
})

watch(currentPage, () => {
  syncPageInput()
})
</script>