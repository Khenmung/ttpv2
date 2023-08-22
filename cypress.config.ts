import { defineConfig } from "cypress";

export default defineConfig({
  
  defaultCommandTimeout: 30000,
  watchForFileChanges: false,
  e2e: {
    "baseUrl":'http://localhost:4200/#',
    //"baseUrl":'https://ttp.ttpsolutions.in/#',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
