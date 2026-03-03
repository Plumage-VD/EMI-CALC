import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingDown, TrendingUp, Calendar, DollarSign, FileText, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { formatIndianCurrency, formatIndianNumber, formatChartAxis } from '../../lib/formatters';

export const ResultsDashboard = ({ results, loanData }) => {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const { original, optimized, savings, investment_analysis } = results;

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData)
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loan_amortization.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData)
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loan_summary.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setExportingPdf(false);
    }
  };

  // Prepare chart data
  const outstandingChartData = [];
  const maxLength = Math.max(results.original_schedule.length, results.optimized_schedule.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalEntry = results.original_schedule[i];
    const optimizedEntry = results.optimized_schedule[i];
    
    outstandingChartData.push({
      month: i + 1,
      original: originalEntry ? originalEntry.closing_balance : 0,
      optimized: optimizedEntry ? optimizedEntry.closing_balance : 0
    });
  }

  // Interest vs Principal per year
  const yearlyData = [];
  const optimizedSchedule = results.optimized_schedule;
  
  let currentYear = 1;
  let yearInterest = 0;
  let yearPrincipal = 0;
  
  optimizedSchedule.forEach((entry, index) => {
    yearInterest += entry.interest;
    yearPrincipal += entry.total_principal;
    
    if ((index + 1) % 12 === 0 || index === optimizedSchedule.length - 1) {
      yearlyData.push({
        year: currentYear,
        interest: Math.round(yearInterest),
        principal: Math.round(yearPrincipal)
      });
      currentYear++;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  });

  // Cumulative interest comparison with accurate compound interest calculation
  const cumulativeInterestData = [];
  let originalCumulative = 0;
  let optimizedCumulative = 0;
  
  // Pre-calculate investment growth at each month for accurate chart
  const monthlyInvestmentFV = [];
  if (investment_analysis.enabled && investment_analysis.investment_return_rate > 0) {
    const monthlyReturn = investment_analysis.investment_return_rate / 1200;
    const originalTenure = results.original_schedule.length;
    
    // Track investments made each month from optimized schedule
    const investmentsByMonth = {};
    results.optimized_schedule.forEach(entry => {
      if (entry.extra_principal > 0) {
        investmentsByMonth[entry.month] = (investmentsByMonth[entry.month] || 0) + entry.extra_principal;
      }
    });
    
    // Calculate cumulative FV at each month using compound interest
    for (let month = 1; month <= originalTenure; month++) {
      let totalFV = 0;
      // For each investment made up to this month, calculate its FV
      for (let investMonth = 1; investMonth <= month; investMonth++) {
        if (investmentsByMonth[investMonth]) {
          const monthsCompounded = month - investMonth;
          const fv = investmentsByMonth[investMonth] * Math.pow(1 + monthlyReturn, monthsCompounded);
          totalFV += fv;
        }
      }
      monthlyInvestmentFV[month] = totalFV;
    }
  }
  
  for (let i = 0; i < maxLength; i++) {
    const originalEntry = results.original_schedule[i];
    const optimizedEntry = results.optimized_schedule[i];
    
    if (originalEntry) originalCumulative += originalEntry.interest;
    if (optimizedEntry) optimizedCumulative += optimizedEntry.interest;
    
    // Calculate net interest if investing (interest paid - investment gains earned)
    let netInterestAfterInvestment = originalCumulative;
    let investmentGain = 0;
    if (investment_analysis.enabled && investment_analysis.investment_return_rate > 0) {
      const month = i + 1;
      const totalFV = monthlyInvestmentFV[month] || 0;
      // Investment gain = FV - principal invested up to this point
      let principalInvested = 0;
      results.optimized_schedule.forEach(entry => {
        if (entry.month <= month && entry.extra_principal > 0) {
          principalInvested += entry.extra_principal;
        }
      });
      investmentGain = totalFV - principalInvested;
      netInterestAfterInvestment = originalCumulative - investmentGain;
    }
    
    if ((i + 1) % 12 === 0 || i === maxLength - 1) {
      cumulativeInterestData.push({
        month: i + 1,
        original: Math.round(originalCumulative),
        optimized: Math.round(optimizedCumulative),
        netAfterInvestment: Math.round(netInterestAfterInvestment),
        investmentGain: Math.round(investmentGain)
      });
    }
  }

  // Net Wealth Comparison (only if invest is recommended and enabled)
  const wealthComparisonData = [];
  if (investment_analysis.enabled && investment_analysis.recommendation === 'Invest') {
    const originalSchedule = results.original_schedule;
    const originalTenure = originalSchedule.length;
    
    // Build cumulative investment corpus over original tenure
    let cumulativeInvestment = 0;
    const investmentByMonth = {};
    
    // Track all prepayments by month
    results.optimized_schedule.forEach(entry => {
      if (entry.extra_principal > 0) {
        investmentByMonth[entry.month] = (investmentByMonth[entry.month] || 0) + entry.extra_principal;
      }
    });
    
    // Calculate wealth for each year
    for (let year = 1; year <= Math.ceil(originalTenure / 12); year++) {
      const month = year * 12;
      
      // Prepay strategy wealth (after optimized tenure, debt-free)
      let prepayWealth = 0;
      if (month > optimized.actual_tenure) {
        // Debt-free! Wealth = Interest saved
        prepayWealth = savings.interest_saved;
      }
      
      // Invest strategy wealth
      let investWealth = 0;
      // Calculate cumulative investment FV up to this month
      for (let m = 1; m <= month; m++) {
        if (investmentByMonth[m]) {
          const monthsRemaining = originalTenure - m;
          const monthlyReturn = investment_analysis.investment_return_rate / 1200;
          const fv = investmentByMonth[m] * Math.pow(1 + monthlyReturn, monthsRemaining);
          investWealth += fv;
        }
      }
      // At end, subtract total interest paid on original loan
      if (month >= originalTenure) {
        investWealth -= original.total_interest;
      }
      
      wealthComparisonData.push({
        year,
        prepay: Math.round(prepayWealth),
        invest: Math.round(investWealth),
        difference: Math.round(investWealth - prepayWealth)
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2" data-testid="results-title">
            Simulation Results
          </h2>
          <p className="text-lg text-stone-600">
            Compare your original vs optimized loan scenario
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="rounded-full bg-emerald-900 hover:bg-emerald-800"
            data-testid="export-excel-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportingExcel ? 'Exporting...' : 'Excel'}
          </Button>
          <Button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="rounded-full bg-amber-600 hover:bg-amber-700"
            data-testid="export-pdf-btn"
          >
            <FileText className="w-4 h-4 mr-2" />
            {exportingPdf ? 'Exporting...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card glass-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full" data-testid="emi-badge">
              Monthly
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">EMI Amount</p>
          <p className="text-3xl font-black bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent" data-testid="optimized-emi">
            ₹{formatIndianNumber(Math.round(optimized.emi))}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            vs ₹{formatIndianNumber(Math.round(original.emi))} original
          </p>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full" data-testid="tenure-badge">
              Saved
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Time Saved</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400" data-testid="years-saved">
            {savings.years_saved} years
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {savings.months_saved} months earlier
          </p>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full" data-testid="interest-badge">
              Saved
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Interest Saved</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400" data-testid="interest-saved">
            {formatIndianCurrency(savings.interest_saved)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            vs {formatIndianCurrency(original.total_interest)} original
          </p>
        </Card>

        <Card className="stat-card glass-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full" data-testid="charges-badge">
              Fees
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Prepayment Charges</p>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400" data-testid="prepayment-charges">
            ₹{formatIndianNumber(Math.round(optimized.prepayment_charges))}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Total fees paid
          </p>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card className="p-6 glass-card">
        <h3 className="text-xl font-bold mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="comparison-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Metric</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Original</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Optimized</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-sm text-foreground">EMI</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">₹{formatIndianNumber(Math.round(original.emi))}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">₹{formatIndianNumber(Math.round(optimized.emi))}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">-</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-sm text-foreground">Tenure (months)</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">{original.actual_tenure}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">{optimized.actual_tenure}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-green-600 dark:text-green-400">{savings.months_saved}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-sm text-foreground">Total Interest</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">{formatIndianCurrency(original.total_interest)}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">{formatIndianCurrency(optimized.total_interest)}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-green-600 dark:text-green-400">{formatIndianCurrency(savings.interest_saved)}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 text-sm text-foreground">Prepayment Charges</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">₹0</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-foreground">₹{formatIndianNumber(Math.round(optimized.prepayment_charges))}</td>
                <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">-</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="py-3 px-4 text-sm font-semibold text-foreground">Total Repayment</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-foreground">{formatIndianCurrency(original.total_repayment)}</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-foreground">{formatIndianCurrency(optimized.total_repayment)}</td>
                <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-green-600 dark:text-green-400">{formatIndianCurrency(original.total_repayment - optimized.total_repayment)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Investment Analysis */}
      {investment_analysis.enabled && (
        <Card className="p-6 glass-card border-2 border-primary/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Prepay vs Invest Analysis</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Detailed breakdown of what your prepayments would earn if invested @ {investment_analysis.investment_return_rate}% p.a.
              </p>
              
              {/* Breakdown by Source */}
              {investment_analysis.breakdown && (
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Investment Returns Breakdown:</h4>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                      After {investment_analysis.tax_rate || 20}% Tax
                    </span>
                  </div>
                  
                  {investment_analysis.breakdown.emi_adjustment.invested > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">EMI Adjustment</span>
                        <span className="text-xs text-muted-foreground">
                          Extra EMI payments
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="font-mono font-semibold">{formatIndianCurrency(investment_analysis.breakdown.emi_adjustment.invested)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gross Gain</p>
                          <p className="font-mono font-semibold text-muted-foreground">{formatIndianCurrency(investment_analysis.breakdown.emi_adjustment.gain_pretax || investment_analysis.breakdown.emi_adjustment.gain)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax ({investment_analysis.tax_rate || 20}%)</p>
                          <p className="font-mono font-semibold text-red-500">-{formatIndianCurrency(investment_analysis.breakdown.emi_adjustment.tax || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net Value</p>
                          <p className="font-mono font-semibold text-green-600 dark:text-green-400">{formatIndianCurrency(investment_analysis.breakdown.emi_adjustment.future_value)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {investment_analysis.breakdown.periodic_payments.invested > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Periodic Payments</span>
                        <span className="text-xs text-muted-foreground">
                          Recurring prepayments
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="font-mono font-semibold">{formatIndianCurrency(investment_analysis.breakdown.periodic_payments.invested)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gross Gain</p>
                          <p className="font-mono font-semibold text-muted-foreground">{formatIndianCurrency(investment_analysis.breakdown.periodic_payments.gain_pretax || investment_analysis.breakdown.periodic_payments.gain)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax ({investment_analysis.tax_rate || 20}%)</p>
                          <p className="font-mono font-semibold text-red-500">-{formatIndianCurrency(investment_analysis.breakdown.periodic_payments.tax || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net Value</p>
                          <p className="font-mono font-semibold text-green-600 dark:text-green-400">{formatIndianCurrency(investment_analysis.breakdown.periodic_payments.future_value)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {investment_analysis.breakdown.adhoc_payments.invested > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Adhoc Lump Sum</span>
                        <span className="text-xs text-muted-foreground">
                          One-time payments
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="font-mono font-semibold">{formatIndianCurrency(investment_analysis.breakdown.adhoc_payments.invested)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gross Gain</p>
                          <p className="font-mono font-semibold text-muted-foreground">{formatIndianCurrency(investment_analysis.breakdown.adhoc_payments.gain_pretax || investment_analysis.breakdown.adhoc_payments.gain)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax ({investment_analysis.tax_rate || 20}%)</p>
                          <p className="font-mono font-semibold text-red-500">-{formatIndianCurrency(investment_analysis.breakdown.adhoc_payments.tax || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net Value</p>
                          <p className="font-mono font-semibold text-green-600 dark:text-green-400">{formatIndianCurrency(investment_analysis.breakdown.adhoc_payments.future_value)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tax Summary */}
                  {investment_analysis.total_tax_payable > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-amber-800 dark:text-amber-300">Total Tax on Investment Gains</span>
                        <span className="font-mono font-semibold text-amber-800 dark:text-amber-300">
                          {formatIndianCurrency(investment_analysis.total_tax_payable)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                <div>
                  <p className="text-sm mb-2">Investment Value (After Tax)</p>
                  <p className="text-3xl font-mono font-black bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                    {formatIndianCurrency(investment_analysis.investment_future_value)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    @ {investment_analysis.investment_return_rate}% returns, {investment_analysis.tax_rate || 20}% tax
                  </p>
                  {investment_analysis.investment_future_value_pretax && (
                    <p className="text-xs text-muted-foreground">
                      Pre-tax: {formatIndianCurrency(investment_analysis.investment_future_value_pretax)}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm mb-2">Interest Saved by Prepaying</p>
                  <p className="text-3xl font-mono font-black bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))] bg-clip-text text-transparent">
                    {formatIndianCurrency(savings.interest_saved)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Guaranteed savings (tax-free)</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-xl border-2 ${investment_analysis.recommendation === 'Invest' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className={`w-5 h-5 ${investment_analysis.recommendation === 'Invest' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  <p className={`font-bold text-lg ${investment_analysis.recommendation === 'Invest' ? 'text-green-900 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'}`}>
                    Recommendation: {investment_analysis.recommendation}
                  </p>
                </div>
                <p className={`text-sm ${investment_analysis.recommendation === 'Invest' ? 'text-green-800 dark:text-green-400' : 'text-blue-800 dark:text-blue-400'}`}>
                  {investment_analysis.recommendation === 'Invest' 
                    ? `Investing (after ${investment_analysis.tax_rate || 20}% tax) could yield ${formatIndianCurrency(Math.abs(investment_analysis.difference))} MORE than prepaying.`
                    : `Prepaying saves you ${formatIndianCurrency(Math.abs(investment_analysis.difference))} MORE than investing at ${investment_analysis.investment_return_rate}% (after tax).`
                  }
                </p>
              </div>
              
              {/* Disclaimer */}
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-700 dark:text-slate-300">Disclaimer:</strong> The tax rate used ({investment_analysis.tax_rate || 20}%) is indicative. 
                  Actual tax rates may vary from <strong>10% to 40%</strong> (Maximum Marginal Rate including Surcharge & Cess) 
                  depending on the investment type, holding period, and your income tax slab. 
                  This analysis assumes the investment remains until the end of the original loan tenure and is withdrawn only at maturity. 
                  <strong> In case of early withdrawals, actual returns and tax implications may vary significantly.</strong> 
                  Please consult a qualified tax advisor for personalized advice.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      <Card className="p-6 glass-card">
        <Tabs defaultValue="outstanding" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-muted/50">
            <TabsTrigger value="outstanding" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="outstanding-chart-tab">
              Outstanding Balance
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="yearly-chart-tab">
              Yearly Breakdown
            </TabsTrigger>
            <TabsTrigger value="cumulative" className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="cumulative-chart-tab">
              Cumulative Interest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outstanding" className="mt-8">
            <h3 className="text-lg font-bold mb-6">Outstanding Principal Over Time</h3>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={outstandingChartData}>
                <defs>
                  <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-gold))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--brand-gold))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatIndianCurrency(value), '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="original" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2.5}
                  fill="url(#colorOriginal)" 
                  name="Original Loan"
                />
                <Area 
                  type="monotone" 
                  dataKey="optimized" 
                  stroke="hsl(var(--brand-gold))" 
                  strokeWidth={3}
                  fill="url(#colorOptimized)" 
                  name="Optimized Loan"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yearly" className="mt-8">
            <h3 className="text-lg font-bold mb-6">Interest vs Principal Composition Per Year</h3>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="areaInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="areaPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-gold-light))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--brand-gold))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="year" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatChartAxis(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [formatIndianCurrency(value), name]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="interest" 
                  stackId="1"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="url(#areaInterest)" 
                  name="Interest Paid" 
                />
                <Area 
                  type="monotone" 
                  dataKey="principal" 
                  stackId="1"
                  stroke="hsl(var(--brand-gold))" 
                  strokeWidth={2}
                  fill="url(#areaPrincipal)" 
                  name="Principal Paid" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cumulative" className="mt-8">
            <h3 className="text-lg font-bold mb-6">Cumulative Interest Comparison</h3>
            {investment_analysis.enabled && (
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700"></div>
                  <span className="text-muted-foreground">Green zone = Net benefit from investing</span>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={cumulativeInterestData}>
                <defs>
                  <linearGradient id="lineOriginal" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--muted-foreground))" />
                    <stop offset="100%" stopColor="hsl(var(--muted-foreground))" opacity={0.6} />
                  </linearGradient>
                  <linearGradient id="lineOptimized" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--brand-gold))" />
                    <stop offset="100%" stopColor="hsl(var(--brand-gold-light))" />
                  </linearGradient>
                  <linearGradient id="fillNetBenefit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1.5 }}
                  label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1.5 }}
                  tickFormatter={(value) => formatChartAxis(value)}
                  label={{ value: 'Interest (₹)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Investment Gain') {
                      return [formatIndianCurrency(value), 'Your Investment Gain'];
                    }
                    return [formatIndianCurrency(value), name];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '2px solid hsl(var(--border))', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, marginBottom: '8px' }}
                  labelFormatter={(month) => `Year ${Math.ceil(month/12)}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                {/* Investment Gain shaded area - shows benefit zone */}
                {investment_analysis.enabled && (
                  <Area 
                    type="monotone" 
                    dataKey="investmentGain" 
                    fill="url(#fillNetBenefit)" 
                    stroke="#10b981"
                    strokeWidth={0}
                    name="Investment Gain" 
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="original" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2.5}
                  fill="none"
                  name="Original Loan Interest" 
                />
                <Area 
                  type="monotone" 
                  dataKey="optimized" 
                  stroke="hsl(var(--brand-gold))" 
                  strokeWidth={3}
                  fill="none"
                  name="With Prepayments" 
                />
                {investment_analysis.enabled && (
                  <Area 
                    type="monotone" 
                    dataKey="netAfterInvestment" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    fill="none"
                    name="Net Cost (Invest Strategy)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Final values summary */}
            {investment_analysis.enabled && cumulativeInterestData.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Original Total Interest</p>
                  <p className="text-xl font-bold font-mono">{formatIndianCurrency(cumulativeInterestData[cumulativeInterestData.length-1]?.original)}</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">With Prepayments</p>
                  <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">{formatIndianCurrency(cumulativeInterestData[cumulativeInterestData.length-1]?.optimized)}</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Net Cost (Invest Strategy)</p>
                  <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatIndianCurrency(cumulativeInterestData[cumulativeInterestData.length-1]?.netAfterInvestment)}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Investment gain: {formatIndianCurrency(cumulativeInterestData[cumulativeInterestData.length-1]?.investmentGain)}
                  </p>
                </div>
              </div>
            )}
            
            {investment_analysis.enabled && investment_analysis.recommendation === 'Invest' && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  <strong>Net Benefit:</strong> At loan end, investing saves you an additional {formatIndianCurrency(Math.abs(investment_analysis.difference))} compared to prepaying, 
                  because your investment returns ({formatIndianCurrency(investment_analysis.investment_future_value - investment_analysis.total_prepayments)}) exceed the extra interest paid.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Advisory Note */}
      {savings.interest_saved > 0 && (
        <Card className="p-6 border border-emerald-200 rounded-xl bg-emerald-50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Financial Advisory</h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                By implementing this optimized repayment strategy, you can save <strong>{formatIndianCurrency(savings.interest_saved)}</strong> in interest 
                and become loan-free <strong>{savings.years_saved} years</strong> earlier. This is a significant financial achievement that puts you on the path to true financial freedom. 
                Consider setting up automatic transfers for your periodic prepayments to stay on track.
              </p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default ResultsDashboard;
