<template>
  <div>
    <div v-if="items.length" class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="hidden md:grid grid-cols-4 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 bg-gray-50 border-b border-gray-200">
        <div>Name</div>
        <div>ID</div>
        <div>Country</div>
        <div class="text-right">Actions</div>
      </div>

      <!-- Rows -->
      <div
        v-for="loc in items"
        :key="loc.id"
        class="px-4 py-3 md:grid md:grid-cols-4 md:gap-4 items-center border-b border-gray-100 last:border-b-0
               hover:bg-gray-50 transition"
      >
        <div class="font-medium text-gray-900">
          {{ loc.name_en ?? loc.name ?? '—' }}
        </div>

        <div class="text-sm text-gray-600 font-mono">
          {{ loc.id }}
        </div>

        <div class="text-sm text-gray-700">
          {{ countryLabel(loc) }}
        </div>

        <div class="mt-2 md:mt-0 md:text-right">
          <RouterLink
            :to="`/localities/${loc.id}`"
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white shadow-sm
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Details
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
      No localities found.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Locality, Country } from '../api/types'

defineProps<{ items: Locality[] }>()

function countryLabel(loc: Locality) {
  const c = loc.country
  if (!c) return '—'
  if (typeof c === 'number') return `#${c}`
  const country = c as Country
  return country.name_en ?? country.name ?? '—'
}
</script>