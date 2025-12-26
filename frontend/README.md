# AI Expense Tracker Frontend

A modern React + TypeScript frontend application for the AI Expense Tracker, providing an intuitive interface for managing personal expenses with AI-powered receipt processing.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Expense Management**: Create, view, edit, and delete expense records
- **Receipt Upload**: Drag-and-drop interface for receipt images
- **OCR Integration**: Automatic expense data extraction from receipts
- **Dashboard**: Visual expense analytics with charts and graphs
- **PDF Export**: Export expense reports as PDF documents
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF for report exports
- **File Upload**: React Dropzone for receipt images
- **Testing**: Cypress for end-to-end testing

## Key Components

- **Authentication System**: Login, registration, and protected routes
- **Dashboard**: Overview with expense statistics and charts
- **Expense Form**: Add/edit expenses with category management
- **Expense List**: View and manage all expenses with filtering
- **Receipt Upload**: OCR processing for automatic data extraction
- **Profile Management**: User settings and preferences

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Cypress tests

## Testing

Run end-to-end tests with Cypress:
```bash
npm run test:e2e
```

## Docker

Build and run with Docker:
```bash
docker build -t ai-expense-tracker-frontend .
docker run -p 3000:3000 ai-expense-tracker-frontend
```

## Deployment

The application is configured for deployment on:
- **Vercel**: Using `vercel.json` configuration
- **Docker**: Using provided Dockerfile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
