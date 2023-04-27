# Convus Browser extension

Browser extension to add ratings to [convus.org](https://www.convus.org)

### Extension description

Convus.org lets you rate the websites you read so you can track articles that are useful, informative and high quality.

This browser extension makes the process of submitting ratings easy.

Use `control` + `shift` + `R` to open the rating dialog.

#### Single purpose description

Submit a rating of the website you are reading to Convus.org

#### activeTab justification

Required to get the url and title of the website you are reading, for your rating.

#### scripting justification

Required to read the API token on Convus.org and to get the metadata from the page to send with the rating.

#### storage justification

Required to store a key to authenticate your rating.

## Building for distribution

This extension uses [yarn](https://yarnpkg.com/) for package management. Install the dependencies with `yarn install`

There are configuration options in [esbuild.config.js](esbuild.config.js) (for example - specify whether you're building for Firefox, Chrome or Safari)

Build the extension and create a zip file for submission with:

```sh
./makezip.sh
```

This runs `NODE_ENV=production yarn build` - which builds the extension with `https://www.convus.org` as the source (rather than localhost).

The created zipped file is submitted for Chrome and Firefox. Safari requires XCode.

## Development

Build the extension for development with `yarn build`

To run the build process with watch, run:

```sh
./start.sh
```

This builds and watches using the configuration options from `esbuild.config.js` and uses nodemon to restart esbuild if the html, manifests or config change.

---

Run the tests with `yarn test`

Lint with `yarn lint`

Lint HTML with `htmlbeautifier src/index.html`

_NOTE: 👆 is a lazy hack - it requires Ruby and [htmlbeautifier](https://github.com/threedaymonk/htmlbeautifier/), which isn't actually bundled/packaged here_

