import api from '../src/api'
import log from '../src/log' // eslint-disable-line

// TODO: switch to using nock and recording requests
// requires nock supporting fetch - https://github.com/nock/nock/issues/2397

beforeEach(() => {
  fetch.resetMocks()
})

const authUrl = 'http://localhost:3009/api/v1/auth'
const reviewUrl = 'http://localhost:3009/api/v1/reviews'

test('api returns target requestProps', () => {
  const target = {
    async: true,
    contentType: 'json',
    headers: { Authorization: 'Bearer xxxx', 'Content-Type': 'application/json' }
  }

  expect(api.requestProps('xxxx')).toStrictEqual(target)
})

test('api returns target with extra', () => {
  const target = {
    extra: 'party',
    async: true,
    contentType: 'json',
    headers: { Authorization: 'Bearer xxxx', 'Content-Type': 'application/json' }
  }
  expect(api.requestProps('xxxx', { extra: 'party' })).toStrictEqual(target)
})

test('verifyReviewTokenValid returns false for missing', async () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'missing users' }), { status: 401 })

  const res = await api.verifyReviewTokenValid(authUrl, 'xxxx')
  expect(res).toBe(false)
})

test('verifyReviewTokenValid returns true for authenticated', async () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'authenticated' }), { status: 200 })

  const res = await api.verifyReviewTokenValid(authUrl, 'xxxx')
  expect(res).toBe(true)
})

test('getReviewToken returns message for not-authenticated', async () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'Incorrect email or password' }), { status: 401 })
  const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

  const res = await api.getReviewToken(loginFormJson, authUrl)
  expect(res).toStrictEqual({ message: 'Incorrect email or password' })
})

test('getReviewToken returns reviewToken for authenticated', async () => {
  fetch.mockResponseOnce(JSON.stringify({ review_token: 'zzzzz' }), { status: 200 })
  const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

  const res = await api.getReviewToken(loginFormJson, authUrl)
  expect(res).toStrictEqual({ reviewToken: 'zzzzz' })
})

test('submitReview returns', async () => {
  fetch.mockResponseOnce(JSON.stringify({ message: 'review added' }), { status: 200 })

  const reviewJson = {"source":"chrome_extension","submitted_url":"https://github.com/convus/convus-browser-extension/pull/4","agreement":"neutral","quality":"quality_med","changed_my_opinion":"1","significant_factual_error":"0","citation_title":"Remove remote code loading by sethherr · Pull Request #4 · convus/convus-browser-extension"}

  const res = await api.submitReview("xxxx", reviewJson, reviewUrl)
  expect(res).toStrictEqual({ message: 'review added' })
})
