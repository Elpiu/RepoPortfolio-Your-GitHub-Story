import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
  },
  ignores: ['docs/**', '.output/**', '.nuxt/**', '.cache/**'],
})
