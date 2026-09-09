import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Resvg } = require('@resvg/resvg-js')
const { default: pngToIco } = await import('png-to-ico')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'images', 'favicon')
mkdirSync(outDir, { recursive: true })

const mark = `M21.8621 0C33.5553 0 44 9.4959 44 21.2097C44 29.661 39.9808 38.1356 21.931 50V42.2812C34.6207 29.2373 34.6207 26.1072 34.6207 19.6207C34.6207 13.1342 28.4061 7.87591 21.931 7.87591C15.456 7.87591 9.51724 13.1342 9.51724 19.6207C9.51724 26.061 15.3816 32.1379 21.7931 32.212V42.4188C10.1316 42.3816 0 32.9005 0 21.2097C0 9.4959 10.1689 0 21.8621 0Z`

function svgTransparent(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">
  <g transform="translate(10.88 8) scale(0.96)">
    <path d="${mark}" fill="#616AFF"/>
  </g>
</svg>`
}

function svgApple(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#FFFFFF"/>
  <g transform="translate(10.88 8) scale(0.96)">
    <path d="${mark}" fill="#616AFF"/>
  </g>
</svg>`
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

const pngs = {
  'favicon-16x16.png': renderPng(svgTransparent(16), 16),
  'favicon-32x32.png': renderPng(svgTransparent(32), 32),
  'favicon-48x48.png': renderPng(svgTransparent(48), 48),
  'android-chrome-192x192.png': renderPng(svgTransparent(192), 192),
  'android-chrome-512x512.png': renderPng(svgTransparent(512), 512),
  'apple-touch-icon.png': renderPng(svgApple(180), 180),
}

for (const [name, buf] of Object.entries(pngs)) {
  writeFileSync(join(outDir, name), buf)
  console.log('wrote', name, buf.length)
}

const ico = await pngToIco([
  join(outDir, 'favicon-16x16.png'),
  join(outDir, 'favicon-32x32.png'),
  join(outDir, 'favicon-48x48.png'),
])
writeFileSync(join(outDir, 'favicon.ico'), ico)
copyFileSync(join(outDir, 'favicon.ico'), join(root, 'public', 'favicon.ico'))
console.log('wrote favicon.ico')
