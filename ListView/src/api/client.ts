export class ApiError extends Error {
  status: number
  url: string

  constructor(message: string, status: number, url: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.url = url
  }
}

const BASE_URL = 'https://rwapi.geoloogia.info/api/v1/public'

type QueryValue = string | number | boolean | null | undefined

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  init?: RequestInit
): Promise<T> {
  const url = buildUrl(path, query)

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      ...init,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    throw new ApiError(msg, 0, url)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const message = text ? `Request failed (${res.status}): ${text}` : `Request failed (${res.status})`
    throw new ApiError(message, res.status, url)
  }

  return (await res.json()) as T
}