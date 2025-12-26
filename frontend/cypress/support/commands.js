// Custom commands for Cypress testing

import 'cypress-file-upload'

// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/auth/login')
})

// Custom command for registration
Cypress.Commands.add('register', (email, password) => {
  cy.visit('/auth/register')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('input[name="confirmPassword"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/auth/register')
})

// Custom command for creating an expense
Cypress.Commands.add('createExpense', (expenseData) => {
  cy.visit('/expenses/new')
  cy.get('input[name="amount"]').type(expenseData.amount)
  cy.get('select[name="category"]').select(expenseData.category)
  cy.get('input[name="date"]').type(expenseData.date)
  if (expenseData.notes) {
    cy.get('textarea[name="notes"]').type(expenseData.notes)
  }
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/expenses')
})

// Custom command for API login (bypassing UI)
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password },
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.access_token)
    window.localStorage.setItem('user', JSON.stringify(response.body.user))
  })
})

// Custom command for checking if element is visible and contains text
Cypress.Commands.add('shouldBeVisibleAndContain', (selector, text) => {
  cy.get(selector).should('be.visible').and('contain', text)
})

// Custom command for waiting for loading to complete
Cypress.Commands.add('waitForLoad', () => {
  cy.get('[data-testid="loading"]').should('not.exist')
  cy.get('.animate-spin').should('not.exist')
})
