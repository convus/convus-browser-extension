// method: 'GET',
const requestProps = (reviewKey) => {
  return {
    async: true,
    headers: {
      Authorization: 'Bearer ' + reviewKey,
      'Content-Type': 'application/json'
    },
    contentType: 'json'
  }
}
// method: 'POST',

export default {
  requestProps
}
