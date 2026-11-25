/** Category colours shared by the 3D skills constellation and its DOM legend (no three.js here). */
const EXTRA = ['#a78bfa', '#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#fb923c', '#e879f9', '#2dd4bf']

export function categoryColors(count: number, accent: string, accent2: string): string[] {
  const base = [accent, accent2, ...EXTRA]
  return Array.from({ length: count }, (_, i) => base[i % base.length])
}
