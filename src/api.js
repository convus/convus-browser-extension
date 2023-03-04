/*
  Private
*/

// method: 'GET',
const requestProps = (reviewKey) => {
  return {
    method: 'POST',
    async: true,
    headers: {
      Authorization: 'Bearer ' + reviewKey,
      'Content-Type': 'application/json'
    },
    contentType: 'json'
  }
}

// /*
//   Public
// */

export default {
  requestProps
}
