import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [solid(), mkcert()],
  server: {
    https: true,
    host: true,
    port: 5173,
  },
  preview: {
    https: true,
    host: true,
    port: 4173,
  },
});
