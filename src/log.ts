import loglevel from 'loglevel'

// Currently, biasing toward more logging, because of issues with Safari
loglevel.setLevel('debug')

// if (process.env.NODE_ENV === 'production') {
//   loglevel.setLevel('warn')
// } else {
//   loglevel.setLevel('debug')
// }

export default loglevel
