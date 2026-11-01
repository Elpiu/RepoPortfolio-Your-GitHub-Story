import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': ['error', { html: { void: 'any' } }],
  },
  ignores: ['docs/**', '.output/**', '.nuxt/**', '.cache/**'],
})
