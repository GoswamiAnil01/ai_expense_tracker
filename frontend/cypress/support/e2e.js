// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands or override existing commands
// Cypress.Commands.add('login', (email, password) => {
//   cy.visit('/auth/login')
//   cy.get('input[name="email"]').type(email)
//   cy.get('input[name="password"]').type(password)
//   cy.get('button[type="submit"]').click()
// })

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  return true
})

// Add beforeEach hook to clear localStorage and cookies
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
