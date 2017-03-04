Vue.component('textarea-subtle', {
  name: 'textarea-subtle',
  props: ['value', 'placeholder'],
  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  template: `
  <label class="inp-subtle">
    <span class="inp-subtle-span" v-text="(value || placeholder) + '.'"></span>
    <textarea
      v-model="model"
      :placeholder="placeholder"
      @keydown.enter="$emit('enter', $event)"
      @keydown.delete="$emit('remove', $event)"
      @keydown.tab="$emit('tab', $event)"
    ></textarea>
  </label> `
}) 
