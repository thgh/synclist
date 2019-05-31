import { connectableJSON } from './connectable.js'
import { get, writable } from 'svelte/store'

export const nick = writableLocal('nick', 'anonymous')
export const peerID = writableLocal('peerID', null)
export const commits = writableRoom('commits', () => {}, [createCommit('no')])
export const sortField = writableLocal('sortField', '')
export const showDebug = writableLocal('showDebug', false)
export const sync = writableLocal('sync', false)

commits.splice = splice(commits)

function splice(store) {
  return (i, sub, item) => {
    const v = get(store)
    v.splice(i, sub, item)
    store.set(v.slice())
  }
}

export const theme = writableLocal('theme', 'dark')
if (process.browser) {
  theme.subscribe(val => (document.body.className = val || 'dark'))
}

export function createCommit(nick, data = {}) {
  return {
    content: '',
    sortKey: 0,
    createdAt: Date.now(),
    createdBy: nick,
    deletedAt: null,
    updatedAt: Date.now(),
    updatedBy: nick,
    ...data
  }
}

export function writableLocal(key, value, update) {
  if (process.browser && window.localStorage[key]) {
    value = ls(key)
  }
  const { set, subscribe } = writable(value, update)
  return {
    set(v) {
      ls(key, v)
      set(v)
    },
    subscribe
  }
}

function validCommit(item) {
  if (item.deletedAt && item.deletedAt < Date.now() - 1000 * 3600 * 24 * 7) {
    return false
  }
  return item.createdAt && item.updatedAt
}

export function writableRoom(key, update, value = []) {
  if (process.browser && window.localStorage[key]) {
    value = ls(key).filter(validCommit)
  }
  const store = writable(value, update)
  let room

  if (process.browser) {
    room = connectableJSON('wss://websocket-room.now.sh/' + key)

    room.subscribe(data => {
      if (!data) {
        return room.send({ hello: value })
      }
      if (data.hello) {
        return room.send(value)
      }
      upsert(data)
    })
  }

  if (process.browser) {
    fetch('https://id.thomasg.be/synclist/commits', {
      headers: { accept: 'application/json' }
    })
      .then(r => r.json())
      .then(upsert)
  }

  function upsert(data) {
    let dirty = []
    if (data['@graph']) {
      data = data['@graph']
    }
    if (!Array.isArray(data)) {
      data = [data]
    }
    data.forEach(item => {
      const existing = value.find(v => v.createdAt === item.createdAt)
      if (existing) {
        if (existing.updatedAt < item.updatedAt) {
          dirty.push(Object.assign(existing, item))
        }
      } else if (validCommit(item)) {
        value.push(item)
        dirty.push(item)
      }
    })
    if (dirty.length) {
      ls(key, value)
      store.set(value.slice())
      return dirty
    }
  }

  return {
    set(v) {
      const updates = upsert(v)
      process.browser && room.send(v)

      updates.forEach(item => {
        item = Object.assign({}, item, {
          '@id': 'https://id.thomasg.be/synclist/commits/' + item.createdAt
        })
        fetch(item['@id'], {
          method: 'PUT',
          redirect: 'follow',
          headers: { accept: 'application/json', Authorization: 'insecure' },
          body: JSON.stringify(item)
        })
      })
    },
    subscribe: store.subscribe
  }
}

export function ls(key, value) {
  if (!process.browser) {
    return
  }
  if (typeof value !== 'undefined') {
    window.localStorage[key] = JSON.stringify(value)
    return value
  }
  if (window.localStorage[key]) {
    return JSON.parse(window.localStorage[key])
  }
}
