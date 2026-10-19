// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

const LAYERS = ['shared', 'entities', 'features', 'widgets']

// FSD: a slice is reachable only through its public API (index.ts), never by a deep path.
const DEEP_IMPORTS = {
  group: LAYERS.map(layer => `@${layer}/*/*`),
  message: 'FSD: import a slice through its public API (index.ts), not a deep path.',
}

// One import style: layer aliases, not `~/<layer>` paths.
const LEGACY_LAYER_PATHS = {
  group: LAYERS.map(layer => `~/${layer}`),
  message: 'Use the FSD layer alias (@shared, @entities, @features, @widgets) instead of a ~/ path.',
}

const layerOf = (layer, forbidden) => ({
  files: [`app/${layer}/**`],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        DEEP_IMPORTS,
        LEGACY_LAYER_PATHS,
        {
          group: forbidden.flatMap(name => [`@${name}`, `~/${name}`]),
          message: `FSD: the ${layer} layer may import only from the layers below it (and not from sibling slices).`,
        },
      ],
    }],
  },
})

export default withNuxt(
  {
    rules: {
      'no-console': 'error',
      'vue/no-v-html': 'error',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'no-restricted-imports': ['error', { patterns: [DEEP_IMPORTS, LEGACY_LAYER_PATHS] }],
    },
  },
  // Sibling slices are forbidden too: inside a slice, imports are relative.
  layerOf('shared', ['entities', 'features', 'widgets', 'pages']),
  layerOf('entities', ['entities', 'features', 'widgets', 'pages']),
  layerOf('features', ['features', 'widgets', 'pages']),
  layerOf('widgets', ['widgets', 'pages']),
  {
    // Unit tests exercise slice internals on purpose.
    files: ['tests/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
)
