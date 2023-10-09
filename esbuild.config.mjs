import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, truncate } from 'fs'
import * as esbuild from 'esbuild'

const watch = process.argv.includes('--watch') || process.env.WATCH === 'true'

// Current options: chrome, firefox, safari, safari_ios
const target = 'chrome'

process.env.NODE_ENV ||= 'production'
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.convus.org' : 'http://localhost:3009'
const version = process.env.npm_package_version

const replaceEnvValues = (str) => {
  return str.replace(/{{baseUrl}}/g, baseUrl)
    .replace(/{{target}}/g, target)
    .replace(/{{version}}/g, version)
}

// HACK HACK HACK! building things by doing substitution
// TODO: make this a better process
const htmlContent = readFileSync('src/index.html', 'utf8')
writeFileSync('dist/index.html', replaceEnvValues(htmlContent))
// manifest
const manifestContent = readFileSync('src/manifest_v3.json', 'utf8')
writeFileSync('dist/manifest.json', replaceEnvValues(manifestContent))

// esbuild, go to town
const errorFilePath = 'esbuild_error'
const watchOptions = {
  onRebuild (error, result) {
    if (error) {
      console.error('watch build failed:', error)
      writeFileSync(errorFilePath, error.toString())
    } else if (existsSync(errorFilePath)) {
      console.log(`${target} - watch build succeeded:`, result)
      truncate(errorFilePath, 0, () => { })
    }
  }
}

esbuild.build({
  define: {
    'process.env.baseUrl': `"${baseUrl}"`,
    'process.env.browser_target': `"${target}"`,
    'process.env.version': `"${version}"`,
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
  },
  entryPoints: ['popup.js'],
  bundle: true,
  sourcemap: true,
  outdir: join(process.cwd(), 'dist'),
  absWorkingDir: join(process.cwd(), 'src'),
  watch: watch && watchOptions,
  plugins: []
})
  .then((result) => console.log(`${target} - esbuild updated:`, result))
