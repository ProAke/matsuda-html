// Run from a network that can reach the original website. Manifest changes only after all downloads succeed.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
const file = new URL('../data/assets.json', import.meta.url)
const manifest = JSON.parse(await readFile(file, 'utf8'))
const root = new URL('../public/images/', import.meta.url)
await mkdir(root, { recursive: true })
async function download(value) {
 if (typeof value === 'string' && value.startsWith('https://hi.matsuda-sangyothailand.com/')) {
  const url = new URL(value)
  const name = url.pathname.slice(1).replaceAll('/', '--')
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Invalid image: ${value} (${response.status})`)
  await writeFile(new URL(name, root), Buffer.from(await response.arrayBuffer()))
  console.log(`Saved ${name}`)
  return `/images/${name}`
 }
 if (Array.isArray(value)) return Promise.all(value.map(download))
 if (value && typeof value === 'object') return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, v]) => [key, await download(v)])))
 return value
}
try {
 const updated = await download(manifest)
 await writeFile(file, JSON.stringify(updated, null, 2) + '\n')
} catch (error) { console.error(error.message); process.exitCode = 1 }
