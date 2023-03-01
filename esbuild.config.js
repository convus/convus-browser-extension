const path = require('path')
const fs = require('fs')

const watch = process.argv.includes('--watch')
const errorFilePath = 'esbuild_error'

// In the future, there will be more differences for development vs production
// ... and it might not be exclusively determined by watch
const development = watch
const baseUrl = development ? "http://localhost:3009/" : "https://www.convus.org"
// Generate relevant index.html file via this garbage
let htmlContent = fs.readFileSync('src/index.html', 'utf8').replace(/{{baseUrl}}/g, baseUrl)
fs.writeFileSync('popup/index.html', htmlContent.replace());

// esbuild, go to town
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
    entryPoints: ['popup.js'],
    bundle: true,
    sourcemap: true,
    outdir: path.join(process.cwd(), 'popup'),
    absWorkingDir: path.join(process.cwd(), 'src'),
    watch: watch && watchOptions,
    // custom plugins will be inserted is this array
    plugins: []
  })
  .then((result) => console.log('esbuild updated:', result))
