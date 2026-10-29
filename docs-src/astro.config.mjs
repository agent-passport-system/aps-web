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
        { label: 'Core concepts', slug: 'concepts' },
        {
          label: 'Protocol reference',
          items: [
            { label: 'Identity and principal binding', slug: 'identity' },
            { label: 'Authority and revocation', slug: 'authority' },
            { label: 'Signed bytes and references', slug: 'signed-bytes' },
            { label: 'Receipt families and verification', slug: 'receipt-verification' },
            { label: 'Receipts: what they prove', slug: 'receipts' },
            { label: 'Status and conformance', slug: 'status' },
            { label: 'Compatibility: social contract API', slug: 'compatibility' },
          ],
        },
        {
          label: 'Tools and SDKs',
          items: [
            { label: 'The gateway', slug: 'gateway' },
            { label: 'MCP server', slug: 'mcp-server' },
            { label: 'CLI reference', slug: 'cli' },
            { label: 'API reference', slug: 'api' },
            { label: 'Languages and artifacts', slug: 'languages' },
          ],
        },
        { label: 'Compliance evidence', slug: 'evidence' },
        { label: 'Specifications', slug: 'specs' },
        { label: 'Related work', slug: 'federation' },
      ],
    }),
  ],
});
