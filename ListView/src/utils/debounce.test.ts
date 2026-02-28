import { describe, it, expect, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  it('calls the function once after delay', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()

    const debounced = debounce(fn, 200)
    debounced('a')
    debounced('b')
    debounced('c')

    // not called immediately
    expect(fn).toHaveBeenCalledTimes(0)

    // advance time
    vi.advanceTimersByTime(199)
    expect(fn).toHaveBeenCalledTimes(0)

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')

    vi.useRealTimers()
  })
})