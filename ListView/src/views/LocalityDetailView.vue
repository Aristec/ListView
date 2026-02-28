<template>
  <main class="mx-auto max-w-5xl px-4 py-8 space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ locality?.name_en ?? locality?.name ?? 'Locality' }}
        </h1>
        <p class="text-sm text-gray-600">ID: {{ id }}</p>
      </div>

      <RouterLink to="/" class="text-sm underline">Back</RouterLink>
    </div>

    <p v-if="loading" class="text-gray-600">Loading…</p>
    <p v-else-if="error" class="text-red-700 whitespace-pre-wrap">{{ error }}</p>

    <div v-else-if="locality" class="space-y-6">
      <!-- Key facts table -->
      <section class="rounded-md border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold">Details</h2>
        </div>

        <dl class="divide-y divide-gray-200">
          <Row label="Name" :value="locality.name" />
          <Row label="Name (EN)" :value="locality.name_en" />
          <Row label="Country" :value="countryLabel" />
          <Row label="Number" :value="asText(locality.number)" />
          <Row label="Code" :value="asText(locality.code)" />

          <Row
            label="Elevation"
            :value="locality.elevation ? `${locality.elevation}` : null"
          />
          <Row
            label="Depth"
            :value="typeof locality.depth === 'number' ? `${locality.depth} m` : null"
          />

          <Row
            label="Coordinates"
            :value="hasCoords ? `${locality.latitude}, ${locality.longitude}` : null"
          />

          <Row label="Remarks location" :value="asText(locality.remarks_location)" />
          <Row label="Remarks" :value="asText(locality.remarks)" />

          <Row label="Date added" :value="formatDate(locality.date_added)" />
          <Row label="Date changed" :value="formatDate(locality.date_changed)" />
        </dl>
      </section>

      <!-- Map -->
      <section v-if="hasCoords" class="rounded-md border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold">Map</h2>
        </div>

        <div class="h-[360px]">
          <LMap :zoom="zoom" :center="center" class="h-full w-full">
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LMarker :lat-lng="center" />
          </LMap>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Locality, Country } from '../api/types'
import { getLocality } from '../api/localities'

// vue-leaflet
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'

// Leaflet marker icon fix for Vite
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

/** Simple row renderer for the table */
const Row = defineComponent({
  name: 'Row',
  props: {
    label: { type: String, required: true },
    value: { type: String, default: null },
  },
  setup(props) {
    return () =>
      h('div', { class: 'grid grid-cols-3 gap-4 px-4 py-3 text-sm' }, [
        h('dt', { class: 'text-gray-600' }, props.label),
        h('dd', { class: 'col-span-2 whitespace-pre-wrap' }, props.value ?? '—'),
      ])
  },
})

const route = useRoute()
const id = computed(() => Number(route.params.id))

const locality = ref<Locality | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

let requestId = 0

const hasCoords = computed(() => {
  const lat = locality.value?.latitude
  const lng = locality.value?.longitude
  return typeof lat === 'number' && typeof lng === 'number'
})

const center = computed<[number, number]>(() => {
  const lat = locality.value?.latitude ?? 0
  const lng = locality.value?.longitude ?? 0
  return [lat, lng]
})

const zoom = 11

const countryLabel = computed(() => {
  const c = locality.value?.country
  if (!c) return '—'
  if (typeof c === 'number') return `#${c}`
  const country = c as Country
  return country.name_en ?? country.name ?? '—'
})

async function load() {
  const myId = ++requestId
  loading.value = true
  error.value = null
  locality.value = null

  try {
    const data = await getLocality(id.value, true)
    if (myId !== requestId) return
    locality.value = data
  } catch (e) {
    if (myId !== requestId) return
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    if (myId === requestId) loading.value = false
  }
}

onMounted(load)
watch(id, load)

function asText(v: unknown) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s ? s : null
}

function formatDate(v: unknown) {
  if (!v) return null
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleDateString()
}
</script>