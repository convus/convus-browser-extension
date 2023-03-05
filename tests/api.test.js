import api from '../src/api'
import log from '../src/log' // eslint-disable-line

// TODO: switch to using nock and recording requests (like ruby vcr)
// requires nock supporting fetch - https://github.com/nock/nock/issues/2397

beforeEach(() => {
  fetch.resetMocks()
})

const authUrl = 'http://localhost:3009/api/v1/auth'
const reviewUrl = 'http://localhost:3009/api/v1/reviews'

describe('requestProps', function () {
  test('returns target', () => {
    const target = {
      async: true,
      method: 'POST',
      contentType: 'json',
      headers: { 'Content-Type': 'application/json' }
    }

    expect(api.requestProps()).toStrictEqual(target)
  })
  test('returns with authorization header', () => {
    const target = {
      async: true,
      method: 'POST',
      contentType: 'json',
      headers: { Authorization: 'Bearer xxxx', 'Content-Type': 'application/json' }
    }

    expect(api.requestProps('xxxx')).toStrictEqual(target)
  })

  test('returns with extra', () => {
    const target = {
      extra: 'party',
      method: 'GET',
      async: true,
      contentType: 'json',
      headers: { Authorization: 'Bearer xxxx', 'Content-Type': 'application/json' }
    }
    expect(api.requestProps('xxxx', { extra: 'party', method: 'GET' })).toStrictEqual(target)
  })
})

describe('isReviewTokenValid', function () {
  test('returns false for missing', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'missing users' }), { status: 401 })

    const res = await api.isReviewTokenValid('xxxx', authUrl)
    expect(res).toBe(false)
  })

  test('returns true for authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: 'authenticated' }), { status: 200 })

    const res = await api.isReviewTokenValid(authUrl, 'xxxx')
    expect(res).toBe(true)
  })
})

describe('getReviewToken', function () {
  test('returns message for not-authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Incorrect email or password' }), { status: 401 })
    const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

    const res = await api.getReviewToken(authUrl, loginFormJson)
    expect(res).toStrictEqual({ messages: [['error', 'Incorrect email or password']] })
  })

  test('returns reviewToken for authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ review_token: 'zzzzz' }), { status: 200 })
    const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

    const res = await api.getReviewToken(authUrl, loginFormJson)
    expect(res).toStrictEqual({ reviewToken: 'zzzzz', messages: [['success', 'authenticated']] })
  })
})

describe('submitReview', function () {
  test('submitReview succeeds', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'review added' }), { status: 200 })

    const reviewJson = { source: 'chrome_extension', submitted_url: 'https://github.com/convus/convus-browser-extension/pull/4', agreement: 'neutral', quality: 'quality_med', changed_my_opinion: '1', significant_factual_error: '0', citation_title: 'Remove remote code loading by sethherr · Pull Request #4 · convus/convus-browser-extension' }

    const res = await api.submitReview(reviewUrl, 'xxxx', reviewJson)
    expect(res).toStrictEqual({ success: true, messages: [['success', 'review added']] })
  })
})
