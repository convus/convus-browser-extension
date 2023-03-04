# Convus Browser extension

Browser extension to add reviews to [convus.org](https://www.convus.org)

### Extension description

Convus.org lets you review the websites you read so you can track articles that are useful, informative and high quality.

This browser extension makes the process of submitting reviews easy.

Use `control` + `shift` + `R` to open the review dialog

### Single purpose description

Submit a review of the website you are reading to Convus.org

### activeTab justification

Required to get the url and title of the website you are reading, for your review.

---

## Development

In your terminal, run:

    ./start

To build and watch - which will build using `http://localhost:3009`

To build the publishable version, use `yarn build` - which will build with `https://www.convus.org` as the source.
