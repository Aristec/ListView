export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs = 300
) {
  let timer: number | undefined

  return (...args: TArgs) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delayMs)
  }
}