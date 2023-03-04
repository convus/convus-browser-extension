import api from '../src/api'

test('api returns invalid date for unparseable time', () => {
  const target = {
    method: 'POST',
    async: true,
    contentType: 'json',
    headers: {
      Authorization: 'Bearer ' + 'xxxx',
      'Content-Type': 'application/json'
    }
  }

  expect(api.requestProps('xxxx')).toStrictEqual(target)
})
