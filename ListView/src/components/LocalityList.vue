<template>
  <div>
    <!-- Desktop Header -->
    <div
      v-if="items.length"
      class="hidden md:grid grid-cols-4 gap-4 px-4 py-3 text-sm font-semibold bg-gray-100 border border-gray-200 rounded-t-lg"
    >
      <div>Name</div>
      <div>ID</div>
      <div>Country</div>
      <div class="text-right">Actions</div>
    </div>

    <!-- Rows -->
    <div
      v-for="loc in items"
      :key="loc.id"
      class="border border-gray-200 md:border-t-0 md:rounded-none rounded-lg md:rounded-b-none px-4 py-3 md:grid md:grid-cols-4 md:gap-4 items-center"
    >
      <div class="font-medium">
        {{ loc.name_en ?? loc.name ?? '—' }}
      </div>

      <div class="text-sm text-gray-600 font-mono">
        {{ loc.id }}
      </div>
      
      <div class="text-sm">
        {{ countryLabel(loc) }}
      </div>

      <div class="mt-2 md:mt-0 md:text-right">
        <RouterLink
          :to="`/localities/${loc.id}`"
          class="inline-block rounded-md border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Details
        </RouterLink>
      </div>
    </div>

    <p v-if="!items.length" class="text-gray-500 mt-4">
      No localities found.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Locality, Country } from '../api/types'

defineProps<{
  items: Locality[]
}>()

function countryLabel(loc: Locality) {
  const c = loc.country
  if (!c) return '—'
  if (typeof c === 'number') return `#${c}`
  const country = c as Country
  return country.name_en ?? country.name ?? '—'
}
</script>