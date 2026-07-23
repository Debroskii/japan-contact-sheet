import { defineConfig } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

// Cloudflare Pages serves the site from the root of its domain
// (e.g. https://gallery-app.pages.dev/ or your custom domain),
// so no subpath base is needed here.
export default defineConfig({
  base: '/',
  plugins: [cloudflare()],
});