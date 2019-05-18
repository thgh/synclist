<style></style>

<svelte:head>
  <title>synclist</title>
</svelte:head>

{#if $page.params.list}
<div class="lists">
  <div class="list current">
    {$page.params.list}
  </div>
  <a href="/ingredients" class="list">
    ingredients
  </a>
  <a href="/ideas" class="list">
    ideas
  </a>
</div>
{/if}

<div class="items">
  {#each visibleItems as item (item.createdAt)}
    <div
      class="item"
      class:checked={item.checkedAt}
      class:focused={focused === item}
      transition:slide="{{ duration: 300 }}"
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
      {#if focused === item && !entityKeys.includes(focused.content) && suggestions.length}
        <div class="item__suggestions">
          {#each suggestions as sug}
            <button class="btn btn-sug" tabindex="-1" on:click={() => setText(item, sug.item.key)}>{@html sug.disp}</button>
          {/each}
        </div>
      {/if}
      {#if shopLookup[item.content]}
        <div class="item__shop">
          <span>{shopLookup[item.content].name}</span>
        </div>
      {/if}
      {#if $showDebug}
        <div class="item__info">
          <span v-if="item.createdBy">{ item.createdBy || '' }</span>
          <span v-if="item.createdBy">{ timeago(item.createdAt) }</span>
          <span v-if="item.createdBy && item.updatedBy">&middot;</span>
          <span v-if="item.updatedBy">{ item.updatedBy || '' }</span>
          <span v-if="item.updatedBy">{ timeago(item.updatedAt) }</span>
        </div>
      {/if}
    </div>
  {/each}
</div>

<footer>
  <nav>
    <a href="/settings?back={$page.path}" class="btn btn--settings">
      Settings
      <div>
        <small>{ $nick }</small>
        {#if $sync}
          <small>sync</small>
        {/if}
        {#if $showDebug}
          <small>info</small>
        {/if}
      </div>
    </a>
    <button class="btn" on:click={() => $showDebug = !$showDebug}>debug</button>
    <button class="btn btn--right" on:click={() => $sortField = $sortField === 'shop' ? '' : 'shop'}>
      Sort
      <div>
        <small>{$sortField || 'default'}</small>
      </div>
    </button>
  </nav>
</footer>

{#if false}
<modal v-if="modalDebug" @close="modalDebug = false">
  <h1>Debug</h1>
</modal>

<modal v-if="modalNick" @close="modalNick = false">
</modal>
{/if}

<script context=module>
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
<script>
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';

  import { page } from '@sapper/app'
  import { nick, sync, showDebug, sortField, commits } from '../lib/store.js'
  import { shopLookup } from '../lib/shops.js'
  import { entityKeys, suggest } from '../lib/entities.js'

  import TextareaSubtle from '../components/TextareaSubtle.svelte'

  let focused = null
  let modalDebug=false
  let modalNick=false
  const peeringStarted = 'not'
  const actualPeers = []
  const peer = {}

  $: items = sortBy($commits.map(enrich), $sortField || 'sortKey')
  $: visibleItems = items.filter(item => !item.deletedAt)
  $: suggestions = focused && items ? suggest(focused) : []

  function setText (item, content) {
    commits.set(Object.assign({}, item, {
      content,
      updatedBy: $nick,
      updatedAt: Date.now()
    }))
  }

  function enrich (item) {
    const found = shopLookup[item.content]
    item.shop = found ? found.key : ''
    return item
  }

  async function keydown (item, evt) {
    console.log('keydown', item, evt)
    // Enter
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
      console.log('ind', visibleItems.indexOf(item), visibleItems)
      const next = visibleItems[visibleItems.indexOf(item) + 1]
      const nextSort = next && next.sortKey || Number.MAX_SAFE_INTEGER
      console.log('next', next)

      // Insert empty item
      commits.set({
        content: '',
        sortKey: ((item.sortKey || 0) + nextSort) / 2,
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
      // Delete

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
</script>
