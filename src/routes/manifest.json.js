import { serialize } from '../lib/url.js'

export function get(req, res) {
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify({
    background_color: req.query.bg || '#000000',
    theme_color: req.query.theme || '#d06',
    name: prefix(req.query.list, 'Synclist'),
    short_name: req.query.list || 'Synclist',
    display: 'standalone',
    start_url: '/?' + serialize({ list: req.query.list }),
    icons: []
  }))
}

function prefix (a, b) {
  return [a, b].join(' - ').trim()
}
