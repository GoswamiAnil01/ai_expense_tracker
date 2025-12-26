
describe('Dashboard', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    // Login before each test
    cy.login('test@example.com', 'password123')
  })

  it('should display dashboard with user information', () => {
    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: {
        year: 2024,
        month: 1,
        grand_total: 0,
        categories: []
      }
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    cy.get('h1').should('contain', 'Dashboard')
    cy.get('text').should('contain', 'Welcome back, test@example.com')
  })

  it('should display expense statistics', () => {
    const mockSummary = {
      year: 2024,
      month: 1,
      grand_total: 1250.75,
      categories: [
        {
          category: 'food',
          total: 450.25,
          count: 12,
          average: 37.52
        },
        {
          category: 'travel',
          total: 300.00,
          count: 3,
          average: 100.00
        },
        {
          category: 'entertainment',
          total: 200.50,
          count: 5,
          average: 40.10
        }
      ]
    }

    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: 1,
            amount: 25.50,
            category: 'food',
            date: '2024-01-15T00:00:00Z',
            notes: 'Lunch at restaurant'
          },
          {
            id: 2,
            amount: 45.00,
            category: 'travel',
            date: '2024-01-16T00:00:00Z',
            notes: 'Uber ride'
          }
        ],
        total: 2,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: mockSummary
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    // Check statistics cards
    cy.get('text').should('contain', '$1,250.75') // Total spent
    cy.get('text').should('contain', '3') // Categories
    cy.get('text').should('contain', '2') // Transactions
    
    // Check category breakdown
    cy.get('text').should('contain', 'Food')
    cy.get('text').should('contain', '$450.25')
    cy.get('text').should('contain', '12 transactions')
    
    cy.get('text').should('contain', 'Travel')
    cy.get('text').should('contain', '$300.00')
    cy.get('text').should('contain', '3 transactions')
  })

  it('should display recent expenses', () => {
    const mockExpenses = [
      {
        id: 1,
        amount: 25.50,
        category: 'food',
        date: '2024-01-15T00:00:00Z',
        notes: 'Lunch at restaurant'
      },
      {
        id: 2,
        amount: 45.00,
        category: 'travel',
        date: '2024-01-16T00:00:00Z',
        notes: 'Uber ride'
      }
    ]

    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: mockExpenses,
        total: 2,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: {
        year: 2024,
        month: 1,
        grand_total: 70.50,
        categories: []
      }
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    cy.get('table').should('be.visible')
    cy.get('tbody tr').should('have.length', 2)
    cy.get('text').should('contain', 'Lunch at restaurant')
    cy.get('text').should('contain', 'Uber ride')
    cy.get('text').should('contain', '$25.50')
    cy.get('text').should('contain', '$45.00')
  })

  it('should show add expense link when no expenses exist', () => {
    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: {
        year: 2024,
        month: 1,
        grand_total: 0,
        categories: []
      }
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    cy.get('text').should('contain', 'No expenses this month')
    cy.get('a[href="/expenses/new"]').should('be.visible')
  })

  it('should display prediction chart', () => {
    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: {
        year: 2024,
        month: 1,
        grand_total: 0,
        categories: []
      }
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    cy.get('text').should('contain', 'Spending Predictions')
    cy.get('select').should('be.visible') // Category selector
  })

  it('should navigate to all expenses link', () => {
    cy.intercept('GET', '/api/expenses*', {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      }
    }).as('getExpenses')

    cy.intercept('GET', '/api/expenses/summary*', {
      statusCode: 200,
      body: {
        year: 2024,
        month: 1,
        grand_total: 0,
        categories: []
      }
    }).as('getSummary')

    cy.visit('/dashboard')
    cy.wait('@getExpenses')
    cy.wait('@getSummary')
    
    cy.get('a[href="/expenses"]').click()
    cy.url().should('include', '/expenses')
  })

  it('should export PDF functionality', () => {
      const mockSummary = {
        year: 2024,
        month: 1,
        grand_total: 1250.75,
        categories: [
          {
            category: 'food',
            total: 450.25,
            count: 12,
            average: 37.52
          }
        ]
      }

      cy.intercept('GET', '/api/expenses*', {
        statusCode: 200,
        body: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        }
      }).as('getExpenses')

      cy.intercept('GET', '/api/expenses/summary*', {
        statusCode: 200,
        body: mockSummary
      }).as('getSummary')

      cy.visit('/dashboard')
      cy.wait('@getExpenses')
      cy.wait('@getSummary')
      
      // Check if PDF export button is visible
      cy.get('button').should('contain', 'Export PDF')
    })
  })

  describe('Navigation', () => {
    it('should navigate to different sections from dashboard', () => {
      cy.intercept('GET', '/api/expenses*', {
        statusCode: 200,
        body: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        }
      }).as('getExpenses')

      cy.intercept('GET', '/api/expenses/summary*', {
        statusCode: 200,
        body: {
          year: 2024,
          month: 1,
          grand_total: 0,
          categories: []
        }
      }).as('getSummary')

      cy.visit('/dashboard')
      cy.wait('@getExpenses')
      cy.wait('@getSummary')
      
      // Test navigation to expenses
      cy.get('a[href="/expenses"]').click()
      cy.url().should('include', '/expenses')
      
      // Test navigation to add expense
      cy.visit('/dashboard')
      cy.get('a[href="/expenses/new"]').click()
      cy.url().should('include', '/expenses/new')
    })
  })
