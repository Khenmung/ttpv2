import { defineConfig } from "cypress";

export default defineConfig({
  
  e2e: {
    "baseUrl":'http://localhost:4200/#',
    defaultCommandTimeout: 8000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
