const path = require('path')
const fs = require('fs')

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
const htmlContent = fs.readFileSync('src/index.html', 'utf8')
fs.writeFileSync('dist/index.html', replaceEnvValues(htmlContent))
// manifest
const manifestContent = fs.readFileSync('src/manifest_v3.json', 'utf8')
fs.writeFileSync('dist/manifest.json', replaceEnvValues(manifestContent))

// esbuild, go to town
const errorFilePath = 'esbuild_error'
const watchOptions = {
  onRebuild (error, result) {
    if (error) {
      console.error('watch build failed:', error)
      fs.writeFileSync(errorFilePath, error.toString())
    } else if (fs.existsSync(errorFilePath)) {
      console.log(`${target} - watch build succeeded:`, result)
      fs.truncate(errorFilePath, 0, () => {})
    }
  }
}

require('esbuild')
  .build({
    define: {
      'process.env.baseUrl': `"${baseUrl}"`,
      'process.env.browser_target': `"${target}"`,
      'process.env.version': `"${version}"`,
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
    },
    entryPoints: ['popup.js'],
    bundle: true,
    sourcemap: true,
    outdir: path.join(process.cwd(), 'dist'),
    absWorkingDir: path.join(process.cwd(), 'src'),
    watch: watch && watchOptions,
    plugins: []
  })
  .then((result) => console.log(`${target} - esbuild updated:`, result))
