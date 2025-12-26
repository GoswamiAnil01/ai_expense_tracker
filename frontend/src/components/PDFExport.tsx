import React from 'react'
import { jsPDF } from 'jspdf'
import type { ExpenseSummary } from '../store/api'

interface PDFExportProps {
  data?: ExpenseSummary | null
  className?: string
}

const PDFExport: React.FC<PDFExportProps> = ({ data, className = '' }) => {
  const generatePDF = () => {
    if (!data) {
      alert('No data available to export')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Set up fonts and colors
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246) // Primary blue color
    
    // Title
    doc.text('Expense Report', pageWidth / 2, 30, { align: 'center' })
    
    // Report period
    doc.setFontSize(14)
    doc.setTextColor(75, 85, 99) // Gray color
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const period = `${monthNames[data.month - 1]} ${data.year}`
    doc.text(`Period: ${period}`, pageWidth / 2, 45, { align: 'center' })
    
    // Grand total
    doc.setFontSize(16)
    doc.setTextColor(16, 185, 129) // Success green color
    doc.text(`Total Spending: $${data.grand_total.toFixed(2)}`, pageWidth / 2, 65, { align: 'center' })
    
    // Categories section
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55) // Dark gray color
    doc.text('Spending by Category', 20, 90)
    
    // Draw line under section title
    doc.setDrawColor(229, 231, 235) // Light gray
    doc.line(20, 95, pageWidth - 20, 95)
    
    // Category breakdown
    let yPosition = 110
    doc.setFontSize(12)
    
    data.categories.forEach((category) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 30
      }
      
      // Category name
      doc.setTextColor(55, 65, 81) // Medium gray
      doc.text(`${category.category.charAt(0).toUpperCase() + category.category.slice(1)}`, 30, yPosition)
      
      // Category total
      doc.setTextColor(59, 130, 246) // Primary blue
      doc.text(`$${category.total.toFixed(2)}`, pageWidth - 50, yPosition)
      
      // Transaction count and average
      doc.setTextColor(107, 114, 128) // Light gray
      doc.setFontSize(10)
      doc.text(`${category.count} transactions`, 30, yPosition + 6)
      doc.text(`Avg: $${category.average.toFixed(2)}`, pageWidth - 50, yPosition + 6)
      
      // Draw horizontal line
      doc.setDrawColor(243, 244, 246) // Very light gray
      doc.line(20, yPosition + 12, pageWidth - 20, yPosition + 12)
      
      yPosition += 20
      doc.setFontSize(12)
    })
    
    // Summary statistics
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 30
    }
    
    yPosition += 10
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55) // Dark gray
    doc.text('Summary Statistics', 20, yPosition)
    
    // Draw line under section title
    doc.setDrawColor(229, 231, 235) // Light gray
    doc.line(20, yPosition + 5, pageWidth - 20, yPosition + 5)
    
    yPosition += 20
    doc.setFontSize(12)
    doc.setTextColor(55, 65, 81) // Medium gray
    
    // Calculate statistics
    const totalTransactions = data.categories.reduce((sum, cat) => sum + cat.count, 0)
    const avgTransaction = data.grand_total / totalTransactions
    const topCategory = data.categories.reduce((prev, current) => 
      (prev.total > current.total) ? prev : current
    )
    
    doc.text(`Total Transactions: ${totalTransactions}`, 30, yPosition)
    yPosition += 15
    doc.text(`Average Transaction: $${avgTransaction.toFixed(2)}`, 30, yPosition)
    yPosition += 15
    doc.text(`Top Category: ${topCategory.category.charAt(0).toUpperCase() + topCategory.category.slice(1)} ($${topCategory.total.toFixed(2)})`, 30, yPosition)
    
    // Footer
    const footerY = pageHeight - 20
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175) // Light gray
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, footerY, { align: 'center' })
    doc.text('AI Expense Tracker', pageWidth / 2, footerY + 5, { align: 'center' })
    
    // Save the PDF
    const fileName = `expense-report-${data.year}-${data.month.toString().padStart(2, '0')}.pdf`
    doc.save(fileName)
  }

  return (
    <button
      onClick={generatePDF}
      disabled={!data}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export PDF
    </button>
  )
}

export default PDFExport
