import api from '../src/api'
import log from '../src/log' // eslint-disable-line

// TODO: switch to using nock and recording requests (like ruby vcr)
// requires nock supporting fetch - https://github.com/nock/nock/issues/2397

beforeEach(() => {
  fetch.resetMocks()
})

const authUrl = 'http://localhost:3009/api/v1/auth'
const ratingUrl = 'http://localhost:3009/api/v1/ratings'

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

describe('isAuthTokenValid', function () {
  test('returns false for missing', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'missing users' }), { status: 401 })

    const res = await api.isAuthTokenValid('xxxx', authUrl)
    expect(res).toBe(false)
  })

  test('returns true for authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: 'authenticated' }), { status: 200 })

    const res = await api.isAuthTokenValid(authUrl, 'xxxx')
    expect(res).toBe(true)
  })
})

describe('getAuthToken', function () {
  test('returns message for not-authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Incorrect email or password' }), { status: 401 })
    const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

    const res = await api.getAuthToken(authUrl, loginFormJson)
    expect(res).toStrictEqual({ message: ['error', 'Incorrect email or password'] })
  })

  test('returns authToken for authenticated', async () => {
    fetch.mockResponseOnce(JSON.stringify({ review_token: 'zzzzz', name: 'party' }), { status: 200 })
    const loginFormJson = { email: 'test@example.com', password: 'fakepass' }

    const res = await api.getAuthToken(authUrl, loginFormJson)
    expect(res).toStrictEqual({ authToken: 'zzzzz', currentName: 'party', message: ['success', 'authenticated'] })
  })
})

describe('submitRating', function () {
  test('submitRating succeeds', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'rating added', share: 'share message' }), { status: 200 })

    const ratingJson = { source: 'chrome_extension', submitted_url: 'https://github.com/convus/convus-browser-extension/pull/4', agreement: 'neutral', quality: 'quality_med', changed_my_opinion: '1', significant_factual_error: '0', citation_title: 'Remove remote code loading by sethherr · Pull Request #4 · convus/convus-browser-extension' }

    const res = await api.submitRating(ratingUrl, 'xxxx', ratingJson)
    expect(res).toStrictEqual({ success: true, message: ['success', 'rating added'], share: 'share message' })
  })
})
