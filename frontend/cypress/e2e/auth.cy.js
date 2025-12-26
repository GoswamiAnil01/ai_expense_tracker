describe('Authentication', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Login', () => {
    it('should display login form', () => {
      cy.visit('/auth/login')
      
      cy.get('h2').should('contain', 'Sign in to your account')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.get('a[href="/auth/register"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth/login')
      
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Email is required')
      cy.get('text').should('contain', 'Password is required')
    })

    it('should show validation error for invalid email', () => {
      cy.visit('/auth/login')
      
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Invalid email address')
    })

    it('should show validation error for short password', () => {
      cy.visit('/auth/login')
      
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('123')
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Password must be at least 6 characters')
    })

    it('should redirect to dashboard on successful login', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          access_token: 'fake-jwt-token',
          refresh_token: 'fake-refresh-token',
          user: {
            id: 1,
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      }).as('loginRequest')

      cy.visit('/auth/login')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@loginRequest')
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
    })

    it('should show error message for invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          detail: 'Invalid credentials'
        }
      }).as('loginRequest')

      cy.visit('/auth/login')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@loginRequest')
      cy.get('text').should('contain', 'Invalid credentials')
    })
  })

  describe('Registration', () => {
    it('should display registration form', () => {
      cy.visit('/auth/register')
      
      cy.get('h2').should('contain', 'Create your account')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="confirmPassword"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      cy.get('a[href="/auth/login"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/auth/register')
      
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Email is required')
      cy.get('text').should('contain', 'Password is required')
      cy.get('text').should('contain', 'Please confirm your password')
    })

    it('should show validation error for password mismatch', () => {
      cy.visit('/auth/register')
      
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('differentpassword')
      cy.get('button[type="submit"]').click()
      
      cy.get('text').should('contain', 'Passwords do not match')
    })

    it('should redirect to dashboard on successful registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          access_token: 'fake-jwt-token',
          refresh_token: 'fake-refresh-token',
          user: {
            id: 1,
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      }).as('registerRequest')

      cy.visit('/auth/register')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@registerRequest')
      cy.url().should('include', '/dashboard')
      cy.get('h1').should('contain', 'Dashboard')
    })

    it('should show error message for existing email', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 400,
        body: {
          detail: 'Email already registered'
        }
      }).as('registerRequest')

      cy.visit('/auth/register')
      cy.get('input[name="email"]').type('existing@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('password123')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@registerRequest')
      cy.get('text').should('contain', 'Email already registered')
    })
  })

  describe('Logout', () => {
    it('should logout and redirect to home', () => {
      // First login
      cy.login('test@example.com', 'password123')
      
      // Then logout
      cy.get('button').contains('Logout').click()
      
      cy.url().should('not.include', '/dashboard')
      cy.get('a[href="/auth/login"]').should('be.visible')
    })
  })
})
