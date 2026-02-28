<template>
  <main class="mx-auto max-w-5xl px-4 py-10 space-y-6">
    <header class="space-y-1">
      <h1 class="text-3xl font-semibold tracking-tight">Geological Localities</h1>
      <p class="text-sm text-gray-600">
        Browse geological localities from the public Geoloogia API.
      </p>
    </header>

    <!-- Controls Card -->
    <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="p-4 sm:p-5 space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <!-- Search -->
          <label class="block w-full max-w-lg space-y-1">
            <span class="text-sm font-medium text-gray-700">Search</span>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                🔎
              </span>
              <input
                v-model="search"
                placeholder="Search by name…"
                class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </label>

          <!-- Per page -->
          <label class="block space-y-1">
            <span class="text-sm font-medium text-gray-700">Per page</span>
            <select
              v-model.number="limit"
              class="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              @change="setPageSize"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
        </div>

        <!-- Pagination bar -->
        <div
          v-if="!loading && !error && totalCount > 0"
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-gray-50 px-3 py-2"
        >
          <p class="text-sm text-gray-600">
            Page <span class="font-medium text-gray-900">{{ currentPage }}</span>
            <span class="text-gray-400">/</span>
            <span class="font-medium text-gray-900">{{ totalPages }}</span>
            <span class="text-gray-400">•</span>
            Total: <span class="font-medium text-gray-900">{{ totalCount }}</span>
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm
                     hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
              :disabled="!canPrev"
              @click="goPrev"
            >
              ← Previous
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm
                     hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
              :disabled="!canNext"
              @click="goNext"
            >
              Next →
            </button>

            <div class="flex items-center gap-2 sm:ml-3">
              <span class="text-sm text-gray-600">Go to</span>
              <input
                v-model="pageInput"
                inputmode="numeric"
                class="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                @keydown.enter.prevent="goToPage"
                @blur="goToPage"
              />
            </div>
          </div>
        </div>

        <p v-if="loading" class="text-sm text-gray-600">Loading…</p>
        <p v-else-if="error" class="text-sm text-red-700 whitespace-pre-wrap">{{ error }}</p>
      </div>
    </section>

    <!-- List -->
    <section class="space-y-3">
      <LocalityList v-if="!loading && !error" :items="items" />
    </section>
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