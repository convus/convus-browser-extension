import api from '../src/api'
import log from '../src/log' // eslint-disable-line

// TODO: switch to using nock and recording requests
// requires nock supporting fetch - https://github.com/nock/nock/issues/2397

beforeEach(() => {
  fetch.resetMocks()
})

const authUrl = 'http://localhost:3009/api/v1/auth'

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
