const scripts = {
  Peer: 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.14/peer.min.js'
}
const fetched = {}

function loadChunk (lib, cb, times = 0) {
  if (window[lib]) {
    return typeof cb === 'function' ? cb() : window[lib]
  }
  if (times > 50) {
    return console.warn('Gave up on loading chunk', lib)
  }
  if (!scripts[lib]) {
    return console.error('Unexpected chunk', lib)
  }
  if (!fetched[lib]) {
    fetched[lib] = true
    var first, s
    s = document.createElement('script')
    s.src = scripts[lib]
    s.type = 'text/javascript'
    s.async = true
    first = document.getElementsByTagName('script')[0]
    first.parentNode.insertBefore(s, first)
  }
  setTimeout(() => loadChunk(lib, cb, times + 1), 10 + times * 10)
  return window[lib]
}
