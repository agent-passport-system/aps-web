// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://agent-passport.org',
  base: '/docs',
  outDir: '../docs',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'APS Docs',
      favicon: '/favicon.ico',
      customCss: ['./src/styles/fonts.css', './src/styles/theme.css'],
      lastUpdated: true,
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/agent-passport-system/agent-passport-system' },
      ],
      sidebar: [
        { label: 'Introduction', slug: 'index' },
        { label: 'Install', slug: 'install' },
        { label: 'Quickstart', slug: 'quickstart' },
        { label: 'Compatibility: social contract API', slug: 'compatibility' },
        { label: 'Core concepts', slug: 'concepts' },
        { label: 'Receipts', slug: 'receipts' },
        { label: 'The gateway', slug: 'gateway' },
        { label: 'MCP server', slug: 'mcp-server' },
        { label: 'CLI reference', slug: 'cli' },
        { label: 'API reference', slug: 'api' },
        { label: 'Compliance evidence', slug: 'evidence' },
        { label: 'Specifications', slug: 'specs' },
        { label: 'Related work', slug: 'federation' },
      ],
    }),
  ],
});
