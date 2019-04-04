<style></style>

<svelte:head>
  <title>synclist</title>
</svelte:head>

{#if $page.query.list}
<div class="lists">
  <div class="list">
    {$page.query.list}
  </div>
</div>
{/if}

<div class="items">
  {#each visibleItems as item (item.createdAt)}
    <div
      class="item"
      class:checked={item.checkedAt}
      class:focused={focused === item}
    >
      <button class="check" on:click|preventDefault={() => toggle(item)} tabindex="-1"></button>
      <TextareaSubtle
        value="{item.content}"
        placeholder="---"
        on:focus={() => focusItem(item)}
        on:input="{evt => setText(item, evt.detail)}"
        on:keydown="{evt => keydown(item, evt.detail)}"
        @tab="tab(i, $event)"
      ></TextareaSubtle>
      {#if $showDebug}
        <div class="item__info">
          <span v-if="item.createdBy">{ item.createdBy || '' }</span>
          <span v-if="item.createdBy">{ timeago(item.createdAt) }</span>
          <span v-if="item.createdBy && item.updatedBy">&middot;</span>
          <span v-if="item.updatedBy">{ item.updatedBy || '' }</span>
          <span v-if="item.updatedBy">{ timeago(item.updatedAt) }</span>
        </div>
      {/if}
      {#if focused === item}
        <div class="item__link">
          {#each suggestions as sug}
            <button tabindex="-1" on:click={() => setText(item, sug.item.key)}>{@html sug.disp}</button>
          {/each}
          {#if !suggestions.length}
            suggestions
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<footer>
  <nav>
    <button @click="modalNick = 1" class="btn--settings">
      Settings
      <div>
        <small>{ $nick }</small>
        <small v-if="sync">sync</small>
        <small v-if="$showDebug">info</small>
      </div>
    </button>
    <button @click="modalDebug = 1" v-if="$showDebug">debug</button>
    <button @click="sync = !sync" class="btn--right">
      Toggle sync
      <div>
        <small
          >{ peer.destroyed ? 'destroyed' : peer.disconnected ? 'disconnected'
          : actualPeers.length ? actualPeers.length + ' peer' +
          (actualPeers.length > 1 ? 's' : '') : peer.connected ? 'connected' :
          peer.open ? 'ready' : !peeringStarted ? 'offline' : peer.id ?
          'connecting' : 'in trouble' }</small
        >
      </div>
    </button>
  </nav>
</footer>

{#if false}
<modal v-if="modalDebug" @close="modalDebug = false">
  <h1>Debug</h1>
  <pre v-text="stats"></pre>
  <div>
    <table>
      <thead>
        <tr>
          <th>peer</th>
          <th>open</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="conn in connections">
          <td v-text="conn.peer"></td>
          <td v-text="conn.open"></td>
        </tr>
      </tbody>
    </table>

    <pre v-text="peer.open ? 'You are connected' : 'Offline'"></pre>
    <pre v-text="peerID"></pre>
    <pre v-text="connectionsJSON"></pre>
    <pre
      v-text="commits"
      style="max-height: 20em;overflow: auto; opacity: .5"
    ></pre>
    <pre
      v-text="peerJSON"
      style="max-height: 20em;overflow: auto; opacity: .5"
    ></pre>
  </div>
</modal>

<modal v-if="modalNick" @close="modalNick = false">
  <h2>Settings</h2>
  <label class="form-group">
    <div>Device nickname</div>
    <input type="text" bind:value="{$nick}" />
  </label>
  <label class="form-group checkbox">
    <input type="checkbox" bind:checked="{$sync}" />
    <div>Sync with peers</div>
  </label>
  <label class="form-group checkbox">
    <input type="checkbox" bind:checked="{$showDebug}" />
    <div>Show info about items</div>
  </label>
</modal>
{/if}

<script>
  import { tick } from 'svelte';
  import { page } from '@sapper/app'
  import { nick, sync, showDebug, commits } from '../lib/store.js'
  import { entities, suggest } from '../lib/entities.js'

  import TextareaSubtle from '../components/TextareaSubtle.svelte'

  let focused = null
  let modalDebug=false
  let modalNick=false
  const peeringStarted = 'not'
  const actualPeers = []
  const peer = {}

  $: items = sortBy(sortBy($commits, 'sortAfter'), 'createdAt')
  $: visibleItems = items.filter(item => !item.deletedAt)
  $: suggestions = focused && items ? suggest(focused) : []

  function setText (item, content) {
    commits.set(Object.assign({}, item, {
      content,
      updatedBy: $nick,
      updatedAt: Date.now()
    }))
  }


  async function keydown (item, evt) {
    console.log('keydown', item, evt)
    if (evt.which === 13) {
      evt.preventDefault()

      // If next item is empty, tab to it
      // if (this.isEmptyCommit(i)) {
      //   // this.$nextTick(() => {
      //     const next = evt.target.closest('.item').nextElementSibling
      //     next && next.querySelector('textarea').focus()
      //   // })
      //   return
      // }

      const createdAt = Date.now()

      // Insert empty item
      commits.set({
        content: '',
        sortAfter: item.createdAt,
        createdAt: Date.now(),
        createdBy: $nick,
        deletedAt: null,
        updatedAt: Date.now(),
        updatedBy: $nick,
      })
      if (evt) {
        await tick();
        const next = evt.target.closest('.item').nextElementSibling
        next && next.querySelector('textarea').focus()
      }
    } else if (evt.which === 8) {

      if (!item.content) {
        evt.preventDefault()
        commits.set({
          createdAt: item.createdAt,
          deletedAt: Date.now(),
          updatedBy: $nick,
          updatedAt: Date.now()
        })
        if (evt.keyCode == 8) {
          const previous = evt.target.closest('.item').previousElementSibling
          previous && previous.querySelector('textarea').focus()
        } else {
          const next = evt.target.closest('.item').nextElementSibling
          next && next.querySelector('textarea').focus()
        }
      }
    }
  }

  function toggle (item) {
    commits.set(Object.assign({}, item, {
      checkedAt: item.checkedAt ? null : Date.now(),
      updatedBy: $nick,
      updatedAt: Date.now()
    }))
  }

  function focusItem (item) {
    focused = item
  }

  // Helpers

  function createCommit(nick) {
    return {
      content: '',
      createdAt: Date.now(),
      createdBy: nick,
      deletedAt: null,
      updatedAt: Date.now(),
      updatedBy: nick
    }
  }

  function timeago(d) {
    if (!d) {
      return 'nooit'
    }
    if (typeof d === 'string') {
      d = d.replace(' ', 'T')
    }
    d = new Date(d)
    if (!d) {
      console.error('Report invalid date')
      return 'invalid'
    }
    const diff = new Date().valueOf() - d.valueOf()
    if (diff > 1000 * 60 * 60 * 24) {
      const MONTHS = 'jan,feb,maart,apr,mei,juni,juli,aug,sept,okt,nov,dec'.split(
        ','
      )
      return (
        d.getDate() +
        ' ' +
        MONTHS[d.getMonth()] +
        ' ' +
        pad(d.getHours()) +
        ':' +
        pad(d.getSeconds())
      )
    }
    if (diff > 1000 * 60 * 60) {
      return Math.round(diff / 36e5) + ' uur ago'
    }
    if (diff > 1000 * 60) {
      return Math.round(diff / 6e4) + ' min. ago'
    }
    return Math.round(diff / 1000) + ' s. ago'
  }

  function pad(t) {
    return t < 10 ? '0' + t : t
  }
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
  }

  function sortBy(arr, field, alt) {
    return arr.slice().sort((a, b) => {
      return (a[field] || a[alt]) < (b[field] || b[alt])
        ? -1
        : (a[field] || a[alt]) === (b[field] || b[alt])
        ? 0
        : 1
    })
  }
</script>
