<svelte:head>
	<title>Settings</title>
</svelte:head>

<h2>Settings</h2>
<label class="form-group">
  <div>Device nickname</div>
  <input type="text" bind:value="{$nick}" />
</label>
<label class="form-group checkbox">
  <input type="checkbox" bind:checked="{$showDebug}" />
  <div>Show info about items</div>
</label>
<label class="form-group">
  <div>Theme</div>
  <button on:click={() => theme.set('dark')}>dark</button>
  <button on:click={() => theme.set('light')}>light</button>
</label>

<h2>Debug</h2>
<div>
  <pre
    style="max-height: 20em;overflow: auto; opacity: .5"
  >{JSON.stringify($commits, null, 2)}</pre>
  <pre
    v-text="peerJSON"
    style="max-height: 20em;overflow: auto; opacity: .5"
  ></pre>
</div>

<footer>
  <nav>
    <a href={$page.query.back || '/'} class="btn btn--settings">
      Back
      <br><small>to list</small>
    </a>
  </nav>
</footer>

<script>
  import { page } from '@sapper/app'

  import { nick, sync, showDebug, commits, theme } from '../lib/store.js'
</script>
