<label class="inp-subtle"><span class="inp-subtle-span inherit">{value || placeholder}.</span><textarea
    class="inherit"
    value={value}
    placeholder="{placeholder}"
    on:keydown={keydown}
    on:focus={() => dispatch('focus')}
    on:input={evt => dispatch('input', evt.target.value)}
  ></textarea></label>

<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let value
  export let placeholder = ''

  function keydown (evt) {
    switch(evt.which) {
      case 13: dispatch('keydown', evt); break;
      case 8: dispatch('keydown', evt); break;
    }
    switch(evt.code) {
      case 'Enter': dispatch('Enter'); break;
      case 'Tab': dispatch('Tab'); break;
      case 'Backspace': dispatch('keydown', evt); break;
    }
  }
</script>

<style>
.inp-subtle {
  position: relative;
  display: inline-block;
  line-height: inherit;
  flex-grow: 1;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
.inp-subtle > textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  padding: inherit;
  color: inherit;
  overflow: hidden;
  resize: none;
}
.inp-subtle-span {
  min-width: 30px;
  max-width: 100%;
  flex-grow: 1;
  color: transparent;
}
.inherit {
  border: inherit;
  font: inherit;
  line-height: inherit;
  white-space: inherit;
  overflow-wrap: inherit;
}

/* Item > Text input */

:global(.item)>.inp-subtle {
  display: block;
  line-height: 20px;
  padding: 10px 10px 10px 40px;
}
:global(.item) textarea:focus {
  outline: none;
  box-shadow: 0 0 0 1px var(--bgHover);
}
</style>
