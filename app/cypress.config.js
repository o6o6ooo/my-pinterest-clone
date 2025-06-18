const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    viewportWidth: 430, // iPhone 15 Pro Max width
    viewportHeight: 932, // iPhone 15 Pro Max height
    supportFile: 'cypress/support/e2e.js',
    specPattern: "cypress/e2e/**/*.js",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
  },
});