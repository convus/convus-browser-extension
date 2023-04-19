# Convus Browser extension

Browser extension to add ratings to [convus.org](https://www.convus.org)

### Extension description

Convus.org lets you rate the websites you read so you can track articles that are useful, informative and high quality.

This browser extension makes the process of submitting ratings easy.

Use `control` + `shift` + `R` to open the rating dialog.

### Single purpose description

Submit a rating of the website you are reading to Convus.org

### activeTab justification

Required to get the url and title of the website you are reading, for your rating.

### storage justification

Required to store a key to authenticate your rating.

---

## Development

There are configuration options in [esbuild.config.js](esbuild.config.js) (for example - specify whether you're building for Firefox or Chrome)

In your terminal, run:

    ./start

To build and watch - which will build using the configuration options `esbuild.config.js`

To build the publishable version, use `NODE_ENV=production yarn build` - which will build with `https://www.convus.org` as the source.

Create a zip of the built extension for submission with:

    ./makezip

Lint with `yarn lint`

Lint HTML with `htmlbeautifier src/index.html`

_NOTE: 👆 isn't great - it requires Ruby and [htmlbeautifier](https://github.com/threedaymonk/htmlbeautifier/), which isn't actually bundled/packaged here_

