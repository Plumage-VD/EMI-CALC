# Plumage Capital Strategy Lab - Product Requirements Document

## Overview
A production-ready fintech web application for Indian users to simulate and optimize loan repayment strategies, comparing standard repayment against various prepayment approaches.

## Branding
- **Name**: Capital Strategy Lab
- **Byline**: by Plumage Consultancy
- **Primary Color**: Gold (#D4AF37)
- **Footer Link**: www.plumageconsultancy.com

## Tech Stack
- **Frontend**: React (Create React App), Tailwind CSS, Recharts, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (currently stateless - not using DB for core simulation)
- **Auth**: Mock auth system (Supabase integration pending)

## Core Features

### EMI Simulator (COMPLETE)
- Basic loan inputs: amount, interest rate, tenure, start date, loan type
- Processing fee support
- EMI adjustment (increase EMI above standard)
- Standard loan summary with calculated EMI

### Prepayment Strategies (COMPLETE)
- **Periodic Payments**: Monthly, quarterly, half-yearly, yearly recurring prepayments
- **Adhoc Lump Sum**: One-time prepayments on specific dates
- **Prepayment Charges**: Percentage-based and fixed fee options
- **Bank Preference**: Reduce tenure vs reduce EMI

### Prepay vs Invest Module (COMPLETE)
- Compare prepaying loan vs investing the same amounts
- Investment future value calculation with configurable return rate
- **Breakdown by source**: EMI adjustment, periodic payments, adhoc payments (each tracked independently)
- Clear recommendation: Prepay or Invest

### Visualizations (COMPLETE)
1. **Outstanding Balance Chart**: Area chart comparing original vs optimized loan balance over time
2. **Yearly Breakdown Chart**: Stacked area chart showing interest vs principal composition per year
3. **Cumulative Interest Comparison Chart**: Line chart with THREE lines:
   - Original Loan Interest (gray)
   - With Prepayments (gold)
   - Net Cost (Invest Strategy) - blue dashed line showing interest minus investment returns
   - **Green shaded zone** showing investment gains
   - **Final values summary** below chart (Original/Optimized/Net Cost)
   - **Clearer axes** with Y-axis label "Interest (₹)"

### Authentication System (COMPLETE - MOCKED)
- **Auth Teaser**: Non-authenticated users see blurred preview of advanced features
- **"Sign in to Unlock"** button triggers auth modal
- **Auth Modal**: Google OAuth + Email/Password options (+ Phone required for signup)
- **Mock Auth**: Currently simulated - ready for Supabase integration
- **User Indicator**: Shows user name in navbar with sign-out option

### Export Features (COMPLETE)
- Excel export with full amortization schedule
- PDF export with summary report

### UI/UX (COMPLETE)
- Premium dark/gold theme
- Dark mode toggle
- Collapsible advanced options section (gated behind auth)
- Responsive design
- Glass-morphism effects
- Magical, engaging homepage copy

## API Endpoints

### POST /api/simulate
Main simulation endpoint

### POST /api/export/excel
Generates Excel amortization schedule

### POST /api/export/pdf
Generates PDF summary report

## Implementation Status

### Completed (Dec 2025)
- [x] Core EMI simulation engine
- [x] Prepayment strategies (periodic, adhoc)
- [x] Investment comparison with FV breakdown by source
- [x] All three visualization charts with improvements
- [x] "Net Cost (Invest Strategy)" line with green benefit zone
- [x] Excel and PDF export
- [x] Premium UI with dark mode
- [x] Auth teaser UI with mock auth system
- [x] Engaging homepage copy
- [x] Full backend test suite (19 tests, 100% pass)

### P0 - Next Priority
- [ ] Integrate Supabase for real authentication
  - User credentials needed: Project URL + Anon Key
  - Enable: Email/Password + Google OAuth
  - Required field: Phone number

### P1 - Upcoming
- [ ] Tax Impact Module for home loans
- [ ] Save/compare multiple loan scenarios (requires auth)

### P2 - Future
- [ ] Refinancing Analyzer page
- [ ] Rent-vs-Buy Calculator page
- [ ] Premium features/monetization

## Key Files
- `/app/backend/services/loan_simulator.py` - Core simulation engine
- `/app/frontend/src/components/simulator/ResultsDashboard.js` - Results display with charts
- `/app/frontend/src/pages/EMISimulator.js` - Main simulator page
- `/app/frontend/src/components/simulator/AdvancedOptionsToggle.js` - Auth-gated advanced options
- `/app/frontend/src/components/AuthModal.js` - Authentication modal
- `/app/frontend/src/context/AuthContext.js` - Auth state management

## Testing
- Backend: `/app/backend/tests/test_loan_simulation.py` (19 tests)
- Test Reports: `/app/test_reports/iteration_3.json`
