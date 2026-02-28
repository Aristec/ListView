<template>
  <div class="list" v-if="items.length">
    <div class="header">
      <div>Name</div>
      <div>ID</div>
      <div>Country</div>
    </div>

    <div v-for="loc in items" :key="loc.id" class="row">
      <div class="cell">
        {{ loc.name_en ?? loc.name ?? '—' }}
      </div>

      <div class="cell mono">
        {{ loc.id }}
      </div>

      <div class="cell">
        {{ countryLabel(loc) }}
      </div>
    </div>
  </div>

  <p v-else class="muted">No localities found.</p>
</template>

<script setup lang="ts">
import type { Country, Locality } from '../api/types'

defineProps<{
  items: Locality[]
}>()

function countryLabel(loc: Locality) {
  const c = loc.country
  if (!c) return '—'
  if (typeof c === 'number') return `#${c}` // if not expanded
  const country = c as Country
  return country.name_en ?? country.name ?? '—'
}
</script>