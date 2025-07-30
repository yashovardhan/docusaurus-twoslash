// @ts-check
const path = require("path");
const remarkTwoslash = require("./remark/remarkTwoslash");

/**
 * Docusaurus Twoslash Plugin
 * 
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {Object} options - Plugin options
 * @param {Object} options.typescript - TypeScript configuration
 * @param {Object} options.typescript.compilerOptions - Custom TypeScript compiler options
 * @param {string[]} options.themes - Supported languages/themes (default: ['typescript', 'javascript', 'jsx', 'tsx'])
 * @param {boolean} options.cache - Whether to enable caching (default: true)
 * @param {boolean} options.includeDefaultLib - Whether to include default lib (default: true)
 * @returns {import('@docusaurus/types').Plugin}
 */
function docusaurusTwoslashPlugin(context, options = {}) {
  const {
    typescript = {},
    themes = ['typescript', 'javascript', 'jsx', 'tsx'],
    cache = true,
    includeDefaultLib = true,
  } = options;

  console.log('🚀 Docusaurus Twoslash Plugin loaded with options:', { themes, cache });

  return {
    name: 'docusaurus-twoslash',

    getThemePath() {
      // Return the path to our theme components
      return path.resolve(__dirname, 'theme');
    },

    getTypeScriptThemePath() {
      // Return the path for TypeScript theme support
      return path.resolve(__dirname, 'theme');
    },

    async contentLoaded({ content, actions, allContent }) {
      const { addRoute } = actions;
      // Plugin content loading logic if needed
    },

    async loadContent() {
      // Load any static content if needed
      return null;
    },

    getClientModules() {
      // Return client-side modules for CSS
      return [
        path.resolve(__dirname, 'theme/styles.css'),
      ];
    },

    injectHtmlTags() {
      return {
        headTags: [],
        preBodyTags: [],
        postBodyTags: [],
      };
    },
  };
}

// Export the remark plugin separately for use in preset configuration
docusaurusTwoslashPlugin.remarkPlugin = remarkTwoslash;

module.exports = docusaurusTwoslashPlugin;
