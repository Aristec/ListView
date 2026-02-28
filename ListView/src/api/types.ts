export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Country {
  id: number
  name?: string | null
  name_en?: string | null
  [key: string]: unknown
}

export interface Locality {
  id: number
  name?: string | null
  name_en?: string | null
  country?: number | Country | null
  [key: string]: unknown
}