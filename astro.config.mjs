// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://lukas-roth.dev',
  // Dev server pinned to 5173 — the only non-SSH port opened by the
  // homeserver-ansible dev_vm firewall (UFW + Proxmox). See dev_vm_vite_port.
  server: { host: true, port: 5173 },
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
