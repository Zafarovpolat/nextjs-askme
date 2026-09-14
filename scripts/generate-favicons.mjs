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

/** Знак 44×50: вписываем по высоте в 64×64, горизонтальный зазор только из пропорций глифа. */
const MARK_W = 44
const MARK_H = 50
const VB = 64
const markScale = VB / MARK_H
const markTx = (VB - MARK_W * markScale) / 2
const markTransform = `translate(${markTx} 0) scale(${markScale})`

function svgTransparent(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${VB} ${VB}" fill="none">
  <g transform="${markTransform}">
    <path d="${mark}" fill="#616AFF"/>
  </g>
</svg>`
}

function svgApple(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${VB} ${VB}" fill="none">
  <rect width="${VB}" height="${VB}" rx="14" fill="#FFFFFF"/>
  <g transform="${markTransform}">
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
writeFileSync(join(outDir, 'favicon.svg'), svgTransparent(64))
copyFileSync(join(outDir, 'favicon.ico'), join(root, 'public', 'favicon.ico'))
copyFileSync(join(outDir, 'apple-touch-icon.png'), join(root, 'public', 'apple-touch-icon.png'))
console.log('wrote favicon.ico')
console.log('wrote favicon.svg')
console.log('wrote /apple-touch-icon.png')
