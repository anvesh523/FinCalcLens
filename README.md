# FinCalcLens — Smart Financial Calculators

FinCalcLens is a comprehensive suite of financial calculators designed to help you make informed decisions about your personal finances. From investment planning and loan management to tax estimation and retirement goals, FinCalcLens offers a wide range of tools with a clean and intuitive interface.

## Features

-   **Wide Range of Calculators:** Over 25 calculators covering Investments, Loans, Taxes, and Financial Planning.
-   **Detailed Breakdowns:** Get step-by-step explanations and formula breakdowns for every calculation.
-   **Search Functionality:** Quickly find the calculator you need with the built-in search bar.
-   **Responsive Design:** Works seamlessly on both desktop and mobile devices.
-   **Privacy Focused:** All calculations are performed locally in your browser. No data is sent to any server.

## Calculator Categories

### 📈 Investments
-   **SIP Calculator:** Systematic Investment Plan future value with step-up options.
-   **SWP Calculator:** Systematic Withdrawal Plan duration and balance analysis.
-   **Lumpsum & FD/RD:** Calculate returns on one-time and recurring deposits.
-   **Government Schemes:** Specialized calculators for PPF (Public Provident Fund), NPS (National Pension System), and SSY (Sukanya Samriddhi Yojana).
-   **Mutual Fund Returns:** Compute absolute and annualized returns.

### 💰 Financial Indicators
-   **CAGR & ROI:** Measure growth and profitability of your investments.
-   **Interest Calculators:** Simple and Compound interest tools.
-   **Inflation Impact:** Understand the real value of money over time.
-   **Stock Returns:** Calculate net profit/loss including brokerage and taxes.
-   **Gratuity:** Estimate gratuity eligibility and amount.

### 🏠 Loans & EMI
-   **EMI Calculator:** Standard Monthly Installment calculator.
-   **Loan Comparison:** Compare two loan offers side-by-side to find the best deal.
-   **Prepayment Impact:** See how much interest you save by prepaying part of your loan.
-   **Loan Tenure:** specific calculators for tenure adjustment.

### 📝 Tax
-   **Income Tax Estimator:** Approximate tax liability based on the latest tax slabs (New Regime FY 24-25).
-   **Capital Gains:** Estimate LTCG and STCG for Equity and Debt.
-   **GST & TDS:** Quick utility tools for tax calculations.

### 🎯 Savings & Planning
-   **Retirement Planning:** Calculate required corpus and monthly savings needed.
-   **FIRE Calculator:** Estimate corpus for Financial Independence, Retire Early.
-   **Emergency Fund:** Determine the ideal safety net based on monthly expenses.
-   **Monthly Budget:** 50-30-20 rule implementation for better expense management.

## Getting Started

1.  Clone the repository or download the source code.
2.  Open `index.html` in any modern web browser.
3.  Select a calculator from the sidebar or use the search bar to begin.

## Technologies Used

-   **HTML5 & CSS3:** For a responsive, modern UI with a dark theme.
-   **JavaScript (ES6+):** Core application logic, form handling, and calculation engines.
-   **[Chart.js](https://www.chartjs.org/) (v4.4.1):** Used for interactive data visualization and result analysis.
-   **[Feather Icons](https://feathericons.com/):** For clean, consistent iconography throughout the app.

## Project Structure

```text
FinCalcLens/
├── assets/             # Images, logos, and static assets
├── css/
│   └── styles.css      # Core application styling and theme
├── js/
│   └── app.js          # Calculator definitions and app logic
├── index.html          # Application entry point
└── README.md           # Documentation
```

- **index.html**: The main layout, sidebar, and container for the dynamic calculator views.
- **css/styles.css**: Contains the design system, including CSS variables for the color palette and layout components.
- **js/app.js**: The heart of the application. It contains the `CALCULATORS` array and the rendering/calculation engine.

## Developer Guide

### Making Changes
To modify the application's appearance or behavior:
1. **Styling**: Update `css/styles.css` for global styles or specific component classes.
2. **Logic**: Core app behavior (like search or tab switching) is handled in the bottom half of `js/app.js`.

### Adding a New Calculator
Calculators are defined as objects within the `CALCULATORS` array in `js/app.js`. To add a new one, follow this schema:

```javascript
{
    id: 'unique_id',
    title: 'Display Title',
    category: 'Category Name', // e.g., 'Investments', 'Loans'
    description: 'Brief explanation of what it does.',
    formula: 'Formula to display to the user.',
    inputs: [
        { 
            id: 'input_name', 
            label: 'Field Label', 
            type: 'number', // or 'select'
            placeholder: 'e.g. 5000', 
            default: 1000 
        }
    ],
    calculate: (data) => {
        // 'data' contains values from the inputs
        const value = Number(data.input_name);
        const result = value * 1.1; // Your logic
        
        return {
            total: result,
            steps: `Step-by-step logic description for the user.`
        };
    }
}
```

#### Return Object Schema
The `calculate` function should return an object that `displayResult` can interpret. Common keys include:
- `fv`, `maturity`, `total`, `emi`: Main numeric results (formatted as currency).
- `interest`, `savings`: Secondary numeric results.
- `steps`: String describing the calculation process.
- `cagr`, `roi`: Percentage values.

## License

This project is open-source and available for personal and educational use.
