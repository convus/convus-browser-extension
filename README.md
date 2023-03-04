# Convus Browser extension

Browser extension to add reviews to [convus.org](https://www.convus.org)

### Extension description

Convus.org lets you review websites that you read so you can track articles that are useful, informative and provide high quality information.

This browser extension makes the process of submitting reviews easy and low effort.

Use control + shift + R to open the review dialog

### Single purpose description

Submit reviews of the websites that you read to Convus.org

### activeTab justification

Required to get the url and title of the website you are reading, to submit for review.

### cookies justification

Required to authenticate with convus.org

---

## Development

In your terminal, run:

    ./start

To build and watch - which will build using `http://localhost:3009`

To build the publishable version, use `yarn build` - which will build with `https://www.convus.org` as the source.
