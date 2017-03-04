/* Localstorage helper */

function ls(key, value) {
  if (typeof key === 'undefined') {
    return window.localStorage
  }
  if (typeof value === 'undefined') {
    return window.localStorage[key] && JSON.parse(window.localStorage[key])
  }
  window.localStorage[key] = JSON.stringify(value)
}

function lsDefault(key, value) {
  if (!key || typeof value === 'undefined') {
    return console.warn('lsDefault: key & value expected')
  }
  if (!ls(key)) {
    ls(key, value)
  }
}

function inert(a) {
  return JSON.parse(JSON.stringify(a))
}

var VueLocal = {
  install: function (Vue) {
    Vue.mixin({
      created: function () {
        if (this.$options.local !== undefined) {
          if (!Array.isArray(this.$options.local)){
            throw new Error('vm.local must be an Array')
          }
          this.$options.local.forEach(path => {

            // Set to saved value or keep default
            this[path] = ls(path) || this[path]

            // Start watcher
            this.$watch(path, function (newVal) {
              ls(path, newVal)
            }, { deep: true })
          })
        }
      }
    })
  }
}

if (window && window.Vue) {
  VueLocal.install(window.Vue)
}
