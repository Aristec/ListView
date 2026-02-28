<template>
  <main class="mx-auto max-w-5xl px-4 py-10 space-y-6">
    <!-- Header -->
    <header class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-tight">
          {{ locality?.name_en ?? locality?.name ?? 'Locality' }}
        </h1>
        <p class="text-sm text-gray-600">
          ID: <span class="font-mono text-gray-900">{{ id }}</span>
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
               hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        @click="goBack"
      >
        ← Back
      </button>
    </header>

    <!-- States -->
    <p v-if="loading" class="text-sm text-gray-600">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-700 whitespace-pre-wrap">{{ error }}</p>

    <div v-else-if="locality" class="space-y-6">
      <!-- Details card -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <h2 class="font-semibold">Details</h2>

          <span
            v-if="countryLabel !== '—'"
            class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {{ countryLabel }}
          </span>
        </div>

        <dl class="divide-y divide-gray-200">
          <Row label="Name" :value="asText(locality.name)" />
          <Row label="Name (EN)" :value="asText(locality.name_en)" />
          <Row label="Country" :value="countryLabel" />
          <Row label="Number" :value="asText(locality.number)" />
          <Row label="Code" :value="asText(locality.code)" />

          <Row label="Elevation" :value="asText(locality.elevation)" />
          <Row label="Depth" :value="typeof locality.depth === 'number' ? `${locality.depth} m` : null" />

          <Row label="Coordinates" :value="hasCoords ? `${locality.latitude}, ${locality.longitude}` : null" />

          <Row label="Remarks location" :value="asText(locality.remarks_location)" />
          <Row label="Remarks" :value="asText(locality.remarks)" />

          <Row label="Date added" :value="formatDate(locality.date_added)" />
          <Row label="Date changed" :value="formatDate(locality.date_changed)" />
        </dl>
      </section>

      <!-- Map -->
    <section v-if="hasCoords" class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
        <h2 class="font-semibold">Map</h2>

        <a
        v-if="googleMapsUrl"
        :href="googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
        Open in Google Maps ↗
        </a>
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

      <!-- No coords hint -->
      <div
        v-else
        class="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600"
      >
        No coordinates available for this locality, so the map is hidden.
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Locality, Country } from '../api/types'
import { getLocality } from '../api/localities'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
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

/** Table row component */
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
        h('dd', { class: 'col-span-2 whitespace-pre-wrap text-gray-900' }, props.value ?? '—'),
      ])
  },
})

const route = useRoute()
const router = useRouter()

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

const googleMapsUrl = computed(() => {
  if (!hasCoords.value) return null
  const lat = locality.value!.latitude
  const lng = locality.value!.longitude
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
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

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

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