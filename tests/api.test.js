import api from '../src/api'
import log from '../src/log' // eslint-disable-line

beforeEach(() => {
  fetch.resetMocks();
});

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
  fetch.mockResponseOnce(JSON.stringify({"message":"missing users"}), {status: 401})

  const res = await api.verifyReviewTokenValid(authUrl, "xxxx");
  expect(res).toBe(false)
})

test('verifyReviewTokenValid returns true for authenticated', async () => {
  fetch.mockResponseOnce(JSON.stringify({"message":"authenticated"}), {status: 200})

  const res = await api.verifyReviewTokenValid(authUrl, "xxxx");
  expect(res).toBe(true)
})
