<svelte:head>
  <title>{list.title || $page.params.list} - Synclist</title>
  <link rel="manifest" href="manifest.json?{manifest}" />
</svelte:head>

{#if list}
<div class="lists">
  <div class="list current">
    {list.title}
  </div>
  {#each otherLists as other}
    <a href="/{other.id}" class="list">{other.title}</a>
  {/each}
</div>
{/if}

<div class="items">
  {#each visibleItems as item (item.createdAt)}
    <div
      id="a{item.createdAt}"
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
        on:blur={() => blurItem(item)}
      ></TextareaSubtle>
      {#if focused && focused.createdAt === item.createdAt && item.updatedBy === $nick && !entityKeys.includes(focused.content) && suggestions.length}
        <div class="item__suggestions">
          {#each suggestions as sug}
            <button class="btn btn-sug" tabindex="-1" on:click={() => setText(item, sug.item.key)}>{@html sug.disp}</button>
          {/each}
        </div>
      {/if}
      {#if item.shopName}
        <div class="item__shop">
          <span>{item.shopName}</span>
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
{#if !visibleItems.length}
  <div>
    <button on:click={() => commits.set(createCommit($nick, { list: list.id }))}>add</button>
  </div>
{/if}

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

<script context="module">
  export function preload({ params }) {
    const lists = [
      {
        id: 'item',
        title: 'Items'
      },
      {
        id: 'menu',
        title: 'Menu'
      },
      {
        id: 'todo',
        title: 'Ideas'
      }
    ]
    console.log('be')
    const list = lists.find(
      f => f.id === params.list || f.title === params.list
    )
    console.log('aftes', list, params.list)
    if (!list) {
      return this.redirect(302, '/' + lists[0].id)
    }
    console.log(list, lists)
    return {
      list,
      lists
    }
  }
  function pad(t) {
    return t < 10 ? '0' + t : t
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
  }

  function sortBy(arr, field, alt) {
    if (field === 'shop') {
      arr.forEach(item => {
        item.shop =
          (shopLookup[item.content] && shopLookup[item.content].key) ||
          item.shop ||
          'a'
      })
    }
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
  import { tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import { serialize } from '../lib/url.js'

  import { page, goto } from '@sapper/app'
  import {
    nick,
    sync,
    showDebug,
    sortField,
    commits,
    createCommit
  } from '../lib/store.js'
  import { shopLookup } from '../lib/shops.js'
  import { entityKeys, suggest } from '../lib/entities.js'

  import TextareaSubtle from '../components/TextareaSubtle.svelte'

  export let list = { id: 1, title: 'no' }
  export let lists
  let focused = null
  let modalDebug = false
  let modalNick = false
  const peeringStarted = 'not'
  const actualPeers = []
  const peer = {}

  $: filteredItems = $commits.filter(c =>
    !list.id || list.id === 'item'
      ? !c.list || c.list === 'item'
      : c.list === list.id
  )
  $: sortedItems = sortBy(filteredItems, $sortField || 'sortKey')
  $: visibleItems = sortedItems.filter(item => !item.deletedAt)
  $: suggestions = focused && visibleItems ? suggest(focused) : []
  $: otherLists = lists.filter(a => a.id !== $page.params.list)
  $: manifest = serialize({ list: $page.params.list })

  function setText(item, content) {
    const updates = {
      content,
      updatedBy: $nick,
      updatedAt: Date.now()
    }
    const shop = shopLookup[content]
    if (shop) {
      updates.shop = shop.key
      updates.shopName = shop.name
    }
    commits.set(Object.assign({}, item, updates))
  }

  function blurItem(item) {
    // if ((list.id !== 'menu') === item.content.split(" ").length > 2) {
    //   goto(list.id === 'menu' ? 'item' : 'menu')
    //   .then(() => {
    //     focused && document.querySelector('#a' + focused.createdAt + ' textarea').focus()
    //   })
    // }
  }

  // function enrich (item) {
  //   const found = shopLookup[item.content]
  //   item.shop = found ? found.key : ''
  //   return item
  // }

  async function keydown(item, evt) {
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
      const nextSort = (next && next.sortKey) || Number.MAX_SAFE_INTEGER
      console.log('next', next)

      // Insert empty item
      commits.set({
        content: '',
        list: list.id,
        sortKey: ((item.sortKey || 0) + nextSort) / 2,
        createdAt: Date.now(),
        createdBy: $nick,
        deletedAt: null,
        updatedAt: Date.now(),
        updatedBy: $nick
      })
      if (evt) {
        await tick()
        if ($sortField === 'shop') {
          const next = evt.target.closest('.items').lastElementChild
          next && next.querySelector('textarea').focus()
        } else {
          const next = evt.target.closest('.item').nextElementSibling
          next && next.querySelector('textarea').focus()
        }
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

  function toggle(item) {
    commits.set(
      Object.assign({}, item, {
        checkedAt: item.checkedAt ? null : Date.now(),
        updatedBy: $nick,
        updatedAt: Date.now()
      })
    )
  }

  function focusItem(item) {
    focused = item
  }

  // Helpers

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
