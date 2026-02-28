import { apiGet } from './client'
import type { Locality, PaginatedResponse } from './types'

export interface GetLocalitiesParams {
  limit?: number
  offset?: number
  search?: string
  expandCountry?: boolean
}

export function getLocalities(params: GetLocalitiesParams = {}) {
  const { limit = 25, offset = 0, search, expandCountry = true } = params

  return apiGet<PaginatedResponse<Locality>>('/localities/', {
    limit,
    offset,
    // NEW: server-side search parameter from assignment
    name__icontains: search?.trim() || undefined,
    // NEW: expand country object from assignment
    expand: expandCountry ? 'country' : undefined,
  })
}

export function getLocality(id: number, expandCountry = true) {
  return apiGet<Locality>(`/localities/${id}/`, {
    expand: expandCountry ? 'country' : undefined,
  })
}