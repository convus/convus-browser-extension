const path = require('path')
const fs = require('fs')

const watch = process.argv.includes('--watch')

const target = 'chrome'

// NOTE: index.html and manifest.json are generated via this script
// THEY DO NOT UPDATE ON SAVE when watching (the JS does)
process.env.NODE_ENV ||= 'development'
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.convus.org' : 'http://localhost:3009'
const version = process.env.npm_package_version
// Generate relevant index.html file via this hack
const htmlContent = fs.readFileSync('src/index.html', 'utf8')
  .replace(/{{baseUrl}}/g, baseUrl)
  .replace(/{{target}}/g, target)
fs.writeFileSync('dist/index.html', htmlContent)
// Generate manifest for the current env
const manifestContent = fs.readFileSync(`src/${target}_manifest.json`, 'utf8')
  .replace(/{{baseUrl}}/g, baseUrl) // Not using host permissions, so this doesn't update anything now...
  .replace(/{{version}}/g, version)
fs.writeFileSync('dist/manifest.json', manifestContent)

// esbuild, go to town
const errorFilePath = 'esbuild_error'
const watchOptions = {
  onRebuild (error, result) {
    if (error) {
      console.error('watch build failed:', error)
      fs.writeFileSync(errorFilePath, error.toString())
    } else if (fs.existsSync(errorFilePath)) {
      console.log('watch build succeeded:', result)
      fs.truncate(errorFilePath, 0, () => {})
    }
  }
}

require('esbuild')
  .build({
    define: { 'process.env.NODE_ENV': `"${process.env.NODE_ENV}"` },
    entryPoints: ['popup.js'],
    bundle: true,
    sourcemap: true,
    outfile: path.join(process.cwd(), 'dist', 'popup.js'),
    absWorkingDir: path.join(process.cwd(), 'src'),
    watch: watch && watchOptions,
    plugins: []
  })
  .then((result) => console.log('esbuild updated:', result))
