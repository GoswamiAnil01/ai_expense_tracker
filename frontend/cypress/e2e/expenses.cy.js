
describe('Expense Management', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    // Login before each test
    cy.login('test@example.com', 'password123')
  })

  describe('Expense List', () => {
    it('should display expenses page', () => {
      cy.visit('/expenses')
      
      cy.get('h1').should('contain', 'Expenses')
      cy.get('a[href="/expenses/new"]').should('be.visible')
      cy.get('input[placeholder="Search expenses..."]').should('be.visible')
      cy.get('select').should('be.visible')
    })

    it('should display no expenses message when empty', () => {
      cy.intercept('GET', '/api/expenses*', {
        statusCode: 200,
        body: {
          items: [],
          total: 0,
          page: 1,
          limit: 20
        }
      }).as('getExpenses')

      cy.visit('/expenses')
      cy.wait('@getExpenses')
      
      cy.get('text').should('contain', 'No expenses found')
      cy.get('text').should('contain', 'Get started by adding your first expense')
    })

    it('should display expenses when data exists', () => {
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
          limit: 20
        }
      }).as('getExpenses')

      cy.visit('/expenses')
      cy.wait('@getExpenses')
      
      cy.get('table').should('be.visible')
      cy.get('tbody tr').should('have.length', 2)
      cy.get('text').should('contain', 'Lunch at restaurant')
      cy.get('text').should('contain', 'Uber ride')
      cy.get('text').should('contain', '$25.50')
      cy.get('text').should('contain', '$45.00')
    })

    it('should filter expenses by category', () => {
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
          items: [mockExpenses[0]], // Only food expense
          total: 1,
          page: 1,
          limit: 20
        }
      }).as('getFilteredExpenses')

      cy.visit('/expenses')
      cy.get('select').select('food')
      cy.wait('@getFilteredExpenses')
      
      cy.get('tbody tr').should('have.length', 1)
      cy.get('text').should('contain', 'Lunch at restaurant')
      cy.get('text').should('not.contain', 'Uber ride')
    })

    it('should search expenses', () => {
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
          items: [mockExpenses[1]], // Only travel expense
          total: 1,
          page: 1,
          limit: 20
        }
      }).as('getSearchedExpenses')

      cy.visit('/expenses')
      cy.get('input[placeholder="Search expenses..."]').type('uber')
      cy.wait('@getSearchedExpenses')
      
      cy.get('tbody tr').should('have.length', 1)
      cy.get('text').should('contain', 'Uber ride')
      cy.get('text').should('not.contain', 'Lunch at restaurant')
    })

    it('should delete an expense', () => {
      const mockExpenses = [
        {
          id: 1,
          amount: 25.50,
          category: 'food',
          date: '2024-01-15T00:00:00Z',
          notes: 'Lunch at restaurant'
        }
      ]

      cy.intercept('GET', '/api/expenses*', {
        statusCode: 200,
        body: {
          items: mockExpenses,
          total: 1,
          page: 1,
          limit: 20
        }
      }).as('getExpenses')

      cy.intercept('DELETE', '/api/expenses/1', {
        statusCode: 200,
        body: { message: 'Expense deleted successfully' }
      }).as('deleteExpense')

      cy.visit('/expenses')
      cy.wait('@getExpenses')
      
      cy.get('button').contains('Delete').click()
      cy.on('window:confirm', () => true)
      cy.wait('@deleteExpense')
      
      // Should show no expenses after deletion
      cy.get('text').should('contain', 'No expenses found')
    })
  })

  describe('Expense Form', () => {
    it('should display expense form', () => {
      cy.visit('/expenses/new')
      
      cy.get('h1').should('contain', 'Add New Expense')
      cy.get('input[name="amount"]').should('be.visible')
      cy.get('select[name="category"]').should('be.visible')
      cy.get('input[name="date"]').should('be.visible')
      cy.get('textarea[name="notes"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show validation errors for empty required fields', () => {
      cy.visit('/expenses/new')
      
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Amount is required')
      cy.get('text').should('contain', 'Category is required')
      cy.get('text').should('contain', 'Date is required')
    })

    it('should create a new expense successfully', () => {
      cy.intercept('POST', '/api/expenses', {
        statusCode: 201,
        body: {
          id: 1,
          amount: 25.50,
          category: 'food',
          date: '2024-01-15',
          notes: 'Test expense'
        }
      }).as('createExpense')

      cy.visit('/expenses/new')
      cy.get('input[name="amount"]').type('25.50')
      cy.get('select[name="category"]').select('food')
      cy.get('input[name="date"]').type('2024-01-15')
      cy.get('textarea[name="notes"]').type('Test expense')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@createExpense')
      cy.url().should('include', '/expenses')
      cy.get('text').should('contain', 'Test expense')
    })

    it('should handle receipt upload', () => {
      cy.visit('/expenses/new')
      
      const fileName = 'receipt.jpg'
      cy.fixture(fileName).then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: fileName,
          mimeType: 'image/jpeg'
        })
      })
      
      cy.get('text').should('contain', 'receipt.jpg')
      cy.get('text').should('contain', 'OCR processed successfully')
    })

    it('should show error on failed expense creation', () => {
      cy.intercept('POST', '/api/expenses', {
        statusCode: 400,
        body: {
          detail: 'Invalid expense data'
        }
      }).as('createExpenseFailed')

      cy.visit('/expenses/new')
      cy.get('input[name="amount"]').type('25.50')
      cy.get('select[name="category"]').select('food')
      cy.get('input[name="date"]').type('2024-01-15')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@createExpenseFailed')
      cy.get('text').should('contain', 'Invalid expense data')
    })
  })

  describe('Expense Edit', () => {
    it('should display edit form with existing data', () => {
      cy.intercept('GET', '/api/expenses/1', {
        statusCode: 200,
        body: {
          id: 1,
          amount: 25.50,
          category: 'food',
          date: '2024-01-15',
          notes: 'Test expense'
        }
      }).as('getExpense')

      cy.visit('/expenses/1/edit')
      cy.wait('@getExpense')
      
      cy.get('h1').should('contain', 'Edit Expense')
      cy.get('input[name="amount"]').should('have.value', '25.5')
      cy.get('select[name="category"]').should('have.value', 'food')
      cy.get('input[name="date"]').should('have.value', '2024-01-15')
      cy.get('textarea[name="notes"]').should('have.value', 'Test expense')
    })

    it('should update expense successfully', () => {
      cy.intercept('GET', '/api/expenses/1', {
        statusCode: 200,
        body: {
          id: 1,
          amount: 25.50,
          category: 'food',
          date: '2024-01-15',
          notes: 'Test expense'
        }
      }).as('getExpense')

      cy.intercept('PUT', '/api/expenses/1', {
        statusCode: 200,
        body: {
          id: 1,
          amount: 35.50,
          category: 'food',
          date: '2024-01-15',
          notes: 'Updated expense'
        }
      }).as('updateExpense')

      cy.visit('/expenses/1/edit')
      cy.wait('@getExpense')
      
      cy.get('input[name="amount"]').clear().type('35.50')
      cy.get('textarea[name="notes"]').clear().type('Updated expense')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@updateExpense')
      cy.url().should('include', '/expenses')
    })
  })
})
