import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      // This are the workaround because somehow Vite does not goes well with Socket.io-client 4.2.x
      // https://github.com/vitejs/vite/issues/4798
      "xmlhttprequest-ssl":
        "./node_modules/engine.io-client/lib/xmlhttprequest.js",
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        timer: resolve(__dirname, "timer.html"),
        join: resolve(__dirname, "join.html"),
      },
    },
  },
});
