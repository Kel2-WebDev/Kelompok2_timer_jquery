import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      // This are the workaround because somehow Vite does not goes well with Socket.io-client 4.2.x
      // https://github.com/vitejs/vite/issues/4798
      "xmlhttprequest-ssl":
        "./node_modules/engine.io-client/lib/xmlhttprequest.js",
    },
  },
});
